// Types & statuts — miroir exact du spec "Specs MVP — Plateforme Piges"

export type TypeCompte = "pigiste" | "redaction" | "admin";
export type StatutCompte = "en_attente" | "valide" | "refuse";

export type StatutPitch = "brouillon" | "envoye" | "en_cours" | "cloture";
export type StatutPitchEnvoi =
  | "envoye"
  | "vu"
  | "refuse"
  | "offre_faite"
  | "accepte_par_pigiste"
  | "retire";
export type SourceBonDeCommande = "pitch_accepte" | "commission_directe";
export type StatutBonDeCommande =
  | "propose"
  | "accepte"
  | "refuse"
  | "retire"
  | "valide";
export type StatutArticle = "soumis" | "corrections_demandees" | "valide";

export interface Profile {
  id: string;
  email: string;
  type_compte: TypeCompte;
  prenom: string | null;
  nom: string | null;
  photo: string | null;
  bio: string | null;
  specialites: string[] | null;
  portfolio_url: string | null;
  portfolio_liens: string[] | null;
  num_carte_presse: string | null;
  fiche_renseignement: string | null;
  nom_media: string | null;
  logo: string | null;
  site_web: string | null;
  rubriques: string[] | null;
  statut_compte: StatutCompte;
  created_at: string;
}

export interface Pitch {
  id: string;
  titre: string;
  resume: string;
  angle: string;
  auteur: string; // profile id (pigiste)
  date_creation: string;
  statut: StatutPitch;
}

export interface PitchEnvoi {
  id: string;
  pitch: string; // pitch id
  redaction: string; // profile id
  rubrique_ciblee: string | null;
  date_envoi: string;
  statut: StatutPitchEnvoi;
  message_refus: string | null;
}

export interface BonDeCommande {
  id: string;
  pitch_envoi: string | null;
  source: SourceBonDeCommande;
  email_invite: string | null;
  token_invitation: string | null;
  pigiste: string | null; // profile id
  redaction: string; // profile id
  prix: number;
  deadline: string;
  format: string;
  nb_signes: number;
  notes: string | null;
  titre: string | null; // sujet saisi pour une commission directe
  statut: StatutBonDeCommande;
  paiement_effectue: boolean;
  date_creation: string;
}

export interface ArticleRow {
  id: string;
  bon_de_commande: string;
  contenu: string | null;
  fichier: string | null;
  version: number;
  date_soumission: string;
  statut: StatutArticle;
}

export interface Commentaire {
  id: string;
  article: string;
  auteur: string;
  texte: string;
  date: string;
  resolu: boolean;
}

export interface NotificationRow {
  id: string;
  destinataire: string;
  texte: string;
  lien: string | null;
  lue: boolean;
  date: string;
}

export const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  valide: "Validé",
  refuse: "Refusé",
  brouillon: "Brouillon",
  envoye: "Envoyé",
  en_cours: "En cours",
  cloture: "Clôturé",
  vu: "Vu",
  offre_faite: "Offre faite",
  accepte_par_pigiste: "Accepté par le pigiste",
  retire: "Retiré",
  propose: "Proposé",
  accepte: "Accepté",
  soumis: "Soumis",
  corrections_demandees: "Corrections demandées",
};
