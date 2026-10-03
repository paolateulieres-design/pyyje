import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { STATUT_LABELS } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

// Page de détail d'une offre (sur pitch ou commission directe) côté rédaction. Contrairement à
// /redaction/articles/[id], accessible même quand aucun article n'a encore
// été soumis (BC encore "propose" ou "accepte") — cf. demande utilisateur :
// l'historique doit permettre de voir CE qui a été proposé et à qui, à
// n'importe quel stade.
export default async function CommandeDetailRedactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await requireRole(["redaction"]);
  const supabase = await createClient();

  const { data: bc } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("id", id)
    .single();

  if (!bc || bc.redaction !== userId) redirect("/redaction/commandes");

  // Offre faite sur un pitch : on remonte au pitch pour le titre et l'auteur
  // (le pigiste n'est rattaché au bon de commande qu'à l'acceptation).
  const { data: envoi } = bc.pitch_envoi
    ? await supabase.from("pitch_envois").select("id, pitch").eq("id", bc.pitch_envoi).single()
    : { data: null };
  const { data: pitch } = envoi
    ? await supabase.from("pitches").select("titre, auteur").eq("id", envoi.pitch).single()
    : { data: null };

  const pigisteId = bc.pigiste || pitch?.auteur || null;
  const { data: pigisteProfile } = pigisteId
    ? await supabase
        .from("profiles")
        .select("prenom, nom, email")
        .eq("id", pigisteId)
        .single()
    : { data: null };

  const nomPigiste = pigisteProfile
    ? `${pigisteProfile.prenom || ""} ${pigisteProfile.nom || ""}`.trim() ||
      pigisteProfile.email
    : bc.email_invite || "Pigiste non inscrit·e";

  // Si un article a déjà été soumis, la relecture complète se fait sur la
  // page dédiée (commentaires, versions, validation, paiement).
  const { data: articles } = await supabase
    .from("articles")
    .select("id")
    .eq("bon_de_commande", bc.id)
    .limit(1);
  const hasArticle = (articles || []).length > 0;

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <Link href="/redaction/commandes" className="text-sm text-brand-600">
        ← Offres & commandes
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">
        {pitch ? `Offre — « ${pitch.titre} »` : "Commission directe"} — {nomPigiste}
      </h1>
      {envoi && (
        <Link href={`/redaction/pitchs/${envoi.id}`} className="mt-1 block text-sm text-brand-600 underline">
          Voir le pitch
        </Link>
      )}
      <span className="badge badge-blue mt-2">
        {STATUT_LABELS[bc.statut] || bc.statut}
      </span>

      <div className="card mt-6 max-w-lg space-y-2">
        <p className="text-2xl font-bold text-brand-700">{bc.prix} €</p>
        <p className="text-sm text-gray-600">Format : {bc.format}</p>
        <p className="text-sm text-gray-600">
          Deadline : {new Date(bc.deadline).toLocaleDateString("fr-FR")}
        </p>
        <p className="text-sm text-gray-600">
          {bc.nb_signes} signes espaces compris
        </p>
        <p className="text-sm text-gray-600">
          Envoyée le {new Date(bc.date_creation).toLocaleDateString("fr-FR")}
        </p>
        {bc.notes && <p className="mt-2 text-sm text-gray-500">{bc.notes}</p>}
      </div>

      {bc.statut === "propose" && (
        <p className="mt-6 text-sm text-gray-500">
          En attente de réponse du pigiste.
        </p>
      )}

      {bc.statut === "refuse" && (
        <p className="mt-6 text-sm text-gray-500">Cette proposition a été refusée.</p>
      )}

      {bc.statut === "accepte" && !hasArticle && (
        <p className="mt-6 text-sm text-gray-500">
          Acceptée par le pigiste — en attente de l&apos;article.
        </p>
      )}

      {hasArticle && (
        <Link
          href={`/redaction/articles/${bc.id}`}
          className="btn-primary mt-6 inline-flex"
        >
          Voir l&apos;article
        </Link>
      )}
    </AppShell>
  );
}
