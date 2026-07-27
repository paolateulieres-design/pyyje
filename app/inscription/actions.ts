"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const type_compte = String(formData.get("type_compte") || "pigiste") as
    | "pigiste"
    | "redaction";
  const prenom = String(formData.get("prenom") || "");
  const nom = String(formData.get("nom") || "");
  const nom_media = String(formData.get("nom_media") || "");
  const inviteToken = String(formData.get("invite_token") || "");

  if (!email || !password) {
    redirect("/inscription?error=missing_fields");
  }

  const supabase = await createClient();

  // Le profil (public.profiles) est créé automatiquement par un trigger côté
  // base de données (handle_new_user) à partir des métadonnées ci-dessous —
  // ça fonctionne même si la confirmation par email est active et qu'aucune
  // session n'existe encore juste après l'inscription.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        type_compte,
        prenom: type_compte === "pigiste" ? prenom : null,
        nom: type_compte === "pigiste" ? nom : null,
        nom_media: type_compte === "redaction" ? nom_media : null,
      },
    },
  });

  if (error || !data.user) {
    redirect(`/inscription?error=${encodeURIComponent(error?.message || "signup_failed")}`);
  }

  const userId = data.user!.id;

  // Notifie les admins (fonction SECURITY DEFINER, fonctionne sans session active).
  await supabase.rpc("notify_admins_new_account", { p_email: email });

  // WF0 étape 4 : commission directe — lier automatiquement le compte
  // fraîchement créé au BonDeCommande en attente (autorisé par la policy RLS
  // "bdc_update_invite_link" qui compare l'email du token à l'email du compte).
  if (inviteToken && type_compte === "pigiste") {
    const { data: resolved } = (await supabase
      .rpc("resolve_invite_token", { p_token: inviteToken })
      .maybeSingle()) as { data: { bc_id: string; has_pigiste: boolean } | null };

    if (resolved?.bc_id) {
      await supabase
        .from("bons_de_commande")
        .update({ pigiste: userId, email_invite: null })
        .eq("id", resolved.bc_id);
      redirect(`/pigiste/commandes/${resolved.bc_id}`);
    }
  }

  redirect("/profil?inscription=ok");
}
