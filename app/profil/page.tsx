import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { updateProfileAction } from "./actions";

export default async function ProfilPage() {
  const { profile } = await requireUser();

  return (
    <AppShell profile={profile} navLinks={navLinksFor(profile.type_compte)}>
      <h1 className="text-xl font-semibold text-gray-900">Mon profil</h1>

      {profile.statut_compte === "en_attente" && (
        <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          Votre compte est en attente de validation par un administrateur.
          Vous pourrez accéder au reste de la plateforme une fois validé.
        </div>
      )}
      {profile.statut_compte === "refuse" && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          Votre compte n&apos;est pas (ou plus) validé. Contactez l&apos;administrateur.
        </div>
      )}

      <form action={updateProfileAction} className="card mt-6 max-w-xl space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input bg-gray-50" value={profile.email} disabled />
        </div>

        {profile.type_compte === "pigiste" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input name="prenom" defaultValue={profile.prenom || ""} className="input" />
              </div>
              <div>
                <label className="label">Nom</label>
                <input name="nom" defaultValue={profile.nom || ""} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Photo (URL)</label>
              <input name="photo" defaultValue={profile.photo || ""} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea name="bio" defaultValue={profile.bio || ""} className="input" rows={4} />
            </div>
            <div>
              <label className="label">Spécialités (séparées par des virgules)</label>
              <input
                name="specialites"
                defaultValue={(profile.specialites || []).join(", ")}
                className="input"
                placeholder="politique, culture, sport"
              />
            </div>
            <div>
              <label className="label">Portfolio (lien principal)</label>
              <input name="portfolio_url" defaultValue={profile.portfolio_url || ""} className="input" />
            </div>
            <div>
              <label className="label">Autres liens d&apos;articles (un par ligne)</label>
              <textarea
                name="portfolio_liens"
                defaultValue={(profile.portfolio_liens || []).join("\n")}
                className="input"
                rows={3}
                placeholder={"https://...\nhttps://..."}
              />
            </div>
            <div>
              <label className="label">Numéro de carte de presse</label>
              <input name="num_carte_presse" defaultValue={profile.num_carte_presse || ""} className="input" />
            </div>
            <div>
              <label className="label">
                Fiche de renseignement (lien vers le PDF — coordonnées, sécu, carte de
                presse, RIB, CI…)
              </label>
              <input
                name="fiche_renseignement"
                defaultValue={profile.fiche_renseignement || ""}
                className="input"
                placeholder="https://..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Obligatoire avant de pouvoir soumettre un article. Pas de pitch bloqué sans elle.
              </p>
            </div>
          </>
        )}

        {profile.type_compte === "redaction" && (
          <>
            <div>
              <label className="label">Nom du média</label>
              <input name="nom_media" defaultValue={profile.nom_media || ""} className="input" />
            </div>
            <div>
              <label className="label">Logo (URL)</label>
              <input name="logo" defaultValue={profile.logo || ""} className="input" />
            </div>
            <div>
              <label className="label">Site web</label>
              <input name="site_web" defaultValue={profile.site_web || ""} className="input" />
            </div>
            <p className="text-xs text-gray-500">
              La liste des rubriques se gère depuis « Profil média &amp; rubriques ».
            </p>
          </>
        )}

        <button type="submit" className="btn-primary">
          Enregistrer
        </button>
      </form>
    </AppShell>
  );
}
