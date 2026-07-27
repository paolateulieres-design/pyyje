"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-helpers";
import { notify } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function activateAccountAction(userId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();

  await supabase.from("profiles").update({ statut_compte: "valide" }).eq("id", userId);
  await notify(supabase, userId, "Votre compte a été validé — bienvenue sur PYYJE !", "/profil");

  revalidatePath("/admin");
  revalidatePath("/admin/utilisateurs");
}

export async function refuseAccountAction(userId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();

  await supabase.from("profiles").update({ statut_compte: "refuse" }).eq("id", userId);

  revalidatePath("/admin");
  revalidatePath("/admin/utilisateurs");
}

export async function suspendAccountAction(userId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("profiles").update({ statut_compte: "refuse" }).eq("id", userId);
  revalidatePath("/admin/utilisateurs");
}

export async function reactivateAccountAction(userId: string) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  await supabase.from("profiles").update({ statut_compte: "valide" }).eq("id", userId);
  revalidatePath("/admin/utilisateurs");
}
