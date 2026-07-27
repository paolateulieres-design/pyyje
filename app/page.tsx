import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function LandingPage() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Le pont entre pigistes et rédactions
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Proposez vos pitchs à plusieurs rédactions, recevez des offres,
          rédigez et faites valider vos articles — tout au même endroit.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/inscription" className="btn-primary px-6 py-3 text-base">
            S&apos;inscrire
          </Link>
          <Link href="/connexion" className="btn-secondary px-6 py-3 text-base">
            Se connecter
          </Link>
        </div>

        <div className="mt-20 grid gap-6 text-left sm:grid-cols-4">
          {[
            ["1. Pitch", "Le pigiste propose un sujet à plusieurs rédactions à la fois."],
            ["2. Bon de commande", "La rédaction fait une offre : prix, deadline, format."],
            ["3. Article", "Le pigiste rédige et soumet l'article."],
            ["4. Validation", "La rédaction relit, commente et valide."],
          ].map(([title, desc]) => (
            <div key={title} className="card">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
