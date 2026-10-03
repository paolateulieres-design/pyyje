"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-helpers";
import { notify } from "@/lib/notifications";
import { sendEmail, siteUrl } from "@/lib/email";
import { uploadAvatar } from "@/lib/storage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// WF2 étape 2a — Refuser un pitch reçu.
export async function refusePitchAction(formData: FormData) {
  const { userId } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const envoiId = String(formData.get("envoi_id") || "");
  const message = String(formData.get("message_refus") || "");

  const { data: envoi } = await supabase.from("pitch_envois").select("*").eq("id", envoiId).single();
  if (!envoi || envoi.redaction !== userId) redirect("/redaction/pitchs");

  await supabase
    .from("pitch_envois")
    .update({ statut: "refuse", message_refus: message || null })
    .eq("id", envoiId);

  const { data: pitch } = await supabase.from("pitches").select("*").eq("id", envoi.pitch).single();
  if (pitch) {
    await notify(supabase, pitch.auteur, `Votre pitch « ${pitch.titre} » a été refusé`, `/pigiste/pitchs/${pitch.id}`);
  }

  revalidatePath(`/redaction/pitchs/${envoiId}`);
  redirect("/redaction/pitchs");
}

// Marque le pitch comme "vu" à l'ouverture (WF2 étape 1).
export async function markPitchSeenAction(envoiId: string) {
  const { userId } = await requireRole(["redaction"]);
  const supabase = await createClient();
  await supabase
    .from("pitch_envois")
    .update({ statut: "vu" })
    .eq("id", envoiId)
    .eq("redaction", userId)
    .eq("statut", "envoye");
}

// WF2 étape 2b — Faire une offre (crée un BonDeCommande depuis un pitch reçu).
export async function makeOfferAction(formData: FormData) {
  const { userId } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const envoiId = String(formData.get("envoi_id") || "");
  const { data: envoi } = await supabase.from("pitch_envois").select("*").eq("id", envoiId).single();
  if (!envoi || envoi.redaction !== userId) redirect("/redaction/pitchs");

  const prix = Number(formData.get("prix") || 0);
  const deadline = String(formData.get("deadline") || "");
  const format = String(formData.get("format") || "");
  const nb_signes = Number(formData.get("nb_signes") || 0);
  const notes = String(formData.get("notes") || "");

  await supabase.from("bons_de_commande").insert({
    pitch_envoi: envoiId,
    source: "pitch_accepte",
    redaction: userId,
    prix,
    deadline,
    format,
    nb_signes,
    notes: notes || null,
    statut: "propose",
    paiement_effectue: false,
    date_creation: new Date().toISOString(),
  });

  await supabase.from("pitch_envois").update({ statut: "offre_faite" }).eq("id", envoiId);

  const { data: pitch } = await supabase.from("pitches").select("*").eq("id", envoi.pitch).single();
  if (pitch) {
    await notify(supabase, pitch.auteur, `Offre reçue pour ton pitch « ${pitch.titre} »`, `/pigiste/pitchs/${pitch.id}`);
  }

  revalidatePath(`/redaction/pitchs/${envoiId}`);
  redirect(`/redaction/pitchs/${envoiId}`);
}

