import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/email";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// Liens envoyés par email (réinitialisation du mot de passe, confirmation).
// Vérification côté serveur via token_hash : fonctionne même si le lien est
// ouvert dans un autre navigateur que celui où la demande a été faite, ce
// qui n'était pas le cas du flux PKCE par défaut (lien "invalide").
// Le modèle d'email Supabase doit pointer vers :
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reinitialiser-mot-de-passe
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  // Sur Netlify, request.nextUrl.origin est l'URL technique du déploiement
  // (xxxx--pyyje.netlify.app) : on redirige vers l'adresse publique du site.
  const origin = siteUrl();
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/";
  // Redirection interne uniquement.
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(`${origin}${destination}`);
  }

  return NextResponse.redirect(`${origin}/mot-de-passe-oublie?lien=invalide`);
}
