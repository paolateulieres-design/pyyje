import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createDirectCommissionAction } from "../actions";

export default async function CommissionDirectePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; token?: string; error?: string; email?: string }>;
}) {
  const { profile } = await requireRole(["redaction"]);
  const { ok, token, error, email } = await searchParams;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const inviteLink = token ? `${siteUrl}/invite/${token}` : null;

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
              Ce pigiste n&apos;a pas encore de compte PYYJE : transmettez-lui ce lien
              d&apos;invitation (aucun service d&apos;envoi d&apos;email n&apos;est
              encore branché) :
              <div className="mt-2 break-all rounded bg-white p-2 font-mono text-xs">
                {inviteLink}
              </div>
            </>
          ) : (
            " Le pigiste, déjà inscrit, a été notifié directement sur la plateforme."
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
        <button className="btn-primary w-full">Envoyer la proposition</button>
      </form>
    </AppShell>
  );
}