// WF0 — Commission directe.
export async function createDirectCommissionAction(formData: FormData) {
  const { userId } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const prix = Number(formData.get("prix") || 0);
  const deadline = String(formData.get("deadline") || "");
  const titre = String(formData.get("titre") || "").trim();
  const format = String(formData.get("format") || "");
  const nb_signes = Number(formData.get("nb_signes") || 0);
  const notes = String(formData.get("notes") || "");

  // Autorisé par la policy "profiles_select_authenticated" (lecture ouverte
  // aux comptes connectés) — pas besoin de clé service_role ici.
  const { data: existingPigiste } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .eq("type_compte", "pigiste")
    .maybeSingle();

  const token = crypto.randomBytes(24).toString("hex");

  const { data: bc, error } = await supabase
    .from("bons_de_commande")
    .insert({
      source: "commission_directe",
      redaction: userId,
      pigiste: existingPigiste?.id || null,
      email_invite: existingPigiste ? null : email,
      token_invitation: token,
      prix,
      deadline,
      titre: titre || null,
      format,
      nb_signes,
      notes: notes || null,
      statut: "propose",
      paiement_effectue: false,
      date_creation: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !bc) {
    redirect(`/redaction/commission-directe?error=${encodeURIComponent(error?.message || "erreur")}`);
  }

  if (existingPigiste) {
    await notify(
      supabase,
      existingPigiste.id,
      titre ? `Nouvelle proposition de pige : « ${titre} »` : "Vous avez une nouvelle proposition de pige",
      `/pigiste/commandes/${bc!.id}`
    );
    redirect(`/redaction/commission-directe?ok=1&bc=${bc!.id}`);
  }

  // Pigiste pas encore inscrit : invitation par email. Le lien reste affiché
  // à la rédaction au cas où l'email n'arriverait pas (ou si l'envoi n'est
  // pas configuré).
  const { data: media } = await supabase
    .from("profiles")
    .select("nom_media")
    .eq("id", userId)
    .single();
  await sendEmail({
    to: email,
    subject: `${media?.nom_media || "Une rédaction"} vous propose une pige sur PYYJE`,
    texte: `${media?.nom_media || "Une rédaction"} vous propose une pige${titre ? ` : « ${titre} »` : ""} (${format}, ${prix} €). Créez votre compte PYYJE pour consulter la proposition et y répondre.`,
    lien: siteUrl(`/invite/${token}`),
    bouton: "Voir la proposition",
  });
  redirect(`/redaction/commission-directe?ok=1&bc=${bc!.id}&token=${token}`);
}

// WF5 étape 1 — Ajouter un commentaire sur un article.
export async function addCommentAction(formData: FormData) {
  const { userId } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const articleId = String(formData.get("article_id") || "");
  const texte = String(formData.get("texte") || "");
  if (!texte) redirect(`/redaction/articles`);

  const { data: article } = await supabase.from("articles").select("*").eq("id", articleId).single();
  if (!article) redirect("/redaction/articles");

  const { data: bc } = await supabase.from("bons_de_commande").select("*").eq("id", article.bon_de_commande).single();
  if (!bc || bc.redaction !== userId) redirect("/redaction/articles");

  await supabase.from("commentaires").insert({
    article: articleId,
    auteur: userId,
    texte,
    date: new Date().toISOString(),
    resolu: false,
  });

  await supabase.from("articles").update({ statut: "corrections_demandees" }).eq("id", articleId);

  if (bc.pigiste) {
    await notify(supabase, bc.pigiste, "Nouveaux commentaires sur ton article", `/pigiste/article/${bc.id}`);
  }

  revalidatePath(`/redaction/articles/${bc.id}`);
}

// WF5 étape 2 — Valider l'article final.
export async function validateArticleAction(articleId: string) {
  const { userId } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const { data: article } = await supabase.from("articles").select("*").eq("id", articleId).single();
  if (!article) redirect("/redaction/articles");

  const { data: bc } = await supabase.from("bons_de_commande").select("*").eq("id", article.bon_de_commande).single();
  if (!bc || bc.redaction !== userId) redirect("/redaction/articles");

  await supabase.from("articles").update({ statut: "valide" }).eq("id", articleId);
  await supabase.from("bons_de_commande").update({ statut: "valide" }).eq("id", bc.id);

  if (bc.pitch_envoi) {
    const { data: envoi } = await supabase.from("pitch_envois").select("*").eq("id", bc.pitch_envoi).single();
    if (envoi) {
      await supabase.from("pitches").update({ statut: "cloture" }).eq("id", envoi.pitch);
    }
  }

  if (bc.pigiste) {
    const { data: pigiste } = await supabase
      .from("profiles")
      .select("fiche_renseignement")
      .eq("id", bc.pigiste)
      .single();
    if (pigiste?.fiche_renseignement) {
      await notify(supabase, bc.pigiste, "Article validé — paiement à déclencher", `/pigiste/historique`);
    } else {
      await notify(
        supabase,
        bc.pigiste,
        "Article validé ! Ajoutez votre fiche de renseignement pour que la rédaction puisse vous payer",
        `/profil`
      );
    }
  }

  revalidatePath(`/redaction/articles/${bc.id}`);
  redirect("/redaction/articles");
}

// Règle métier — champ paiement_effectue confirmé manuellement par la rédaction.
export async function togglePaiementAction(bcId: string, value: boolean) {
  const { userId } = await requireRole(["redaction"]);
  const supabase = await createClient();
  const { data: bc } = await supabase
    .from("bons_de_commande")
    .select("redaction, pigiste")
    .eq("id", bcId)
    .single();
  if (!bc || bc.redaction !== userId) return;

  // Pas de paiement sans fiche de renseignement (RIB, sécu...).
  if (value && bc.pigiste) {
    const { data: pigiste } = await supabase
      .from("profiles")
      .select("fiche_renseignement")
      .eq("id", bc.pigiste)
      .single();
    if (!pigiste?.fiche_renseignement) return;
  }
  await supabase.from("bons_de_commande").update({ paiement_effectue: value }).eq("id", bcId);
  revalidatePath("/redaction/articles");
}

// Profil rédaction — gestion de la liste des rubriques.
export async function updateRedactionProfileAction(formData: FormData) {
  const { userId } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const rubriques = String(formData.get("rubriques") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const update: Record<string, unknown> = {
    nom_media: String(formData.get("nom_media") || ""),
    site_web: String(formData.get("site_web") || ""),
    rubriques,
  };

  const logoFile = formData.get("logo_file") as File | null;
  if (logoFile && logoFile.size > 0) {
    const { url, error } = await uploadAvatar(supabase, userId, logoFile, "logo");
    if (error) redirect(`/redaction/profil?error=${encodeURIComponent(error)}`);
    if (url) update.logo = url;
  }

  await supabase.from("profiles").update(update).eq("id", userId);

  revalidatePath("/redaction/profil");
  redirect("/redaction/profil?enregistre=1");
}
