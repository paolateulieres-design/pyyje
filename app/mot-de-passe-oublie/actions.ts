"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

// Demande de lien de réinitialisation en flux "implicit" : le lien reçu
// ramène les jetons de session dans l'URL (#access_token=...), utilisables
// dans n'importe quel navigateur. Le flux PKCE par défaut exigeait d'ouvrir
// le lien dans le navigateur qui avait fait la demande.
export async function requestPasswordResetAction(email: string) {
  const h = await headers();
  const origin =
    h.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://pyyje.netlify.app";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false } }
  );

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${origin}/reinitialiser-mot-de-passe`,
  });
  return { error: error?.message || null };
}
