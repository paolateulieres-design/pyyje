import type { TypeCompte } from "@/lib/types";

export function navLinksFor(type: TypeCompte) {
  if (type === "admin") {
    return [
      { href: "/admin", label: "Dashboard admin" },
      { href: "/admin/utilisateurs", label: "Liste utilisateurs" },
    ];
  }
  if (type === "redaction") {
    return [
      { href: "/redaction", label: "Dashboard" },
      { href: "/redaction/pitchs", label: "Pitchs reçus" },
      { href: "/redaction/pigistes", label: "Annuaire pigistes" },
      { href: "/redaction/commission-directe", label: "Commission directe" },
      { href: "/redaction/articles", label: "Articles en cours" },
      { href: "/redaction/profil", label: "Profil média & rubriques" },
    ];
  }
  return [
    { href: "/pigiste", label: "Dashboard" },
    { href: "/pigiste/pitchs", label: "Mes pitchs" },
    { href: "/pigiste/pitchs/nouveau", label: "Nouveau pitch" },
    { href: "/pigiste/historique", label: "Historique" },
  ];
}
