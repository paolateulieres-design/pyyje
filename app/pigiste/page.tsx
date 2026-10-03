import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { commandesDuPigiste, etapeDe } from "@/lib/commandes";
import Link from "next/link";

export default async function PigisteDashboard() {
  const { userId, profile } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const { data: pitches } = await supabase
    .from("pitches")
    .select("*")
    .eq("auteur", userId);

  // Compte les offres sur pitch ET les commissions directes (avant, seules
  // les offres sur pitch étaient comptées).
  const commandes = await commandesDuPigiste(supabase, userId);
  const etapes = commandes.map(etapeDe);
  const offresEnAttente = etapes.filter((e) => e === "a_repondre").length;
  const enCours = etapes.filter((e) =>
    ["a_rediger", "corrections", "en_relecture"].includes(e)
  ).length;
  const valides = etapes.filter((e) => e === "validee").length;
  const pitchsActifs = (pitches || []).filter((p) => p.statut !== "cloture").length;

  const stats = [
    { label: "Pitchs actifs", value: pitchsActifs, href: "/pigiste/pitchs" },
    { label: "Offres reçues en attente", value: offresEnAttente, href: "/pigiste/commandes#offres" },
    { label: "Articles en cours", value: enCours, href: "/pigiste/commandes#en-cours" },
    { label: "Articles validés", value: valides, href: "/pigiste/historique" },
  ];

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
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
