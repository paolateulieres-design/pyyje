import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

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

  // Copie par email (lecture autorisée par la policy "profiles_select_authenticated").
  const { data: dest } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", destinataire)
    .maybeSingle();
  if (dest?.email) {
    await sendEmail({ to: dest.email, subject: `PYYJE — ${texte}`, texte, lien });
  }
}
