import Link from "next/link";

// Header spécifique à la landing page : sticky, avec des ancres vers les
// sections. Distinct de PublicHeader (utilisé sur connexion/inscription/CGU)
// qui n'a pas besoin de nav interne.
export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-titre text-2xl font-extrabold tracking-tight text-corail">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-lg bg-corail text-sm text-white">
            P
          </span>
          pyyje
        </Link>
        <nav className="hidden gap-7 text-sm font-medium text-encre lg:flex">
          <a href="#redactions" className="hover:text-corail">
            Rédactions
          </a>
          <a href="#pigistes" className="hover:text-corail">
            Pigistes
          </a>
          <a href="#fonctionnement" className="hover:text-corail">
            Comment ça marche
          </a>
          <a href="#tarif" className="hover:text-corail">
            Tarif
          </a>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/inscription"
            className="whitespace-nowrap rounded-full bg-corail px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-corail-fonce sm:px-5 sm:py-2.5"
          >
            <span className="sm:hidden">S&apos;inscrire</span>
            <span className="hidden sm:inline">Créer mon compte</span>
          </Link>
          <Link
            href="/connexion"
            className="whitespace-nowrap border-b-2 border-encre pb-0.5 text-sm font-semibold text-encre hover:text-corail"
          >
            Me connecter
          </Link>
        </div>
      </div>
    </header>
  );
}
