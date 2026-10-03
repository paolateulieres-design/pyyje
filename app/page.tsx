import Link from "next/link";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";
import HeroTabs from "@/components/landing/HeroTabs";

const titre = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-titre", weight: ["600", "700", "800"] });
const texte = DM_Sans({ subsets: ["latin"], variable: "--font-texte" });

const RUBRIQUES = [
  { nom: "Politique & Société", formats: ["Enquêtes", "Reportages", "Décryptages"], initiales: ["CL", "MB", "SA"] },
  { nom: "Économie & Business", formats: ["Portraits d'entreprises", "Analyses de marché", "Interviews"], initiales: ["JD", "NK", "PT"] },
  { nom: "International", formats: ["Correspondances", "Reportages terrain", "Chroniques"], initiales: ["AH", "LR", "YO"] },
  { nom: "Culture", formats: ["Critiques", "Portraits d'artistes", "Agenda"], initiales: ["EM", "VC", "TG"] },
  { nom: "Sciences, Santé & Tech", formats: ["Vulgarisation", "Enquêtes", "Dossiers"], initiales: ["RB", "IF", "OD"] },
  { nom: "Sport & Lifestyle", formats: ["Comptes rendus", "Portraits", "Tendances"], initiales: ["KM", "HS", "BL"] },
];

const COULEURS_AVATAR = ["bg-corail text-white", "bg-rose text-encre", "bg-encre-clair text-white"];

const GARANTIES = [
  { icone: "🔒", texte: "Pitchs confidentiels" },
  { icone: "📄", texte: "Bons de commande clairs" },
  { icone: "✓", texte: "Pigistes et rédactions vérifiés" },
];

const ETAPES = [
  { n: "1", titre: "Le pitch", texte: "Le pigiste propose son sujet à une ou plusieurs rédactions, qui ne voient jamais les autres destinataires." },
  { n: "2", titre: "L'offre", texte: "La rédaction fait une offre : prix, deadline, format, nombre de signes. Le pigiste compare et accepte." },
  { n: "3", titre: "L'article", texte: "Le pigiste rend son texte, la rédaction commente et demande des corrections, versions à l'appui." },
  { n: "4", titre: "La validation", texte: "Article validé, fiche de renseignement transmise, paiement suivi : la pige est bouclée." },
];

const AVANTAGES = [
  { titre: "Fini les pitchs perdus dans les boîtes mail", texte: "Chaque proposition est suivie : vue, offre faite, acceptée ou refusée. Plus besoin de relancer pour savoir où en est un sujet." },
  { titre: "Un seul document de référence", texte: "Le bon de commande fixe prix, deadline et format. Pigiste et rédaction parlent de la même chose, du début à la fin." },
  { titre: "La paperasse en moins", texte: "La fiche de renseignement est saisie une fois et transmise automatiquement à la rédaction quand c'est nécessaire." },
  { titre: "Une vision claire des budgets", texte: "Les rédactions suivent chaque mois les articles reçus, validés et à payer, en nombre et en montant." },
];

