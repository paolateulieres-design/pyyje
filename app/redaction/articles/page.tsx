import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import Link from "next/link";

export default async function ArticlesEnCoursPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { userId, profile } = await requireRole(["redaction"]);
  const { statut } = await searchParams;
  const supabase = await createClient();

  const { data: bcs } = await supabase.from("bons_de_commande").select("*").eq("redaction", userId);
  const bcIds = (bcs || []).map((b) => b.id);
  const bcMap = new Map((bcs || []).map((b) => [b.id, b]));

  // On ne garde que la dernière version de chaque bon de commande.
  const { data: articles } = bcIds.length
    ? await supabase
        .from("articles")
        .select("*")
        .in("bon_de_commande", bcIds)
        .order("version", { ascending: false })
    : { data: [] as any[] };

  const latestByBc = new Map<string, any>();
  for (const a of articles || []) {
    if (!latestByBc.has(a.bon_de_commande)) latestByBc.set(a.bon_de_commande, a);
  }
  let latest = [...latestByBc.values()];
  if (statut) latest = latest.filter((a) => a.statut === statut);

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">Articles</h1>
      <div className="mt-3 flex gap-2 text-sm">
        {[
          ["", "Tous"],
          ["soumis", "Soumis"],
          ["corrections_demandees", "Corrections demandées"],
          ["valide", "Validés"],
        ].map(([val, label]) => (
          <a
            key={val}
            href={val ? `/redaction/articles?statut=${val}` : "/redaction/articles"}
            className={`btn-secondary ${statut === val || (!statut && !val) ? "ring-2 ring-brand-500" : ""}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {latest.length === 0 && <p className="text-sm text-gray-500">Aucun article.</p>}
        {latest.map((a) => {
          const bc = bcMap.get(a.bon_de_commande);
          return (
            <Link key={a.id} href={`/redaction/articles/${a.bon_de_commande}`} className="card block hover:border-brand-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {bc?.format} — {bc?.prix} € (v{a.version})
                </h3>
                <span className="badge badge-blue">{STATUT_LABELS[a.statut] || a.statut}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Soumis le {new Date(a.date_soumission).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
