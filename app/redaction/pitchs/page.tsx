import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import Link from "next/link";

export default async function PitchsRecusPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; rubrique?: string }>;
}) {
  const { userId, profile } = await requireRole(["redaction"]);
  const { statut, rubrique } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("pitch_envois").select("*").eq("redaction", userId);
  if (statut) query = query.eq("statut", statut);
  if (rubrique) query = query.eq("rubrique_ciblee", rubrique);
  const { data: envois } = await query.order("date_envoi", { ascending: false });

  const pitchIds = [...new Set((envois || []).map((e) => e.pitch))];
  const { data: pitches } = pitchIds.length
    ? await supabase.from("pitches").select("*").in("id", pitchIds)
    : { data: [] as any[] };
  const pitchMap = new Map((pitches || []).map((p) => [p.id, p]));

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">Pitchs reçus</h1>
      <div className="mt-3 flex gap-2 text-sm">
        {[
          ["", "Tous"],
          ["envoye", "Nouveaux"],
          ["vu", "Vus"],
          ["offre_faite", "Offre faite"],
          ["accepte_par_pigiste", "Acceptés"],
          ["refuse", "Refusés"],
        ].map(([val, label]) => (
          <a
            key={val}
            href={val ? `/redaction/pitchs?statut=${val}` : "/redaction/pitchs"}
            className={`btn-secondary ${statut === val || (!statut && !val) ? "ring-2 ring-brand-500" : ""}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {(envois || []).length === 0 && (
          <p className="text-sm text-gray-500">Aucun pitch pour ces filtres.</p>
        )}
        {(envois || []).map((e) => {
          const pitch = pitchMap.get(e.pitch);
          if (!pitch) return null;
          return (
            <Link key={e.id} href={`/redaction/pitchs/${e.id}`} className="card block hover:border-brand-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{pitch.titre}</h3>
                <span className="badge badge-blue">{STATUT_LABELS[e.statut] || e.statut}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Rubrique : {e.rubrique_ciblee}</p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
