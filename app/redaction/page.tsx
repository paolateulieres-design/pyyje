import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { commandesDeLaRedaction, etapeDe } from "@/lib/commandes";
import { statistiquesRedaction } from "@/lib/statistiques";
import MonthlyBars from "@/components/MonthlyBars";
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

  const { mois, enAttente } = await statistiquesRedaction(supabase, userId);
  const euros = (v: number) => `${v.toLocaleString("fr-FR")} €`;
  // Tableau : mois les plus récents en haut, mois vides masqués.
  const moisActifs = [...mois].reverse().filter((m) => m.recus.nb > 0);

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

      <h2 className="mt-10 text-lg font-semibold text-gray-900">Suivi des piges</h2>

      <Link
        href="/redaction/articles"
        className="card mt-4 flex max-w-md items-center justify-between transition-colors hover:border-brand-500"
      >
        <div>
          <p className="text-sm text-gray-500">En attente de règlement</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">{euros(enAttente.montant)}</p>
        </div>
        <p className="text-sm text-gray-500">
          {enAttente.nb} article{enAttente.nb > 1 ? "s" : ""} validé{enAttente.nb > 1 ? "s" : ""}, non
          payé{enAttente.nb > 1 ? "s" : ""}
        </p>
      </Link>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <MonthlyBars
          titre="Montant des articles reçus par mois"
          unite=" €"
          points={mois.map((m) => ({ libelle: m.libelle, valeur: m.recus.montant }))}
        />
        <MonthlyBars
          titre="Nombre d'articles reçus par mois"
          entier
          points={mois.map((m) => ({ libelle: m.libelle, valeur: m.recus.nb }))}
        />
      </div>

      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Mois de réception</th>
              <th className="px-4 py-3 text-right font-medium">Reçus</th>
              <th className="px-4 py-3 text-right font-medium">Validés</th>
              <th className="px-4 py-3 text-right font-medium">À payer</th>
              <th className="px-4 py-3 text-right font-medium">Payés</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {moisActifs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Aucun article reçu sur les 12 derniers mois.
                </td>
              </tr>
            )}
            {moisActifs.map((m) => (
              <tr key={m.cle} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 capitalize text-gray-900">{m.libelle}</td>
                {[m.recus, m.valides, m.aPayer, m.payes].map((c, i) => (
                  <td key={i} className="px-4 py-3 text-right text-gray-700">
                    {c.nb > 0 ? (
                      <>
                        {c.nb} <span className="text-gray-400">·</span> {euros(c.montant)}
                      </>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Les articles sont rattachés au mois où la rédaction a reçu leur première version.
      </p>

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
