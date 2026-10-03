import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import { acceptOfferAction } from "../../actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";

export default async function PitchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const { data: pitch } = await supabase.from("pitches").select("*").eq("id", id).single();
  if (!pitch || pitch.auteur !== userId) redirect("/pigiste/pitchs");

  const { data: envoisRaw } = await supabase
    .from("pitch_envois")
    .select("*")
    .eq("pitch", id)
    .order("date_envoi", { ascending: true });

  const redactionIds = [...new Set((envoisRaw || []).map((e) => e.redaction))];
  const { data: redactionProfiles } = redactionIds.length
    ? await supabase.from("profiles").select("id, nom_media").in("id", redactionIds)
    : { data: [] as any[] };
  const redactionMap = new Map((redactionProfiles || []).map((r) => [r.id, r]));
  const envois = (envoisRaw || []).map((e) => ({
    ...e,
    redaction: redactionMap.get(e.redaction),
  }));

  const envoiIds = (envois || []).map((e) => e.id);
  const { data: offres } = envoiIds.length
    ? await supabase
        .from("bons_de_commande")
        .select("*")
        .in("pitch_envoi", envoiIds)
        .eq("statut", "propose")
    : { data: [] as any[] };

  const dejaAccepte = (envois || []).some((e) => e.statut === "accepte_par_pigiste");

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <Link href="/pigiste/pitchs" className="text-sm text-brand-600">
        ← Mes pitchs
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">{pitch.titre}</h1>
      <p className="mt-1 text-sm text-gray-500">{pitch.resume}</p>
      <span className="badge badge-blue mt-2">{STATUT_LABELS[pitch.statut] || pitch.statut}</span>

      <h2 className="mt-8 font-semibold text-gray-900">Rédactions contactées</h2>
      <div className="mt-3 space-y-2">
        {(envois || []).map((e: any) => (
          <div key={e.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{e.redaction?.nom_media}</p>
              <p className="text-xs text-gray-500">Rubrique : {e.rubrique_ciblee}</p>
              {e.message_refus && (
                <p className="mt-1 text-xs text-red-600">Motif de refus : {e.message_refus}</p>
              )}
            </div>
            <span className="badge badge-gray">{STATUT_LABELS[e.statut] || e.statut}</span>
          </div>
        ))}
      </div>

      {!dejaAccepte && (offres || []).length > 0 && (
        <>
          <h2 className="mt-8 font-semibold text-gray-900">Comparer les offres</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(offres || []).map((o: any) => (
              <div key={o.id} className="card">
                <p className="text-lg font-bold text-brand-700">{o.prix} €</p>
                <p className="text-sm text-gray-600">Format : {o.format}</p>
                <p className="text-sm text-gray-600">
                  Deadline : {new Date(o.deadline).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-gray-600">{o.nb_signes} signes</p>
                {o.notes && <p className="mt-1 text-xs text-gray-500">{o.notes}</p>}
                <form action={acceptOfferAction.bind(null, o.id)} className="mt-3">
                  <SubmitButton className="btn-primary w-full">Accepter cette offre</SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
