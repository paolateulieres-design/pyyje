import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";

export default async function HistoriquePage() {
  const { userId, profile } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const { data: bcs } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("pigiste", userId)
    .eq("statut", "valide");

  const bcIds = (bcs || []).map((b) => b.id);
  const { data: articles } = bcIds.length
    ? await supabase
        .from("articles")
        .select("*")
        .in("bon_de_commande", bcIds)
        .eq("statut", "valide")
    : { data: [] as any[] };

  const bcMap = new Map((bcs || []).map((b) => [b.id, b]));

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <h1 className="text-xl font-semibold text-gray-900">Historique des articles validés</h1>

      <div className="mt-6 space-y-3">
        {(articles || []).length === 0 && (
          <p className="text-sm text-gray-500">Aucun article validé pour le moment.</p>
        )}
        {(articles || []).map((a) => {
          const bc = bcMap.get(a.bon_de_commande);
          return (
            <div key={a.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Article v{a.version} — {bc?.format}</p>
                <p className="text-sm text-gray-500">
                  Validé le {new Date(a.date_soumission).toLocaleDateString("fr-FR")} · {bc?.prix} €
                </p>
              </div>
              <span className={`badge ${bc?.paiement_effectue ? "badge-green" : "badge-yellow"}`}>
                {bc?.paiement_effectue ? "Paiement effectué" : "Paiement à déclencher"}
              </span>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
