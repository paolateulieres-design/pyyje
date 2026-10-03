import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import {
  commandesDuPigiste,
  etapeDe,
  ETAPE_BADGES,
  ETAPE_LABELS,
  type CommandeVue,
  type Etape,
} from "@/lib/commandes";
import Link from "next/link";

// Point d'entrée unique du pigiste pour toutes ses commandes : offres reçues,
// commissions directes, articles à rédiger ou en relecture. Avant, on n'y
// accédait que par le lien de la notification.
const SECTIONS: { id: string; titre: string; etapes: Etape[]; vide: string }[] = [
  {
    id: "offres",
    titre: "Offres à traiter",
    etapes: ["a_repondre"],
    vide: "Aucune offre en attente de réponse.",
  },
  {
    id: "en-cours",
    titre: "Articles en cours",
    etapes: ["a_rediger", "corrections", "en_relecture"],
    vide: "Aucun article en cours.",
  },
  {
    id: "terminees",
    titre: "Terminées",
    etapes: ["validee", "terminee"],
    vide: "Rien pour le moment.",
  },
];

function lienCommande(c: CommandeVue) {
  // Une offre sur pitch s'accepte depuis le pitch (comparaison des offres
  // et fermeture automatique des autres envois).
  if (c.statut === "propose") {
    return c.pitchId ? `/pigiste/pitchs/${c.pitchId}` : `/pigiste/commandes/${c.id}`;
  }
  if (c.statut === "accepte" || c.statut === "valide") return `/pigiste/article/${c.id}`;
  return `/pigiste/commandes/${c.id}`;
}

export default async function MesCommandesPage() {
  const { userId, profile } = await requireRole(["pigiste"]);
  const supabase = await createClient();

  const commandes = await commandesDuPigiste(supabase, userId);

  const { data: redactions } = commandes.length
    ? await supabase
        .from("profiles")
        .select("id, nom_media")
        .in("id", [...new Set(commandes.map((c) => c.redaction))])
    : { data: [] as { id: string; nom_media: string | null }[] };
  const nomMedia = new Map((redactions || []).map((r) => [r.id, r.nom_media]));

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <h1 className="text-xl font-semibold text-gray-900">Mes commandes</h1>
      <p className="mt-1 text-sm text-gray-500">
        Toutes les offres et commissions reçues, et les articles à rendre.
      </p>

      {SECTIONS.map((section) => {
        const items = commandes.filter((c) => section.etapes.includes(etapeDe(c)));
        return (
          <section key={section.id} id={section.id} className="mt-8 scroll-mt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {section.titre}{" "}
              <span className="text-sm font-normal text-gray-500">({items.length})</span>
            </h2>
            <div className="mt-3 space-y-2">
              {items.length === 0 && <p className="text-sm text-gray-500">{section.vide}</p>}
              {items.map((c) => {
                const etape = etapeDe(c);
                return (
                  <Link
                    key={c.id}
                    href={lienCommande(c)}
                    className="card flex items-center justify-between gap-4 transition-colors hover:border-brand-500"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{c.titre}</p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {nomMedia.get(c.redaction) || "Rédaction"} · {c.prix} € · deadline{" "}
                        {new Date(c.deadline).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className={`badge ${ETAPE_BADGES[etape]} shrink-0`}>
                      {ETAPE_LABELS[etape]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </AppShell>
  );
}
