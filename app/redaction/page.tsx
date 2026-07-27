import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RedactionDashboard() {
  const { userId, profile } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const { data: envois } = await supabase.from("pitch_envois").select("*").eq("redaction", userId);
  const nouveaux = (envois || []).filter((e) => e.statut === "envoye").length;

  const { data: bcs } = await supabase.from("bons_de_commande").select("id").eq("redaction", userId);
  const bcIds = (bcs || []).map((b) => b.id);
  const { data: articles } = bcIds.length
    ? await supabase.from("articles").select("*").in("bon_de_commande", bcIds)
    : { data: [] as any[] };

  const enAttenteRelecture = (articles || []).filter((a) => a.statut === "soumis").length;
  const aValider = (articles || []).filter((a) => a.statut === "corrections_demandees" || a.statut === "soumis").length;

  const stats = [
    { label: "Nouveaux pitchs reçus", value: nouveaux },
    { label: "Articles en attente de relecture", value: enAttenteRelecture },
    { label: "Articles à valider", value: aValider },
  ];

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-2xl font-bold text-brand-700">{s.value}</p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/redaction/pitchs" className="btn-primary">
          Voir les pitchs reçus
        </Link>
        <Link href="/redaction/commission-directe" className="btn-secondary">
          Commission directe
        </Link>
      </div>
    </AppShell>
  );
}
