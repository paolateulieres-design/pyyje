import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export default function CGUPage() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 text-sm text-gray-700">
        <h1 className="text-2xl font-bold text-gray-900">
          Conditions générales d&apos;utilisation
        </h1>

        <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
          Modèle à faire relire par un professionnel du droit avant mise en production
          commerciale.
        </p>

        <div className="mt-6 space-y-4">
          <p>
            <strong>1. Objet.</strong> PYYJE met en relation des journalistes pigistes
            (« Pigistes ») et des rédactions (« Rédactions ») autour d&apos;un workflow structuré
            : pitch, bon de commande, article, validation.
          </p>
          <p>
            <strong>2. Comptes.</strong> Chaque compte est soumis à validation par
            l&apos;administrateur de la plateforme avant activation.
          </p>
          <p>
            <strong>3. Tarification.</strong> L&apos;accès est gratuit pour les Pigistes.
            L&apos;abonnement Rédaction est de 49 € HT par mois, sans engagement.
          </p>
          <p>
            <strong>4. Paiement des piges.</strong> PYYJE ne traite aucun paiement entre Pigistes
            et Rédactions. Le règlement des piges s&apos;effectue hors plateforme, directement
            entre les parties.
          </p>
          <p>
            <strong>5. Confidentialité des pitchs.</strong> Une Rédaction destinataire d&apos;un
            pitch n&apos;a pas connaissance des autres Rédactions également sollicitées pour le
            même sujet.
          </p>
          <p>
            <strong>6. Données personnelles.</strong> Les documents transmis via la plateforme
            (fiche de renseignement notamment) contiennent des données personnelles et sont
            traités conformément au RGPD.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
