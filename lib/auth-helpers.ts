import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { linkPendingInvites } from "@/lib/link-invites";
import type { Profile, TypeCompte } from "@/lib/types";

// Récupère l'utilisateur connecté + son profil. Redirige vers /connexion si absent.
export async function requireUser(): Promise<{ userId: string; email: string; profile: Profile }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/connexion");

  // Filet de sécurité WF0 étape 4 (voir lib/link-invites.ts) : retente le
  // rattachement d'une éventuelle commission directe en attente à chaque
  // chargement de page pour un pigiste.
  if (profile.type_compte === "pigiste") {
    await linkPendingInvites(supabase, user.id);
  }

  return { userId: user.id, email: user.email!, profile: profile as Profile };
}

// Règle métier : "Aucun compte pigiste ou rédaction n'est actif sans validation
// admin. Bloquer l'accès aux pages internes si statut_compte != actif."
export async function requireRole(types: TypeCompte[]) {
  const { userId, email, profile } = await requireUser();

  if (!types.includes(profile.type_compte)) {
    redirect("/");
  }

  if (profile.type_compte !== "admin" && profile.statut_compte !== "valide") {
    redirect("/profil?en_attente=1");
  }

  return { userId, email, profile };
}
