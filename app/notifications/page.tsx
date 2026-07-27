import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { markAllReadAction, markReadAction } from "./actions";
import Link from "next/link";

export default async function NotificationsPage() {
  const { userId, profile } = await requireUser();
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("destinataire", userId)
    .order("date", { ascending: false });

  return (
    <AppShell profile={profile} navLinks={navLinksFor(profile.type_compte)}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
        <form action={markAllReadAction}>
          <button className="btn-secondary text-xs">Tout marquer comme lu</button>
        </form>
      </div>

      <div className="mt-6 space-y-2">
        {(notifications || []).length === 0 && (
          <p className="text-sm text-gray-500">Aucune notification pour le moment.</p>
        )}
        {(notifications || []).map((n) => (
          <div
            key={n.id}
            className={`card flex items-center justify-between ${!n.lue ? "border-brand-200 bg-brand-50/40" : ""}`}
          >
            <div>
              <p className="text-sm text-gray-800">{n.texte}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(n.date).toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {n.lien && (
                <Link href={n.lien} className="btn-secondary text-xs">
                  Voir
                </Link>
              )}
              {!n.lue && (
                <form action={markReadAction.bind(null, n.id)}>
                  <button className="text-xs text-brand-600">Marquer lu</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
