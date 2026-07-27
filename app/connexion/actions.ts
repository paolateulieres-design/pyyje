"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/connexion?error=${encodeURIComponent(error?.message || "identifiants invalides")}`);
  }

  if (next) redirect(next);

  const { data: profile } = await supabase
    .from("profiles")
    .select("type_compte")
    .eq("id", data.user!.id)
    .single();

  if (profile?.type_compte === "admin") redirect("/admin");
  if (profile?.type_compte === "redaction") redirect("/redaction");
  redirect("/pigiste");
}
