import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { updateRedactionProfileAction } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export default async function RedactionProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ enregistre?: string }>;
}) {
  const { profile } = await requireRole(["redaction"]);
  const { enregistre } = await searchParams;

  return (
    <AppShell profile={profile} navLinks={navLinksFor("redaction")}>
      <h1 className="text-xl font-semibold text-gray-900">Profil média &amp; rubriques</h1>

      {enregistre && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          ✓ Profil enregistré.
        </p>
      )}

      <form action={updateRedactionProfileAction} className="card mt-6 max-w-xl space-y-4">
        <div>
          <label className="label">Nom du média</label>
          <input name="nom_media" defaultValue={profile.nom_media || ""} className="input" />
        </div>
        <div>
          <label className="label">Logo</label>
          {profile.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logo} alt="" className="mb-2 h-16 w-16 rounded object-contain" />
          )}
          <input type="file" name="logo_file" accept="image/*" className="input" />
        </div>
        <div>
          <label className="label">Site web</label>
          <input name="site_web" defaultValue={profile.site_web || ""} className="input" />
        </div>
        <div>
          <label className="label">Rubriques (séparées par des virgules)</label>
          <p className="mb-1 text-xs text-gray-500">
            Ces rubriques apparaissent aux pigistes quand ils vous envoient un pitch.
          </p>
          <input
            name="rubriques"
            defaultValue={(profile.rubriques || []).join(", ")}
            className="input"
            placeholder="Société, Culture, Politique, Économie"
          />
        </div>
        <SubmitButton className="btn-primary">
          Enregistrer
        </SubmitButton>
      </form>
    </AppShell>
  );
}
