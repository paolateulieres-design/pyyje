import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import Link from "next/link";

export default async function MesPitchsPage() {
  const { userId, profile } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const { data: pitches } = await supabase
    .from("pitches")
    .select("*")
    .eq("auteur", userId)
    .order("date_creation", { ascending: false });

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mes pitchs</h1>
        <Link href="/pigiste/pitchs/nouveau" className="btn-primary">
          + Nouveau pitch
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(pitches || []).length === 0 && (
          <p className="text-sm text-gray-500">
            Vous n&apos;avez pas encore envoyé de pitch.
          </p>
        )}
        {(pitches || []).map((p) => (
          <Link
            key={p.id}
            href={`/pigiste/pitchs/${p.id}`}
            className="card block hover:border-brand-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{p.titre}</h3>
              <span className="badge badge-blue">{STATUT_LABELS[p.statut] || p.statut}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{p.resume}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
