import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-gray-500 sm:flex-row">
        <span>© {new Date().getFullYear()} PYYJE</span>
        <div className="flex gap-6">
          <Link href="/mentions-legales" className="hover:text-gray-700">
            Mentions légales
          </Link>
          <Link href="/cgu" className="hover:text-gray-700">
            CGU
          </Link>
          <a href="mailto:contact@pyyje.fr" className="hover:text-gray-700">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
