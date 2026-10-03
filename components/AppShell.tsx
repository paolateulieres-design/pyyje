import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import SidebarNav from "@/components/SidebarNav";
import type { Profile } from "@/lib/types";

export default async function AppShell({
  profile,
  navLinks,
  children,
}: {
  profile: Profile;
  navLinks: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { count: unread } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("destinataire", profile.id)
    .eq("lue", false);

  const nom =
    profile.type_compte === "redaction"
      ? profile.nom_media || profile.email
      : `${profile.prenom || ""} ${profile.nom || ""}`.trim() || profile.email;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-encre p-5">
        <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-extrabold tracking-tight text-white">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-lg bg-jaune text-sm text-encre">
            P
          </span>
          pyyje
        </Link>
        <SidebarNav navLinks={navLinks} unreadCount={unread || 0} />
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
          <div className="text-sm text-gray-500">
            Connecté en tant que <span className="font-medium text-gray-800">{nom}</span>
            <span className="badge badge-gray ml-2">{profile.type_compte}</span>
          </div>
          <LogoutButton />
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
