import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PigisteDashboard() {
  const { userId, profile } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const { data: pitches } = await supabase
    .from("pitches")
    .select("*")
    .eq("auteur", userId);

  const pitchIds = (pitches || []).map((p) => p.id);

  const { data: envois } = pitchIds.length
    ? await supabase.from("pitch_envois").select("*").in("pitch", pitchIds)
    : { data: [] as any[] };

  const offresEnAttente = (envois || []).filter((e) => e.statut === "offre_faite").length;

  const { data: mesBCs } = await supabase
    .from("bons_de_commande")
    .select("id")
    .eq("pigiste", userId);
  const bcIds = (mesBCs || []).map((b) => b.id);

  const { data: articles } = bcIds.length
    ? await supabase.from("articles").select("*").in("bon_de_commande", bcIds)
    : { data: [] as any[] };

  const enCours = (articles || []).filter((a) => a.statut !== "valide").length;
  const valides = (articles || []).filter((a) => a.statut === "valide").length;
  const pitchsActifs = (pitches || []).filter((p) => p.statut !== "cloture").length;

  const stats = [
    { label: "Pitchs actifs", value: pitchsActifs },
    { label: "Offres reçues en attente", value: offresEnAttente },
    { label: "Articles en cours", value: enCours },
    { label: "Articles validés", value: valides },
  ];

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-2xl font-bold text-brand-700">{s.value}</p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/pigiste/pitchs/nouveau" className="btn-primary">
          + Nouveau pitch
        </Link>
        <Link href="/pigiste/pitchs" className="btn-secondary">
          Voir mes pitchs
        </Link>
      </div>
    </AppShell>
  );
}
