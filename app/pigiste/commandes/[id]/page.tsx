import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import { respondCommissionAction } from "../../actions";
import { redirect } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";

// Accessible même si le compte pigiste est encore "en_attente" — cf. WF0
// étape 4 : le pigiste doit pouvoir consulter la proposition qui lui est
// directement liée, avant même la validation admin complète du compte.
export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await requireUser();

  if (profile.type_compte !== "pigiste") redirect("/");

  const supabase = await createClient();
  const { data: bc } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("id", id)
    .single();

  if (!bc) redirect("/pigiste/commandes");

  // Une offre sur pitch se traite depuis la page du pitch, qui ferme
  // automatiquement les envois aux autres rédactions à l'acceptation.
  if (bc.source === "pitch_accepte" && bc.statut === "propose" && bc.pitch_envoi) {
    const { data: envoi } = await supabase
      .from("pitch_envois")
      .select("pitch")
      .eq("id", bc.pitch_envoi)
      .single();
    if (envoi) redirect(`/pigiste/pitchs/${envoi.pitch}`);
  }

  if (bc.pigiste !== userId) redirect("/pigiste/commandes");

  const { data: redaction } = await supabase
    .from("profiles")
    .select("nom_media, logo, site_web")
    .eq("id", bc.redaction)
    .single();

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <h1 className="text-xl font-semibold text-gray-900">
        {bc.titre || "Proposition de pige"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Proposée par {redaction?.nom_media || "une rédaction"}</p>
      <span className="badge badge-blue mt-2">{STATUT_LABELS[bc.statut] || bc.statut}</span>

      <div className="card mt-6 max-w-lg space-y-2">
        <p className="text-2xl font-bold text-brand-700">{bc.prix} €</p>
        <p className="text-sm text-gray-600">Format : {bc.format}</p>
        <p className="text-sm text-gray-600">
          Deadline : {new Date(bc.deadline).toLocaleDateString("fr-FR")}
        </p>
        <p className="text-sm text-gray-600">{bc.nb_signes} signes espaces compris</p>
        {bc.notes && <p className="mt-2 text-sm text-gray-500">{bc.notes}</p>}
      </div>

      {bc.statut === "propose" && (
        <div className="mt-6 flex gap-3">
          <form action={respondCommissionAction.bind(null, bc.id, "accepte")}>
            <SubmitButton className="btn-primary">Accepter</SubmitButton>
          </form>
          <form action={respondCommissionAction.bind(null, bc.id, "refuse")}>
            <SubmitButton className="btn-danger">Refuser</SubmitButton>
          </form>
        </div>
      )}

      {bc.statut === "accepte" && (
        <a href={`/pigiste/article/${bc.id}`} className="btn-primary mt-6 inline-flex">
          Rédiger l&apos;article
        </a>
      )}
    </AppShell>
  );
}
