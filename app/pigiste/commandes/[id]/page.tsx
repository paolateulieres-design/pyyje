import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import { respondCommissionAction } from "../../actions";
import { redirect } from "next/navigation";

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

  if (!bc || bc.pigiste !== userId) redirect("/pigiste");

  const { data: redaction } = await supabase
    .from("profiles")
    .select("nom_media, logo, site_web")
    .eq("id", bc.redaction)
    .single();

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <h1 className="text-xl font-semibold text-gray-900">
        Proposition de {redaction?.nom_media || "une rédaction"}
      </h1>
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
            <button className="btn-primary">Accepter</button>
          </form>
          <form action={respondCommissionAction.bind(null, bc.id, "refuse")}>
            <button className="btn-danger">Refuser</button>
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
