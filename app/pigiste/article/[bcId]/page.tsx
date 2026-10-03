import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import { submitArticleAction } from "../../actions";
import { redirect } from "next/navigation";

export default async function MonArticlePage({
  params,
}: {
  params: Promise<{ bcId: string }>;
}) {
  const { bcId } = await params;
  const { userId, profile } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const { data: bc } = await supabase.from("bons_de_commande").select("*").eq("id", bcId).single();
  if (!bc || bc.pigiste !== userId) redirect("/pigiste");

  const { data: versions } = await supabase
    .from("articles")
    .select("*")
    .eq("bon_de_commande", bcId)
    .order("version", { ascending: false });

  const latest = versions?.[0];

  const articleIds = (versions || []).map((v) => v.id);
  const { data: comments } = articleIds.length
    ? await supabase
        .from("commentaires")
        .select("*")
        .in("article", articleIds)
        .order("date", { ascending: true })
    : { data: [] as any[] };

  const commentsByArticle = new Map<string, any[]>();
  for (const c of comments || []) {
    if (!commentsByArticle.has(c.article)) commentsByArticle.set(c.article, []);
    commentsByArticle.get(c.article)!.push(c);
  }

  const canEdit = !latest || latest.statut === "corrections_demandees";
  const ficheManquante = !profile.fiche_renseignement;

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <h1 className="text-xl font-semibold text-gray-900">Mon article</h1>
      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
        <span>{bc.format} · {bc.prix} € · {bc.nb_signes} signes</span>
        <span>· deadline {new Date(bc.deadline).toLocaleDateString("fr-FR")}</span>
      </div>
      {latest && (
        <span className="badge badge-blue mt-2">{STATUT_LABELS[latest.statut] || latest.statut}</span>
      )}

      {ficheManquante && (
        <div className="card mt-6 max-w-2xl border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-800">
            Pensez à ajouter votre fiche de renseignement dans{" "}
            <a href="/profil" className="font-medium underline">
              votre profil
            </a>
            . Elle n&apos;est pas nécessaire pour rendre l&apos;article, mais la rédaction en
            aura besoin pour vous payer une fois la pige validée.
          </p>
        </div>
      )}

      {canEdit ? (
        <form action={submitArticleAction} className="card mt-6 max-w-2xl space-y-4">
          <input type="hidden" name="bon_de_commande" value={bcId} />
          <div>
            <label className="label">Contenu de l&apos;article</label>
            <textarea
              name="contenu"
              rows={16}
              defaultValue={latest?.contenu || ""}
              className="input font-mono text-sm"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            {latest ? "Re-soumettre" : "Soumettre"}
          </button>
        </form>
      ) : latest ? (
        <div className="card mt-6 max-w-2xl">
          <p className="text-sm text-gray-500">
            Article {latest.statut === "valide" ? "validé" : "en attente de relecture"} — v{latest.version}
          </p>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{latest.contenu}</pre>
        </div>
      ) : null}

      <h2 className="mt-8 font-semibold text-gray-900">Historique & commentaires</h2>
      <div className="mt-3 space-y-4">
        {(versions || []).map((v) => (
          <div key={v.id} className="card">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">Version {v.version}</p>
              <span className="badge badge-gray">{STATUT_LABELS[v.statut] || v.statut}</span>
            </div>
            <div className="mt-3 space-y-2">
              {(commentsByArticle.get(v.id) || []).map((c) => (
                <div key={c.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="text-gray-800">{c.texte}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(c.date).toLocaleString("fr-FR")}
                    {c.resolu ? " · traité" : ""}
                  </p>
                </div>
              ))}
              {(commentsByArticle.get(v.id) || []).length === 0 && (
                <p className="text-xs text-gray-400">Aucun commentaire sur cette version.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
