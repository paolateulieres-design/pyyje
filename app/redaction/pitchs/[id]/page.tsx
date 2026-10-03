import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import { refusePitchAction, makeOfferAction, markPitchSeenAction } from "../../actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";

export default async function PitchEnvoiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const { data: envoi } = await supabase.from("pitch_envois").select("*").eq("id", id).single();
  if (!envoi || envoi.redaction !== userId) redirect("/redaction/pitchs");

  if (envoi.statut === "envoye") {
    await markPitchSeenAction(id);
    envoi.statut = "vu";
  }

  const { data: pitch } = await supabase.from("pitches").select("*").eq("id", envoi.pitch).single();
  if (!pitch) redirect("/redaction/pitchs");

  const { data: auteur } = await supabase
    .from("profiles")
    .select("prenom, nom, bio, specialites, portfolio_url, portfolio_liens, num_carte_presse")
    .eq("id", pitch.auteur)
    .single();

  const peutRepondre = envoi.statut === "vu";

  // Offre déjà envoyée sur ce pitch : on l'affiche au lieu de la perdre de vue.
  const { data: offre } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("pitch_envoi", envoi.id)
    .order("date_creation", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <Link href="/redaction/pitchs" className="text-sm text-brand-600">
        ← Pitchs reçus
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">{pitch.titre}</h1>
      <span className="badge badge-blue mt-2">{STATUT_LABELS[envoi.statut] || envoi.statut}</span>

      <div className="card mt-4 max-w-2xl space-y-2">
        <p className="text-sm text-gray-700"><strong>Présentation du sujet :</strong> {pitch.resume}</p>
        {pitch.angle && (
          <p className="text-sm text-gray-700"><strong>Angle :</strong> {pitch.angle}</p>
        )}
        <p className="text-sm text-gray-500">Rubrique ciblée : {envoi.rubrique_ciblee}</p>
      </div>

      {auteur && (
        <div className="card mt-4 max-w-2xl">
          <h3 className="font-medium text-gray-900">
            {auteur.prenom} {auteur.nom}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{auteur.bio}</p>
          <p className="mt-1 text-xs text-gray-500">
            Spécialités : {(auteur.specialites || []).join(", ") || "—"}
          </p>
          {auteur.num_carte_presse && (
            <p className="text-xs text-gray-500">Carte de presse : {auteur.num_carte_presse}</p>
          )}
          {auteur.portfolio_url && (
            <p className="text-xs text-gray-500">
              Portfolio :{" "}
              <a href={auteur.portfolio_url} target="_blank" className="text-brand-600 underline">
                {auteur.portfolio_url}
              </a>
            </p>
          )}
        </div>
      )}

      {offre && (
        <div className="card mt-4 max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-gray-900">Votre offre</h3>
            <span className="badge badge-blue">{STATUT_LABELS[offre.statut] || offre.statut}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-brand-700">{offre.prix} €</p>
          <p className="mt-1 text-sm text-gray-600">
            {offre.format} · {offre.nb_signes} signes · deadline{" "}
            {new Date(offre.deadline).toLocaleDateString("fr-FR")}
          </p>
          {offre.notes && <p className="mt-2 text-sm text-gray-500">{offre.notes}</p>}
          <Link
            href={`/redaction/commandes/${offre.id}`}
            className="mt-3 inline-block text-sm font-medium text-brand-600 underline"
          >
            Suivre cette commande
          </Link>
        </div>
      )}

      {peutRepondre && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="card">
            <h3 className="font-semibold text-gray-900">Refuser</h3>
            <form action={refusePitchAction} className="mt-3 space-y-3">
              <input type="hidden" name="envoi_id" value={envoi.id} />
              <textarea name="message_refus" placeholder="Message (optionnel)" className="input" rows={3} />
              <SubmitButton className="btn-danger w-full">Refuser ce pitch</SubmitButton>
            </form>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900">Faire une offre</h3>
            <form action={makeOfferAction} className="mt-3 space-y-3">
              <input type="hidden" name="envoi_id" value={envoi.id} />
              <div>
                <label className="label">Prix (€)</label>
                <input type="number" name="prix" required className="input" />
              </div>
              <div>
                <label className="label">Deadline</label>
                <input type="date" name="deadline" required className="input" />
              </div>
              <div>
                <label className="label">Format</label>
                <input name="format" placeholder="article, reportage..." required className="input" />
              </div>
              <div>
                <label className="label">Nombre de signes</label>
                <input type="number" name="nb_signes" required className="input" />
              </div>
              <div>
                <label className="label">Notes (optionnel)</label>
                <textarea name="notes" className="input" rows={2} />
              </div>
              <SubmitButton className="btn-primary w-full">Envoyer l&apos;offre</SubmitButton>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
