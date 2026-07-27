import type { SupabaseClient } from "@supabase/supabase-js";

// Section 6 du spec — un seul point d'entrée pour créer une notification,
// utilisé par tous les workflows (WF0-WF5).
export async function notify(
  supabase: SupabaseClient,
  destinataire: string,
  texte: string,
  lien: string | null = null
) {
  const { error } = await supabase.from("notifications").insert({
    destinataire,
    texte,
    lien,
    lue: false,
    date: new Date().toISOString(),
  });
  if (error) console.error("notify() error:", error.message);
}
