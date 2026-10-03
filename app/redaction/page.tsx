import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { commandesDeLaRedaction, etapeDe } from "@/lib/commandes";
import Link from "next/link";

export default async function RedactionDashboard() {
  const { userId, profile } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const { data: envois } = await supabase.from("pitch_envois").select("statut").eq("redaction", userId);
  const nouveaux = (envois || []).filter((e) => e.statut === "envoye").length;

  // Compteurs calculés sur les commandes (et pas seulement sur les articles
  // soumis) : une pige acceptée dont l'article n'est pas encore rendu
  // apparaît désormais dans "Articles attendus".
  const etapes = (await commandesDeLaRedaction(supabase, userId)).map(etapeDe);
  const compte = (...e: string[]) => etapes.filter((x) => e.includes(x)).length;

  const stats = [
    { label: "Nouveaux pitchs reçus", value: nouveaux, href: "/redaction/pitchs?statut=envoye" },
    { label: "Offres en attente de réponse", value: compte("a_repondre"), href: "/redaction/commandes" },
    { label: "Articles attendus", value: compte("a_rediger", "corrections"), href: "/redaction/commandes" },
    { label: "Articles à relire", value: compte("en_relecture"), href: "/redaction/articles" },
  ];

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card transition-colors hover:border-brand-500">
            <p className="text-2xl font-bold text-brand-700">{s.value}</p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </Link>
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