export default function LandingPage() {
  return (
    <div className={`${titre.variable} ${texte.variable} bg-white font-texte text-encre`}>
      <LandingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-corail">
          {/* Formes organiques décoratives */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-20 hidden h-[760px] w-[760px] lg:block"
            viewBox="0 0 600 600"
          >
            <path d="M420 20c120 60 190 190 160 330S420 600 280 590 20 470 30 320 300-40 420 20z" fill="#f5b9e6" />
            <path d="M470 120c80 70 110 190 60 290s-170 160-260 120-120-170-80-270 200-210 280-140z" fill="#d64a3e" opacity=".55" />
          </svg>
          <svg aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 opacity-40" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="100" fill="#f5b9e6" />
          </svg>

          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:pb-28 lg:pt-20">
            <div className="max-w-2xl">
              <h1 className="font-titre text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                La pige, de A à Z.{" "}
                <span className="inline-block -rotate-1 rounded-2xl bg-rose px-3 text-encre">Sans friction.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/90 sm:text-xl">
                Les pigistes proposent leurs sujets, les rédactions font leurs offres. Pitch, bon de
                commande, article et validation : tout se passe au même endroit.
              </p>
              <HeroTabs />
            </div>
          </div>
        </section>

        {/* Garanties */}
        <section className="border-b border-black/5 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-10 gap-y-4 px-4 py-6 text-sm text-gray-600 sm:px-6">
            {GARANTIES.map((g) => (
              <p key={g.texte} className="flex items-center gap-3">
                <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-corail-pale text-corail">
                  {g.icone}
                </span>
                {g.texte}
              </p>
            ))}
          </div>
        </section>

        {/* Rubriques */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center font-titre text-3xl font-bold tracking-tight sm:text-5xl">
              Vos sujets, des pigistes spécialisés
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
              Quelle que soit la rubrique, trouvez des journalistes qui la connaissent sur le bout des doigts.
            </p>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {RUBRIQUES.map((r) => (
                <div
                  key={r.nom}
                  className="rounded-3xl border border-black/5 bg-white p-7 text-center shadow-[0_8px_30px_rgba(29,59,71,0.07)] transition-transform hover:-translate-y-1"
                >
                  <div className="flex justify-center -space-x-2">
                    {r.initiales.map((ini, i) => (
                      <span
                        key={ini}
                        aria-hidden
                        className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white text-xs font-bold ${COULEURS_AVATAR[i]}`}
                      >
                        {ini}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 font-titre text-xl font-bold">{r.nom}</h3>
                  <ul className="mt-3 space-y-1 text-sm text-gray-600">
                    {r.formats.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pour les rédactions */}
        <section id="redactions" className="scroll-mt-20 bg-creme py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <MockBonDeCommande />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-corail">Pour les rédactions</p>
              <h2 className="mt-3 font-titre text-3xl font-bold tracking-tight sm:text-4xl">
                Commandez vos piges en deux clics
              </h2>
              <p className="mt-5 text-gray-700">
                Recevez des pitchs ciblés par rubrique, ou allez chercher directement le bon profil dans
                l&apos;annuaire des pigistes. Faites une offre, relisez, validez : chaque étape est
                tracée, et vous suivez vos budgets mois par mois.
              </p>
              <Link
                href="/inscription?type=redaction"
                className="mt-8 inline-flex rounded-full bg-encre px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-encre-clair"
              >
                Créer mon espace rédaction
              </Link>
            </div>
          </div>
        </section>

        {/* Pour les pigistes */}
        <section id="pigistes" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-corail">Pour les pigistes</p>
              <h2 className="mt-3 font-titre text-3xl font-bold tracking-tight sm:text-4xl">
                Vos sujets méritent d&apos;être lus
              </h2>
              <p className="mt-5 text-gray-700">
                Envoyez un même pitch à plusieurs rédactions en toute confidentialité, comparez les
                offres et acceptez celle qui vous convient. Vos commandes, vos articles et vos
                corrections sont réunis au même endroit. Gratuit, pour toujours.
              </p>
              <Link
                href="/inscription?type=pigiste"
                className="mt-8 inline-flex rounded-full bg-encre px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-encre-clair"
              >
                Rejoindre les pigistes
              </Link>
            </div>
            <MockPitch />
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="fonctionnement" className="scroll-mt-20 bg-encre py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center font-titre text-3xl font-bold tracking-tight sm:text-5xl">
              Du pitch au paiement
            </h2>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {ETAPES.map((e) => (
                <div key={e.n}>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-corail font-titre text-xl font-bold">
                    {e.n}
                  </span>
                  <h3 className="mt-5 font-titre text-xl font-bold">{e.titre}</h3>
                  <p className="mt-2 text-sm text-white/75">{e.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center font-titre text-3xl font-bold tracking-tight sm:text-5xl">
              Une nouvelle façon de travailler ensemble
            </h2>
            <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
              {AVANTAGES.map((a, i) => (
                <div
                  key={a.titre}
                  className={`rounded-3xl p-7 ${i === 0 ? "bg-corail-pale" : "border border-black/5 bg-white"}`}
                >
                  <h3 className="font-titre text-xl font-bold">{a.titre}</h3>
                  <p className="mt-2 text-sm text-gray-700">{a.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tarif */}
        <section id="tarif" className="scroll-mt-20 px-4 pb-20 sm:px-6 sm:pb-24">
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-creme p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-corail">Rédactions</p>
              <p className="mt-4 font-titre text-5xl font-extrabold">
                49 €<span className="text-lg font-semibold text-gray-500"> / mois</span>
              </p>
              <p className="mt-3 text-sm text-gray-700">Sans engagement. Pitchs, annuaire, commandes et suivi des budgets inclus.</p>
              <Link
                href="/inscription?type=redaction"
                className="mt-6 inline-flex rounded-full bg-corail px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-corail-fonce"
              >
                Commencer
              </Link>
            </div>
            <div className="rounded-3xl border border-black/5 p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-corail">Pigistes</p>
              <p className="mt-4 font-titre text-5xl font-extrabold">Gratuit</p>
              <p className="mt-3 text-sm text-gray-700">Pour toujours. Proposez vos sujets, recevez des offres, rendez vos articles.</p>
              <Link
                href="/inscription?type=pigiste"
                className="mt-6 inline-flex rounded-full bg-encre px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-encre-clair"
              >
                Créer mon profil
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// Aperçus d'interface en HTML (pas d'images) pour illustrer chaque public.
function MockBonDeCommande() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-4 -rotate-2 rounded-[2rem] bg-rose/60" />
      <div className="relative rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="font-titre text-lg font-bold">Bon de commande</p>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Accepté</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">« Les nouvelles routes du vélo en ville »</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          {[
            ["Rémunération", "350 €"],
            ["Deadline", "15 novembre"],
            ["Format", "Reportage"],
            ["Longueur", "6 000 signes"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-creme p-3">
              <dt className="text-xs text-gray-500">{k}</dt>
              <dd className="mt-1 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-black/5 p-3 text-sm">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-corail text-xs font-bold text-white">
            CL
          </span>
          <div>
            <p className="font-medium">Camille L.</p>
            <p className="text-xs text-gray-500">Société · Environnement</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockPitch() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-4 rotate-2 rounded-[2rem] bg-corail-pale" />
      <div className="relative rounded-3xl bg-white p-6 shadow-xl">
        <p className="font-titre text-lg font-bold">Mon pitch</p>
        <p className="mt-1 text-sm text-gray-500">« Ces villages qui rachètent leur dernier café »</p>
        <ul className="mt-6 space-y-3 text-sm">
          {[
            ["Le Quotidien du Sud", "Offre reçue · 280 €", "bg-rose text-encre"],
            ["Hebdo Société", "Vu", "bg-gray-100 text-gray-600"],
            ["Revue Territoires", "Envoyé", "bg-gray-100 text-gray-600"],
          ].map(([media, statut, cls]) => (
            <li key={media} className="flex items-center justify-between rounded-2xl border border-black/5 p-3">
              <span className="font-medium">{media}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{statut}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-500">Chaque rédaction ne voit pas les autres destinataires.</p>
      </div>
    </div>
  );
}
