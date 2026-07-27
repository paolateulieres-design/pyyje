import Link from "next/link";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div>
      <LandingHeader />
      <main>
        {/* Hero */}
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            La pige, de A à Z. Sans friction.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Les pigistes proposent leurs pitchs, les rédactions font leurs offres — pitch, bon
            de commande, article et validation, tout au même endroit.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/inscription" className="btn-primary px-6 py-3 text-base">
              S&apos;inscrire
            </Link>
            <a href="#pigistes" className="btn-secondary px-6 py-3 text-base">
              Voir la plateforme
            </a>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              ["49 €/mois", "par rédaction"],
              ["0 €", "pour les pigistes"],
              ["100%", "du cycle couvert"],
            ].map(([stat, label]) => (
              <div key={stat}>
                <p className="text-3xl font-bold text-brand-700">{stat}</p>
                <p className="mt-1 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Le problème */}
        <div id="probleme" className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-xl font-semibold text-gray-900">Le problème</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                [
                  "Pitchs perdus dans les boîtes mail",
                  "Un pitch envoyé par email se noie vite dans une boîte de réception — difficile de savoir qui a répondu, et à quel prix.",
                ],
                [
                  "Bons de commande informels",
                  "Prix, deadline, format... négociés au fil des échanges, sans document de référence commun entre pigiste et rédaction.",
                ],
                [
                  "Relecture sans outil dédié",
                  "Versions d'articles, commentaires et validations se dispersent entre emails et fichiers, sans historique clair.",
                ],
              ].map(([title, desc]) => (
                <div key={title} className="card">
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pour les pigistes */}
        <div id="pigistes" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-xl font-semibold text-gray-900">
              Pour les pigistes
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                ["Proposer un pitch", "Envoyez un même sujet à plusieurs rédactions à la fois, en toute confidentialité."],
                ["Recevoir des offres", "Comparez les propositions reçues et acceptez celle qui vous convient."],
                ["Soumettre un article", "Rédigez, soumettez, suivez les corrections demandées et retrouvez tout votre historique validé."],
              ].map(([title, desc]) => (
                <div key={title} className="card">
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pour les rédactions */}
        <div id="redactions" className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-xl font-semibold text-gray-900">
              Pour les rédactions
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                ["Recevoir des pitchs ciblés", "Des sujets triés par rubrique, sans jamais voir la liste des autres médias contactés par le même pigiste."],
                ["Commissionner directement", "Depuis l'annuaire des pigistes, sans attendre une proposition spontanée."],
                ["Valider les articles", "Gérez prix, deadline et format depuis un bon de commande unique, avec un historique de versions complet."],
              ].map(([title, desc]) => (
                <div key={title} className="card">
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tarif */}
        <div id="tarif" className="py-20 text-center">
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
