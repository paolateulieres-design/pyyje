import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import { addCommentAction, validateArticleAction, togglePaiementAction } from "../../actions";
import { redirect } from "next/navigation";

export default async function RelectureArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: bcId } = await params;
  const { userId, profile } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const { data: bc } = await supabase.from("bons_de_commande").select("*").eq("id", bcId).single();
  if (!bc || bc.redaction !== userId) redirect("/redaction/articles");

  const { data: versions } = await supabase
    .from("articles")
    .select("*")
    .eq("bon_de_commande", bcId)
    .order("version", { ascending: false });

  const latest = versions?.[0];
  if (!latest) redirect("/redaction/articles");

  const { data: comments } = await supabase
    .from("commentaires")
    .select("*")
    .eq("article", latest.id)
    .order("date", { ascending: true });

  const { data: pigisteProfile } = bc.pigiste
    ? await supabase
        .from("profiles")
        .select("prenom, nom, fiche_renseignement")
        .eq("id", bc.pigiste)
        .single()
    : { data: null };

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">
        {bc.format} — {bc.prix} €
      </h1>
      <span className="badge badge-blue mt-2">{STATUT_LABELS[latest.statut] || latest.statut}</span>

      {pigisteProfile && (
        <p className="mt-2 text-sm text-gray-500">
          Pigiste : {pigisteProfile.prenom} {pigisteProfile.nom}
          {pigisteProfile.fiche_renseignement && (
            <>
              {" "}
              ·{" "}
              <a
                href={pigisteProfile.fiche_renseignement}
                target="_blank"
                className="text-brand-600 underline"
              >
                Fiche de renseignement
              </a>
            </>
          )}
        </p>
      )}

      <div className="card mt-4 max-w-2xl">
        <p className="text-sm text-gray-500">Version {latest.version}</p>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{latest.contenu}</pre>
      </div>

      {versions && versions.length > 1 && (
        <details className="mt-3 max-w-2xl text-sm text-gray-600">
          <summary className="cursor-pointer text-brand-600">Voir les versions précédentes</summary>
          <div className="mt-2 space-y-3">
            {versions.slice(1).map((v) => (
              <div key={v.id} className="card">
                <p className="text-xs text-gray-500">Version {v.version}</p>
                <pre className="mt-1 whitespace-pre-wrap text-xs text-gray-700">{v.contenu}</pre>
              </div>
            ))}
          </div>
        </details>
      )}

      <h2 className="mt-8 font-semibold text-gray-900">Commentaires</h2>
      <div className="mt-3 max-w-2xl space-y-2">
        {(comments || []).map((c) => (
          <div key={c.id} className="rounded-lg bg-gray-50 p-3 text-sm">
            {c.texte}
          </div>
        ))}
        {(comments || []).length === 0 && (
          <p className="text-xs text-gray-400">Aucun commentaire pour l&apos;instant.</p>
        )}
      </div>

      {latest.statut !== "valide" && (
        <div className="mt-6 max-w-2xl space-y-4">
          <form action={addCommentAction} className="card space-y-3">
            <input type="hidden" name="article_id" value={latest.id} />
            <label className="label">Demander des corrections</label>
            <textarea name="texte" rows={3} className="input" required placeholder="Votre commentaire..." />
            <button className="btn-secondary">Envoyer et demander des corrections</button>
          </form>

          <form action={validateArticleAction.bind(null, latest.id)}>
            <button className="btn-primary w-full">Valider l&apos;article</button>
          </form>
        </div>
      )}

      {latest.statut === "valide" && (
        <form action={togglePaiementAction.bind(null, bc.id, !bc.paiement_effectue)} className="mt-6">
          <button className={bc.paiement_effectue ? "btn-secondary" : "btn-primary"}>
            {bc.paiement_effectue ? "Paiement marqué effectué ✓ (annuler)" : "Marquer le paiement comme effectué"}
          </button>
        </form>
      )}
    </AppShell>
  );
}
