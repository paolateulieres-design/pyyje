import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/auth-helpers";
import { navLinksFor } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";
import { suspendAccountAction, reactivateAccountAction } from "../actions";
import SubmitButton from "@/components/SubmitButton";

export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { profile } = await requireRole(["admin"]);
  const { type } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("profiles").select("*").neq("statut_compte", "en_attente");
  if (type && ["pigiste", "redaction", "admin"].includes(type)) {
    query = query.eq("type_compte", type);
  }
  const { data: users } = await query.order("created_at", { ascending: false });

  return (
    <AppShell profile={profile} navLinks={navLinksFor("admin")}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Utilisateurs</h1>
        <div className="flex gap-2 text-sm">
          {["all", "pigiste", "redaction", "admin"].map((t) => (
            <a
              key={t}
              href={t === "all" ? "/admin/utilisateurs" : `/admin/utilisateurs?type=${t}`}
              className={`btn-secondary ${type === t || (!type && t === "all") ? "ring-2 ring-brand-500" : ""}`}
            >
              {t === "all" ? "Tous" : t}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-2">
                  {u.type_compte === "redaction" ? u.nom_media : `${u.prenom} ${u.nom}`}
                </td>
                <td className="px-4 py-2 text-gray-500">{u.email}</td>
                <td className="px-4 py-2">
                  <span className="badge badge-gray">{u.type_compte}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`badge ${u.statut_compte === "valide" ? "badge-green" : "badge-red"}`}>
                    {u.statut_compte}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {u.statut_compte === "valide" ? (
                    <form action={suspendAccountAction.bind(null, u.id)}>
                      <SubmitButton className="btn-danger text-xs">Suspendre</SubmitButton>
                    </form>
                  ) : (
                    <form action={reactivateAccountAction.bind(null, u.id)}>
                      <SubmitButton className="btn-secondary text-xs">Réactiver</SubmitButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
