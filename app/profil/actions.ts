"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-helpers";
import { uploadAvatar, uploadFiche } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfileAction(formData: FormData) {
  const { userId, profile } = await requireUser();
  const supabase = await createClient();

  if (profile.type_compte === "pigiste") {
    const specialites = String(formData.get("specialites") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const portfolio_liens = String(formData.get("portfolio_liens") || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const update: Record<string, unknown> = {
      prenom: String(formData.get("prenom") || ""),
      nom: String(formData.get("nom") || ""),
      bio: String(formData.get("bio") || ""),
      specialites,
      portfolio_url: String(formData.get("portfolio_url") || ""),
      portfolio_liens,
      num_carte_presse: String(formData.get("num_carte_presse") || "") || null,
    };

    const photoFile = formData.get("photo_file") as File | null;
    if (photoFile && photoFile.size > 0) {
      const { url, error } = await uploadAvatar(supabase, userId, photoFile, "photo");
      if (error) redirect(`/profil?error=${encodeURIComponent(error)}`);
      if (url) update.photo = url;
    }

    const ficheFile = formData.get("fiche_file") as File | null;
    if (ficheFile && ficheFile.size > 0) {
      const { path, error } = await uploadFiche(supabase, userId, ficheFile);
      if (error) redirect(`/profil?error=${encodeURIComponent(error)}`);
      if (path) update.fiche_renseignement = path;
    }

    await supabase.from("profiles").update(update).eq("id", userId);
  } else if (profile.type_compte === "redaction") {
    // B4 : "Mon profil" ne gère plus que l'identité de connexion pour une
    // rédaction. Nom du média / logo / site web / rubriques se gèrent
    // exclusivement depuis "Profil média & rubriques" (évite le doublon).
    // Rien à faire ici pour l'instant à part le changement de mot de passe
    // (cf. updatePasswordAction ci-dessous).
  }

  revalidatePath("/profil");
}

export async function updatePasswordAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();

  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("password_confirm") || "");

  if (!password || password.length < 6) {
    redirect("/profil?pwd_error=trop_court");
  }
  if (password !== confirm) {
    redirect("/profil?pwd_error=mismatch");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/profil?pwd_error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profil?pwd_ok=1");
}
