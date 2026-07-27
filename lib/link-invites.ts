import type { SupabaseClient } from "@supabase/supabase-js";

// Filet de sécurité pour WF0 étape 4 : si l'inscription a eu lieu avant que
// la session ne soit active (ex. confirmation email activée), on retente le
// rattachement de la commission directe à la première connexion du pigiste.
// Autorisé par la policy RLS "bdc_update_invite_link" (email_invite ↔ email
// du compte), aucune clé service_role nécessaire.
export async function linkPendingInvites(supabase: SupabaseClient, userId: string) {
  await supabase
    .from("bons_de_commande")
    .update({ pigiste: userId, email_invite: null })
    .is("pigiste", null)
    .eq("statut", "propose");
}
