"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function markReadAction(id: string) {
  const { userId } = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ lue: true })
    .eq("id", id)
    .eq("destinataire", userId);
  revalidatePath("/", "layout");
}

export async function markAllReadAction() {
  const { userId } = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ lue: true })
    .eq("destinataire", userId)
    .eq("lue", false);
  revalidatePath("/", "layout");
}
