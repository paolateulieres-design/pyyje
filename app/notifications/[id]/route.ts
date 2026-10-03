import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/email";
import { NextResponse, type NextRequest } from "next/server";

// Ouvre une notification : la marque comme lue puis redirige vers son lien.
// Avant, cliquer sur "Voir" laissait la notification non lue (et le compteur
// rouge du menu ne descendait jamais).
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(siteUrl("/connexion"));

  const { data: notif } = await supabase
    .from("notifications")
    .update({ lue: true })
    .eq("id", id)
    .eq("destinataire", user.id)
    .select("lien")
    .maybeSingle();

  const lien = notif?.lien && notif.lien.startsWith("/") ? notif.lien : "/notifications";
  return NextResponse.redirect(siteUrl(lien));
}
