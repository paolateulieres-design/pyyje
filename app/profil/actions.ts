"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

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

    await supabase
      .from("profiles")
      .update({
        prenom: String(formData.get("prenom") || ""),
        nom: String(formData.get("nom") || ""),
        photo: String(formData.get("photo") || "") || null,
        bio: String(formData.get("bio") || ""),
        specialites,
        portfolio_url: String(formData.get("portfolio_url") || ""),
        portfolio_liens,
        num_carte_presse: String(formData.get("num_carte_presse") || "") || null,
        fiche_renseignement: String(formData.get("fiche_renseignement") || "") || null,
      })
      .eq("id", userId);
  } else if (profile.type_compte === "redaction") {
    await supabase
      .from("profiles")
      .update({
        nom_media: String(formData.get("nom_media") || ""),
        logo: String(formData.get("logo") || "") || null,
        site_web: String(formData.get("site_web") || ""),
      })
      .eq("id", userId);
  }

  revalidatePath("/profil");
}
