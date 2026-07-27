import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-brand-700">
          PYYJE
        </Link>
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
