// Liste commune des spécialités pigistes. Les pigistes les cochent dans leur
// profil et l'annuaire des rédactions filtre sur ces mêmes libellés : une
// saisie libre ("business" vs "Business") empêchait le filtre de fonctionner.
export const SPECIALITES = [
  "Politique",
  "Économie",
  "Business",
  "Société",
  "International",
  "Environnement",
  "Sciences",
  "Santé",
  "Tech",
  "Culture",
  "Sport",
  "Lifestyle",
  "Enquête",
  "Reportage",
] as const;

// Retrouve le libellé officiel d'une saisie libre (ignore casse et accents).
export function normaliseSpecialite(valeur: string): string | null {
  const cle = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
  return SPECIALITES.find((s) => cle(s) === cle(valeur)) || null;
}
