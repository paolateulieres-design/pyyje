import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div>
      <PublicHeader />
      <main>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Le pont entre pigistes et rédactions
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Les pigistes proposent leurs pitchs, les rédactions font leurs offres — pitch, bon
            de commande, article et validation, tout au même endroit.
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
        </div>

        <div className="bg-gray-50 py-20">
          <div className="mx-auto grid max-w-5xl gap-10 px-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pour les rédactions</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>Recevez des pitchs ciblés, triés par rubrique, sans jamais voir la liste des autres médias contactés par le même pigiste.</li>
                <li>Commissionnez directement un pigiste depuis l&apos;annuaire, sans attendre une proposition.</li>
                <li>Gérez prix, deadline et format depuis un bon de commande unique, et validez les articles avec un historique de versions complet.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pour les pigistes</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>Proposez un même sujet à plusieurs rédactions en toute confidentialité.</li>
                <li>Recevez les offres, comparez-les, et acceptez celle qui vous convient.</li>
                <li>Soumettez vos articles, suivez les corrections demandées et retrouvez tout votre historique validé.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="py-20 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Tarif</h2>
          <p className="mx-auto mt-4 max-w-md text-gray-600">
            <span className="text-3xl font-bold text-brand-700">49 €</span> / mois par rédaction,
            sans engagement. <br />
            Gratuit pour tous les pigistes.
          </p>
          <Link href="/inscription" className="btn-primary mt-8 inline-flex px-6 py-3 text-base">
            Commencer
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
