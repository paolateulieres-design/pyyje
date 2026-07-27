import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export default function MentionsLegalesPage() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 text-sm text-gray-700">
        <h1 className="text-2xl font-bold text-gray-900">Mentions légales</h1>

        <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
          Modèle à compléter avec les informations réelles de votre société avant mise en
          production commerciale.
        </p>

        <div className="mt-6 space-y-4">
          <p>
            <strong>Éditeur du site :</strong> [Nom de la société], [forme juridique], au capital
            de [montant] €, immatriculée au RCS de [ville] sous le numéro [SIRET], dont le siège
            social est situé [adresse].
          </p>
          <p>
            <strong>Directeur de la publication :</strong> [Nom du représentant légal]
          </p>
          <p>
            <strong>Hébergement :</strong> Netlify, Inc. — 44 Montgomery Street, Suite 300, San
            Francisco, CA 94104, États-Unis. Base de données hébergée par Supabase Inc.
          </p>
          <p>
            <strong>Contact :</strong>{" "}
            <a href="mailto:contact@pyyje.fr" className="text-brand-600 underline">
              contact@pyyje.fr
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
