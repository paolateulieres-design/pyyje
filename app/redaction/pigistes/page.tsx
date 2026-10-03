import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { SPECIALITES, normaliseSpecialite } from "@/lib/specialites";
import Link from "next/link";

export default async function AnnuairePigistesPage({
  searchParams,
}: {
  searchParams: Promise<{ specialite?: string }>;
}) {
  const { profile } = await requireRole(["redaction"]);
  const specialite = normaliseSpecialite((await searchParams).specialite || "");
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, prenom, nom, email, bio, specialites, portfolio_url, num_carte_presse")
    .eq("type_compte", "pigiste")
    .eq("statut_compte", "valide");

  if (specialite) {
    query = query.contains("specialites", [specialite]);
  }

  const { data: pigistes } = await query.order("nom", { ascending: true });

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">Annuaire des pigistes</h1>
      <p className="mt-1 text-sm text-gray-500">
        Parcourez les profils pour proposer une commission directe, sans passer par un pitch.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <a
          href="/redaction/pigistes"
          className={`btn-secondary ${!specialite ? "ring-2 ring-brand-500" : ""}`}
        >
          Tous
        </a>
        {SPECIALITES.map((r) => (
          <a
            key={r}
            href={`/redaction/pigistes?specialite=${encodeURIComponent(r)}`}
            className={`btn-secondary ${specialite === r ? "ring-2 ring-brand-500" : ""}`}
          >
            {r}
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(pigistes || []).length === 0 && (
          <p className="text-sm text-gray-500">Aucun pigiste trouvé pour ce filtre.</p>
        )}
        {(pigistes || []).map((p) => (
          <div key={p.id} className="card">
            <h3 className="font-medium text-gray-900">
              {p.prenom} {p.nom}
            </h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-3">{p.bio}</p>
            <p className="mt-2 text-xs text-gray-500">
              Spécialités : {(p.specialites || []).join(", ") || "—"}
            </p>
            {p.num_carte_presse && (
              <p className="text-xs text-gray-500">Carte de presse : {p.num_carte_presse}</p>
            )}
            {p.portfolio_url && (
              <a href={p.portfolio_url} target="_blank" className="mt-1 block text-xs text-brand-600 underline">
                Voir le portfolio
              </a>
            )}
            <Link
              href={`/redaction/commission-directe?email=${encodeURIComponent(p.email)}`}
              className="btn-primary mt-3 inline-flex text-xs"
            >
              Commissionner directement
            </Link>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
