import type { SupabaseClient } from "@supabase/supabase-js";

function extOf(file: File, fallback: string) {
  const fromName = file.name?.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return fallback;
}

// Upload d'un avatar (photo pigiste / logo rédaction) dans le bucket public
// "avatars". Remplace toujours le même fichier ({userId}/photo.<ext> ou
// {userId}/logo.<ext>) pour éviter d'accumuler des fichiers orphelins.
export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  kind: "photo" | "logo"
): Promise<{ url: string | null; error: string | null }> {
  if (!file || file.size === 0) return { url: null, error: null };

  const ext = extOf(file, "jpg");
  const path = `${userId}/${kind}.${ext}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // Cache-bust pour que la nouvelle image s'affiche immédiatement.
  return { url: `${data.publicUrl}?v=${Date.now()}`, error: null };
}

// Upload de la fiche de renseignement (bucket privé "fiches"). On stocke le
// CHEMIN (pas une URL publique) dans profiles.fiche_renseignement — le
// fichier contient des données sensibles (RIB, sécu, CI).
export async function uploadFiche(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ path: string | null; error: string | null }> {
  if (!file || file.size === 0) return { path: null, error: null };

  const ext = extOf(file, "pdf");
  const path = `${userId}/fiche.${ext}`;

  const { error } = await supabase.storage.from("fiches").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) return { path: null, error: error.message };
  return { path, error: null };
}

// Génère une URL signée temporaire pour consulter une fiche privée
// (10 minutes — largement suffisant pour l'ouvrir dans un nouvel onglet).
export async function getFicheSignedUrl(supabase: SupabaseClient, path: string) {
  const { data } = await supabase.storage.from("fiches").createSignedUrl(path, 600);
  return data?.signedUrl || null;
}
