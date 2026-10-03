import type { SupabaseClient } from "@supabase/supabase-js";
import type { BonDeCommande, StatutArticle } from "@/lib/types";

// Vue consolidée d'un bon de commande, quelle que soit sa source (offre sur
// un pitch ou commission directe), avec l'état de l'article associé.
export type CommandeVue = BonDeCommande & {
  titre: string; // titre du pitch, ou "Commission directe"
  pitchId: string | null;
  dernierArticle: StatutArticle | null;
};

export type Etape =
  | "a_repondre"
  | "a_rediger"
  | "en_relecture"
  | "corrections"
  | "validee"
  | "terminee";

export const ETAPE_LABELS: Record<Etape, string> = {
  a_repondre: "En attente de réponse",
  a_rediger: "Article à rédiger",
  en_relecture: "En relecture",
  corrections: "Corrections demandées",
  validee: "Validée",
  terminee: "Refusée / retirée",
};

export const ETAPE_BADGES: Record<Etape, string> = {
  a_repondre: "badge-yellow",
  a_rediger: "badge-blue",
  en_relecture: "badge-blue",
  corrections: "badge-red",
  validee: "badge-green",
  terminee: "badge-gray",
};

export function etapeDe(c: CommandeVue): Etape {
  if (c.statut === "propose") return "a_repondre";
  if (c.statut === "valide" || c.dernierArticle === "valide") return "validee";
  if (c.statut === "refuse" || c.statut === "retire") return "terminee";
  if (c.dernierArticle === "soumis") return "en_relecture";
  if (c.dernierArticle === "corrections_demandees") return "corrections";
  return "a_rediger";
}

// Complète une liste de bons de commande avec le titre du pitch et le statut
// de la dernière version d'article.
async function enrichir(supabase: SupabaseClient, bcs: BonDeCommande[]): Promise<CommandeVue[]> {
  if (bcs.length === 0) return [];

  const envoiIds = bcs.map((b) => b.pitch_envoi).filter(Boolean) as string[];
  const { data: envois } = envoiIds.length
    ? await supabase.from("pitch_envois").select("id, pitch").in("id", envoiIds)
    : { data: [] as { id: string; pitch: string }[] };
  const pitchIds = [...new Set((envois || []).map((e) => e.pitch))];
  const { data: pitches } = pitchIds.length
    ? await supabase.from("pitches").select("id, titre").in("id", pitchIds)
    : { data: [] as { id: string; titre: string }[] };
  const envoiToPitch = new Map((envois || []).map((e) => [e.id, e.pitch]));
  const pitchTitre = new Map((pitches || []).map((p) => [p.id, p.titre]));

  const { data: articles } = await supabase
    .from("articles")
    .select("bon_de_commande, version, statut")
    .in(
      "bon_de_commande",
      bcs.map((b) => b.id)
    );
  const dernier = new Map<string, { version: number; statut: StatutArticle }>();
  for (const a of articles || []) {
    const prev = dernier.get(a.bon_de_commande);
    if (!prev || a.version > prev.version) dernier.set(a.bon_de_commande, a);
  }

  return bcs.map((b) => {
    const pitchId = b.pitch_envoi ? envoiToPitch.get(b.pitch_envoi) || null : null;
    return {
      ...b,
      pitchId,
      titre: (pitchId && pitchTitre.get(pitchId)) || "Commission directe",
      dernierArticle: dernier.get(b.id)?.statut || null,
    };
  });
}

// Toutes les commandes d'un pigiste : celles qui lui sont attribuées et les
// offres reçues sur ses pitchs (pas encore rattachées tant qu'il n'a pas accepté).
export async function commandesDuPigiste(supabase: SupabaseClient, userId: string) {
  const { data: pitches } = await supabase.from("pitches").select("id").eq("auteur", userId);
  const pitchIds = (pitches || []).map((p) => p.id);
  const { data: envois } = pitchIds.length
    ? await supabase.from("pitch_envois").select("id").in("pitch", pitchIds)
    : { data: [] as { id: string }[] };
  const envoiIds = (envois || []).map((e) => e.id);

  const filtre = envoiIds.length
    ? `pigiste.eq.${userId},pitch_envoi.in.(${envoiIds.join(",")})`
    : `pigiste.eq.${userId}`;

  const { data: bcs } = await supabase
    .from("bons_de_commande")
    .select("*")
    .or(filtre)
    .order("date_creation", { ascending: false });

  return enrichir(supabase, (bcs || []) as BonDeCommande[]);
}

// Toutes les commandes passées par une rédaction (offres sur pitch + commissions directes).
export async function commandesDeLaRedaction(supabase: SupabaseClient, userId: string) {
  const { data: bcs } = await supabase
    .from("bons_de_commande")
    .select("*")
    .eq("redaction", userId)
    .order("date_creation", { ascending: false });

  return enrichir(supabase, (bcs || []) as BonDeCommande[]);
}
