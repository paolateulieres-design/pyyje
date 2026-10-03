import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import { createDirectCommissionAction } from "../actions";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";

// Libellés spécifiques à l'historique des commissions directes : une fois
// acceptée, on affiche "En cours" plutôt que "Accepté" tant que l'article
// n'est pas validé — plus parlant pour la rédaction.
function statutHistorique(statut: string) {
  if (statut === "propose") return "Envoyée";
  if (statut === "accepte") return "En cours";
  if (statut === "refuse") return "Refusée";
  if (statut === "valide") return "Validée";
  if (statut === "retire") return "Retirée";
  return STATUT_LABELS[statut] || statut;
}

export default async function CommissionDirectePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; token?: string; error?: string; email?: string }>;
}) {
  const { userId, profile } = await requireRole(["redaction"]);
  const { ok, token, error, email } = await searchParams;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const inviteLink = token ? `${siteUrl}/invite/${token}` : null;

  const supabase = await createClient();
  const { data: commissions } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("redaction", userId)
    .eq("source", "commission_directe")
    .order("date_creation", { ascending: false });

  const pigisteIds = [...new Set((commissions || []).map((c) => c.pigiste).filter(Boolean))];
  const { data: pigisteProfiles } = pigisteIds.length
    ? await supabase.from("profiles").select("id, prenom, nom, email").in("id", pigisteIds)
    : { data: [] as any[] };
  const pigisteMap = new Map((pigisteProfiles || []).map((p) => [p.id, p]));

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">Commission directe</h1>
      <p className="mt-1 text-sm text-gray-500">
        Proposer une pige directement à un·e pigiste, inscrit·e ou non sur PYYJE.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Une erreur est survenue : {decodeURIComponent(error)}
        </p>
      )}

      {ok && (
        <div className="mt-3 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          Commission créée.
          {inviteLink ? (
            <>
              {" "}
              Ce pigiste n&apos;a pas encore de compte PYYJE : une invitation lui a été
              envoyée par email. Vous pouvez aussi lui transmettre ce lien vous-même :
              <div className="mt-2 break-all rounded bg-white p-2 font-mono text-xs">
                {inviteLink}
              </div>
            </>
          ) : (
            " Le pigiste, déjà inscrit, a été notifié sur la plateforme et par email."
          )}
        </div>
      )}

      <form action={createDirectCommissionAction} className="card mt-6 max-w-lg space-y-4">
        <div>
          <label className="label">Email du pigiste</label>
          <input type="email" name="email" defaultValue={email || ""} required className="input" />
        </div>
        <div>
          <label className="label">Prix (€)</label>
          <input type="number" name="prix" required className="input" />
        </div>
        <div>
          <label className="label">Deadline</label>
          <input type="date" name="deadline" required className="input" />
        </div>
        <div>
          <label className="label">Format</label>
          <input name="format" placeholder="article, reportage, portrait..." required className="input" />
        </div>
        <div>
          <label className="label">Nombre de signes</label>
          <input type="number" name="nb_signes" required className="input" />
        </div>
        <div>
          <label className="label">Notes (optionnel)</label>
          <textarea name="notes" className="input" rows={3} />
        </div>
        <SubmitButton className="btn-primary w-full">Envoyer la proposition</SubmitButton>
      </form>

      <h2 className="mt-10 text-lg font-semibold text-gray-900">
        Commissions directes envoyées
      </h2>
      <div className="mt-4 space-y-2">
        {(commissions || []).length === 0 && (
          <p className="text-sm text-gray-500">
            Aucune commission directe envoyée pour le moment.
          </p>
        )}
        {(commissions || []).map((c) => {
          const p = c.pigiste ? pigisteMap.get(c.pigiste) : null;
          const nomPigiste = p
            ? `${p.prenom || ""} ${p.nom || ""}`.trim() || p.email
            : c.email_invite || "Pigiste non inscrit·e";
          return (
            <div
              key={c.id}
              className="card flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-gray-900">{nomPigiste}</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  Envoyée le{" "}
                  {new Date(c.date_creation).toLocaleDateString("fr-FR")} ·{" "}
                  {c.prix} €
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-blue">
                  {statutHistorique(c.statut)}
                </span>
                <Link
                  href={`/redaction/commandes/${c.id}`}
                  className="text-sm font-medium text-brand-600 underline"
                >
                  Voir
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
