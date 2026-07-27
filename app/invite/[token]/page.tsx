import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Point d'entrée du lien envoyé lors d'une commission directe (WF0).
// Résout le token vers la bonne destination : inscription pré-remplie si le
// pigiste n'a pas encore de compte, ou directement le bon de commande sinon.
// Utilise la fonction SQL SECURITY DEFINER resolve_invite_token (pas besoin
// de clé service_role, fonctionne aussi pour un visiteur non connecté).
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: resolved } = (await supabase
    .rpc("resolve_invite_token", { p_token: token })
    .maybeSingle()) as { data: { bc_id: string; has_pigiste: boolean } | null };

  if (!resolved?.bc_id) redirect("/inscription");

  if (!resolved.has_pigiste) {
    redirect(`/inscription?invite=${token}`);
  }

  const target = `/pigiste/commandes/${resolved.bc_id}`;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(target);

  redirect(`/connexion?next=${encodeURIComponent(target)}`);
}
