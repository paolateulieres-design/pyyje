"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

// Corrige B1/B2 : la sidebar ne mettait aucun lien en surbrillance selon la
// page active (Server Component sans accès à l'URL courante). Ce composant
// client utilise usePathname() pour déterminer précisément quel lien est actif.
function matches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// Un seul lien actif : le plus précis. Sinon "Dashboard" (/pigiste) restait
// surligné sur toutes les sous-pages, et "Mes pitchs" sur "Nouveau pitch".
function activeHref(pathname: string, hrefs: string[]) {
  return hrefs
    .filter((h) => matches(pathname, h))
    .sort((a, b) => b.length - a.length)[0];
}

function NavItem({
  href,
  label,
  active,
  extra,
}: {
  href: string;
  label: string;
  active: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-brand-50 font-medium text-brand-700"
          : "text-gray-700 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {label}
      {extra}
    </Link>
  );
}

export default function SidebarNav({
  navLinks,
  unreadCount,
}: {
  navLinks: NavLink[];
  unreadCount: number;
}) {
  const pathname = usePathname();
  const current = activeHref(pathname, [
    ...navLinks.map((l) => l.href),
    "/notifications",
    "/profil",
  ]);

  return (
    <nav className="space-y-1">
      {navLinks.map((link) => (
        <NavItem
          key={link.href}
          href={link.href}
          label={link.label}
          active={current === link.href}
        />
      ))}
      <NavItem
        href="/notifications"
        label="Notifications"
        active={current === "/notifications"}
        extra={!!unreadCount && <span className="badge badge-red">{unreadCount}</span>}
      />
      <NavItem href="/profil" label="Mon profil" active={current === "/profil"} />
    </nav>
  );
}
