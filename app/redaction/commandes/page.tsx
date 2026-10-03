import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { commandesDeLaRedaction, etapeDe, ETAPE_BADGES, ETAPE_LABELS } from "@/lib/commandes";
import Link from "next/link";

// Historique de toutes les offres envoyées par la rédaction : offres faites
// sur des pitchs reçus ET commissions directes. Avant, une offre sur pitch
// n'était visible nulle part une fois envoyée.
export default async function OffresCommandesPage() {
  const { userId, profile } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const commandes = await commandesDeLaRedaction(supabase, userId);

  const pigisteIds = [...new Set(commandes.map((c) => c.pigisteId).filter(Boolean))] as string[];
  const { data: pigistes } = pigisteIds.length
    ? await supabase.from("profiles").select("id, prenom, nom, email").in("id", pigisteIds)
    : { data: [] as { id: string; prenom: string | null; nom: string | null; email: string }[] };
  const pigisteMap = new Map((pigistes || []).map((p) => [p.id, p]));

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">Offres & commandes</h1>
      <p className="mt-1 text-sm text-gray-500">
        Toutes les offres envoyées, sur un pitch reçu ou en commission directe.
      </p>

      <div className="mt-6 space-y-2">
        {commandes.length === 0 && (
          <p className="text-sm text-gray-500">
            Aucune offre envoyée pour le moment. Faites une offre depuis un pitch reçu, ou
            commissionnez un pigiste depuis l&apos;annuaire.
          </p>
        )}
        {commandes.map((c) => {
          const p = c.pigisteId ? pigisteMap.get(c.pigisteId) : null;
          const nomPigiste = p
            ? `${p.prenom || ""} ${p.nom || ""}`.trim() || p.email
            : c.email_invite || "Compte supprimé";
          const etape = etapeDe(c);
          return (
            <Link
              key={c.id}
              href={`/redaction/commandes/${c.id}`}
              className="card flex items-center justify-between gap-4 transition-colors hover:border-brand-500"
            >
              <div>
                <p className="font-medium text-gray-900">{c.titre}</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {nomPigiste} · {c.prix} € · envoyée le{" "}
                  {new Date(c.date_creation).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <span className={`badge ${ETAPE_BADGES[etape]} shrink-0`}>
                {ETAPE_LABELS[etape]}
              </span>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
