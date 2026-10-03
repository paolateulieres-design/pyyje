import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-encre py-12 text-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 text-sm sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="font-titre text-2xl font-extrabold text-white">pyyje</p>
          <p className="mt-2 max-w-xs">La plateforme de la pige, du pitch au paiement.</p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Link href="/inscription?type=redaction" className="hover:text-white">
            Pour les rédactions
          </Link>
          <Link href="/inscription?type=pigiste" className="hover:text-white">
            Pour les pigistes
          </Link>
          <Link href="/mentions-legales" className="hover:text-white">
            Mentions légales
          </Link>
          <Link href="/cgu" className="hover:text-white">
            CGU
          </Link>
          <a href="mailto:contact@pyyje.fr" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl px-4 text-xs text-white/40 sm:px-6">
        © {new Date().getFullYear()} PYYJE
      </p>
    </footer>
  );
}
