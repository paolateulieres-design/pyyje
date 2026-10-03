"use client";

import { useState } from "react";
import Link from "next/link";

// Encart à onglets du hero : un parcours par public (rédaction / pigiste),
// chacun avec son appel à l'action.
const ONGLETS = {
  redaction: {
    label: "Je suis une rédaction",
    titre: "Trouvez le bon pigiste pour chaque sujet",
    points: ["Pitchs reçus triés par rubrique", "Annuaire de pigistes vérifiés", "Bon de commande en 2 clics"],
    cta: "Créer mon espace rédaction",
    href: "/inscription?type=redaction",
  },
  pigiste: {
    label: "Je suis pigiste",
    titre: "Proposez vos sujets aux bonnes rédactions",
    points: ["Un pitch, plusieurs rédactions, en toute confidentialité", "Offres claires : prix, deadline, format", "Gratuit, pour toujours"],
    cta: "Créer mon profil pigiste",
    href: "/inscription?type=pigiste",
  },
} as const;

type Cle = keyof typeof ONGLETS;

export default function HeroTabs() {
  const [actif, setActif] = useState<Cle>("redaction");
  const o = ONGLETS[actif];

  return (
    <div className="mt-10 max-w-xl">
      <div role="tablist" className="flex gap-1">
        {(Object.keys(ONGLETS) as Cle[]).map((cle) => (
          <button
            key={cle}
            role="tab"
            type="button"
            aria-selected={actif === cle}
            onClick={() => setActif(cle)}
            className={`rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              actif === cle ? "bg-white text-encre" : "bg-white/40 text-encre/70 hover:bg-white/60"
            }`}
          >
            {ONGLETS[cle].label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="rounded-b-2xl rounded-tr-2xl bg-white p-6 shadow-xl shadow-corail-fonce/10">
        <p className="font-titre text-xl font-semibold text-encre">{o.titre}</p>
        <ul className="mt-4 space-y-2">
          {o.points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
              <span aria-hidden className="mt-0.5 text-corail">✓</span>
              {p}
            </li>
          ))}
        </ul>
        <Link
          href={o.href}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-corail px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-corail-fonce"
        >
          {o.cta}
        </Link>
      </div>
    </div>
  );
}
