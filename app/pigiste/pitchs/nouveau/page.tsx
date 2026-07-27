import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { createPitchAction } from "../../actions";
import NouveauPitchForm from "./NouveauPitchForm";

export default async function NouveauPitchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await requireRole(["pigiste"]);
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: redactions } = await supabase
    .from("profiles")
    .select("id, nom_media, rubriques")
    .eq("type_compte", "redaction")
    .eq("statut_compte", "valide")
    .order("nom_media", { ascending: true });

  return (
    <AppShell profile={profile} navLinks={navLinksFor("pigiste")}>
      <h1 className="text-xl font-semibold text-gray-900">Nouveau pitch</h1>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Merci de remplir le titre et de sélectionner au moins une rédaction.
        </p>
      )}

      <NouveauPitchForm
        redactions={(redactions || []) as any}
        action={createPitchAction}
      />
    </AppShell>
  );
}
