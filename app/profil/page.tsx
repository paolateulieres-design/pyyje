import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { updateProfileAction, updatePasswordAction } from "./actions";
import { SPECIALITES } from "@/lib/specialites";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pwd_error?: string; pwd_ok?: string; enregistre?: string }>;
}) {
  const { profile } = await requireUser();
  const { error, pwd_error, pwd_ok, enregistre } = await searchParams;

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
      {enregistre && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          ✓ Profil enregistré.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Erreur : {decodeURIComponent(error)}
        </p>
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
              <label className="label">Photo</label>
              {profile.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photo} alt="" className="mb-2 h-16 w-16 rounded-full object-cover" />
              )}
              <input type="file" name="photo_file" accept="image/*" className="input" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea name="bio" defaultValue={profile.bio || ""} className="input" rows={4} />
            </div>
            <fieldset>
              <legend className="label">Spécialités</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {SPECIALITES.map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700"
                  >
                    <input
                      type="checkbox"
                      name="specialites"
                      value={s}
                      defaultChecked={(profile.specialites || []).includes(s)}
                      className="accent-brand-500"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
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
              <label className="label">Fiche de renseignement (PDF)</label>
              <p className="mb-1 text-xs text-gray-500">
                Coordonnées, sécurité sociale, carte de presse, RIB, CI... Document confidentiel,
                stocké de façon sécurisée et visible uniquement par vous et la rédaction avec
                laquelle vous travaillez.
              </p>
              {profile.fiche_renseignement && (
                <p className="mb-1 text-xs text-green-700">✓ Fiche déjà envoyée</p>
              )}
              <input type="file" name="fiche_file" accept="application/pdf" className="input" />
              <p className="mt-1 text-xs text-gray-500">
                Nécessaire pour être payé·e une fois une pige validée. Vous pouvez
                l&apos;ajouter plus tard : elle ne bloque ni les pitchs ni l&apos;envoi
                d&apos;articles.
              </p>
            </div>
          </>
        )}

        {profile.type_compte === "redaction" && (
          <p className="text-sm text-gray-500">
            Le nom du média, le logo, le site web et les rubriques se gèrent depuis{" "}
            <Link href="/redaction/profil" className="font-medium text-brand-600 underline">
              Profil média &amp; rubriques
            </Link>
            .
          </p>
        )}

        <SubmitButton className="btn-primary">
          Enregistrer
        </SubmitButton>
      </form>

      <div className="card mt-6 max-w-xl">
        <h2 className="font-semibold text-gray-900">Changer de mot de passe</h2>

        {pwd_ok && (
          <p className="mt-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Mot de passe mis à jour.
          </p>
        )}
        {pwd_error && (
          <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {pwd_error === "trop_court"
              ? "Le mot de passe doit faire au moins 6 caractères."
              : pwd_error === "mismatch"
              ? "Les deux mots de passe ne correspondent pas."
              : decodeURIComponent(pwd_error)}
          </p>
        )}

        <form action={updatePasswordAction} className="mt-4 space-y-3">
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input type="password" name="password" required minLength={6} className="input" />
          </div>
          <div>
            <label className="label">Confirmer le mot de passe</label>
            <input type="password" name="password_confirm" required minLength={6} className="input" />
          </div>
          <SubmitButton className="btn-secondary">
            Mettre à jour le mot de passe
          </SubmitButton>
        </form>
      </div>
    </AppShell>
  );
}
