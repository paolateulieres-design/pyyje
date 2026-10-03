import type { SupabaseClient } from "@supabase/supabase-js";

// Statistiques mensuelles d'une rédaction, par mois de RÉCEPTION de l'article
// (date de la première version soumise par le pigiste).
export type StatsMois = {
  cle: string; // "2026-10"
  libelle: string; // "oct. 2026"
  recus: { nb: number; montant: number };
  valides: { nb: number; montant: number };
  aPayer: { nb: number; montant: number }; // validés, paiement non effectué
  payes: { nb: number; montant: number };
};

function libelleMois(cle: string) {
  const [a, m] = cle.split("-").map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function cleMois(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function statistiquesRedaction(
  supabase: SupabaseClient,
  userId: string,
  nbMois = 12
) {
  const { data: bcs } = await supabase
    .from("bons_de_commande")
    .select("id, prix, statut, paiement_effectue")
    .eq("redaction", userId);

  const ids = (bcs || []).map((b) => b.id);
  const { data: articles } = ids.length
    ? await supabase
        .from("articles")
        .select("bon_de_commande, date_soumission")
        .in("bon_de_commande", ids)
    : { data: [] as { bon_de_commande: string; date_soumission: string }[] };

  // Première réception de chaque bon de commande.
  const reception = new Map<string, Date>();
  for (const a of articles || []) {
    const d = new Date(a.date_soumission);
    const prev = reception.get(a.bon_de_commande);
    if (!prev || d < prev) reception.set(a.bon_de_commande, d);
  }

  // Les nbMois derniers mois, même vides, pour des graphiques sans trou.
  const mois = new Map<string, StatsMois>();
  const now = new Date();
  for (let i = nbMois - 1; i >= 0; i--) {
    const cle = cleMois(new Date(now.getFullYear(), now.getMonth() - i, 1));
    mois.set(cle, {
      cle,
      libelle: libelleMois(cle),
      recus: { nb: 0, montant: 0 },
      valides: { nb: 0, montant: 0 },
      aPayer: { nb: 0, montant: 0 },
      payes: { nb: 0, montant: 0 },
    });
  }

  const enAttente = { nb: 0, montant: 0 };

  for (const b of bcs || []) {
    const prix = Number(b.prix) || 0;
    const valide = b.statut === "valide";
    if (valide && !b.paiement_effectue) {
      enAttente.nb++;
      enAttente.montant += prix;
    }

    const d = reception.get(b.id);
    if (!d) continue;
    const m = mois.get(cleMois(d));
    if (!m) continue; // hors de la période affichée
    m.recus.nb++;
    m.recus.montant += prix;
    if (valide) {
      m.valides.nb++;
      m.valides.montant += prix;
      const cible = b.paiement_effectue ? m.payes : m.aPayer;
      cible.nb++;
      cible.montant += prix;
    }
  }

  return { mois: [...mois.values()], enAttente };
}
