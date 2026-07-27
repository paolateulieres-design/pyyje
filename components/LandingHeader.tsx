import Link from "next/link";

// Header spécifique à la landing page : sticky, avec des ancres vers les
// sections. Distinct de PublicHeader (utilisé sur connexion/inscription/CGU)
// qui n'a pas besoin de nav interne.
export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-brand-700">
          PYYJE
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-gray-600 sm:flex">
          <a href="#probleme" className="hover:text-brand-700">
            Le problème
          </a>
          <a href="#pigistes" className="hover:text-brand-700">
            Pigistes
          </a>
          <a href="#redactions" className="hover:text-brand-700">
            Rédactions
          </a>
          <a href="#tarif" className="hover:text-brand-700">
            Tarif
          </a>
        </nav>
        <div className="flex gap-3">
          <Link href="/connexion" className="btn-secondary">
            Se connecter
          </Link>
          <Link href="/inscription" className="btn-primary">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
