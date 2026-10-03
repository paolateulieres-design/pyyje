"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser, requireRole } from "@/lib/auth-helpers";
import { notify } from "@/lib/notifications";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// WF1 — Envoi d'un pitch.
// formData contient : titre, resume (« Présentation du sujet » — fusionne
// résumé et angle depuis la revue produit), et pour chaque rédaction cochée
// redaction_<id> = "on" et rubrique_<id> = "<rubrique choisie>".
export async function createPitchAction(formData: FormData) {
  const { userId } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const titre = String(formData.get("titre") || "");
  const resume = String(formData.get("resume") || "");

  const redactionIds: { id: string; rubrique: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("redaction_") && value === "on") {
      const id = key.replace("redaction_", "");
      const rubrique = String(formData.get(`rubrique_${id}`) || "");
      redactionIds.push({ id, rubrique });
    }
  }

  if (!titre || redactionIds.length === 0) {
    redirect("/pigiste/pitchs/nouveau?error=champs_requis");
  }

  const { data: pitch, error } = await supabase
    .from("pitches")
    .insert({
      titre,
      resume,
      auteur: userId,
      date_creation: new Date().toISOString(),
      statut: "envoye",
    })
    .select()
    .single();

  if (error || !pitch) {
    redirect(`/pigiste/pitchs/nouveau?error=${encodeURIComponent(error?.message || "erreur")}`);
  }

  for (const r of redactionIds) {
    await supabase.from("pitch_envois").insert({
      pitch: pitch!.id,
      redaction: r.id,
      rubrique_ciblee: r.rubrique || null,
      date_envoi: new Date().toISOString(),
      statut: "envoye",
    });
    await notify(supabase, r.id, `Nouveau pitch reçu : « ${titre} »`, `/redaction/pitchs`);
  }

  redirect(`/pigiste/pitchs/${pitch!.id}`);
}

// WF3 — Le pigiste accepte une offre (un BonDeCommande) parmi celles reçues
// pour un Pitch donné.
export async function acceptOfferAction(bonDeCommandeId: string) {
  const { userId } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const { data: bc } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("id", bonDeCommandeId)
    .single();

  if (!bc || !bc.pitch_envoi) redirect("/pigiste/pitchs");

  const { data: pitchEnvoi } = await supabase
    .from("pitch_envois")
    .select("*")
    .eq("id", bc.pitch_envoi)
    .single();
  if (!pitchEnvoi) redirect("/pigiste/pitchs");

  const { data: pitch } = await supabase
    .from("pitches")
    .select("*")
    .eq("id", pitchEnvoi.pitch)
    .single();
  if (!pitch) redirect("/pigiste/pitchs");

  // Règle : un seul bon de commande actif par pitch.
  await supabase
    .from("bons_de_commande")
    .update({ statut: "accepte", pigiste: userId })
    .eq("id", bonDeCommandeId);

  await supabase
    .from("pitch_envois")
    .update({ statut: "accepte_par_pigiste" })
    .eq("id", pitchEnvoi.id);

  // Fermeture automatique des autres envois du même pitch.
  const { data: otherEnvois } = await supabase
    .from("pitch_envois")
    .select("*")
    .eq("pitch", pitch.id)
    .neq("id", pitchEnvoi.id)
    .neq("statut", "refuse");

  for (const envoi of otherEnvois || []) {
    await supabase.from("pitch_envois").update({ statut: "retire" }).eq("id", envoi.id);
    await supabase
      .from("bons_de_commande")
      .update({ statut: "retire" })
      .eq("pitch_envoi", envoi.id)
      .neq("statut", "retire");
    await notify(
      supabase,
      envoi.redaction,
      `Ce sujet ("${pitch.titre}") a été confié à une autre rédaction`,
      `/redaction/pitchs`
    );
  }

  await supabase.from("pitches").update({ statut: "en_cours" }).eq("id", pitch.id);

  revalidatePath(`/pigiste/pitchs/${pitch.id}`);
  redirect(`/pigiste/article/${bonDeCommandeId}`);
}

// WF0 étape 5 — Le pigiste accepte ou refuse une commission directe
// (BonDeCommande sans pitch_envoi).
export async function respondCommissionAction(bcId: string, decision: "accepte" | "refuse") {
  const { userId } = await requireUser();
  const supabase = await createClient();

  const { data: bc } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("id", bcId)
    .single();

  if (!bc || bc.pigiste !== userId) redirect("/pigiste/commandes");
  // Les offres sur pitch passent par acceptOfferAction (fermeture des autres envois).
  if (bc.pitch_envoi) redirect("/pigiste/commandes");

  await supabase.from("bons_de_commande").update({ statut: decision }).eq("id", bcId);
  await notify(
    supabase,
    bc.redaction,
    decision === "accepte"
      ? "Le pigiste a accepté votre commission directe"
      : "Le pigiste a refusé votre commission directe",
    `/redaction/commandes/${bcId}`
  );

  if (decision === "accepte") {
    redirect(`/pigiste/article/${bcId}`);
  }
  redirect("/pigiste/commandes");
}

// WF4 — Soumission / re-soumission de l'article.
export async function submitArticleAction(formData: FormData) {
  const { userId, profile } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const bonDeCommandeId = String(formData.get("bon_de_commande") || "");
  const contenu = String(formData.get("contenu") || "");

  const { data: bc } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("id", bonDeCommandeId)
    .single();

  if (!bc || bc.pigiste !== userId) redirect("/pigiste");

  // Règle métier : soumission bloquée sans fiche de renseignement uploadée.
  if (!profile.fiche_renseignement) {
    redirect(`/pigiste/article/${bonDeCommandeId}?error=fiche_manquante`);
  }

  const { data: last } = await supabase
    .from("articles")
    .select("version")
    .eq("bon_de_commande", bonDeCommandeId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (last?.version || 0) + 1;

  await supabase.from("articles").insert({
    bon_de_commande: bonDeCommandeId,
    contenu,
    version: nextVersion,
    date_soumission: new Date().toISOString(),
    statut: "soumis",
  });

  await notify(
    supabase,
    bc.redaction,
    `Nouvel article soumis (v${nextVersion}) pour relecture`,
    `/redaction/articles/${bonDeCommandeId}`
  );

  revalidatePath(`/pigiste/article/${bonDeCommandeId}`);
}
