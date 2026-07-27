import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { activateAccountAction, refuseAccountAction } from "./actions";

export default async function AdminDashboard() {
  const { profile } = await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("profiles")
    .select("*")
    .eq("statut_compte", "en_attente")
    .order("created_at", { ascending: true });

  return (
    <AppShell profile={profile} navLinks={navLinksFor("admin")}>
      <h1 className="text-xl font-semibold text-gray-900">
        Comptes en attente de validation
      </h1>

      <div className="mt-6 space-y-3">
        {(pending || []).length === 0 && (
          <p className="text-sm text-gray-500">Aucun compte en attente.</p>
        )}
        {(pending || []).map((u) => (
          <div key={u.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {u.type_compte === "redaction"
                  ? u.nom_media
                  : `${u.prenom} ${u.nom}`}{" "}
                <span className="badge badge-gray ml-1">{u.type_compte}</span>
              </p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>
            <div className="flex gap-2">
              <form action={activateAccountAction.bind(null, u.id)}>
                <button className="btn-primary">Activer</button>
              </form>
              <form action={refuseAccountAction.bind(null, u.id)}>
                <button className="btn-danger">Refuser</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
