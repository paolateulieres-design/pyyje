"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import { createClient } from "@/lib/supabase/client";

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();
    // Le lien de réinitialisation Supabase établit automatiquement une
    // session "recovery" une fois la page chargée côté client.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit faire au moins 6 caractères.");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      setStatus("error");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }
    setStatus("ok");
    setTimeout(() => router.push("/connexion"), 1500);
  }

  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Choisir un nouveau mot de passe</h1>

        {!ready && (
          <p className="mt-4 text-sm text-gray-500">
            Ouvrez cette page depuis le lien reçu par email.
          </p>
        )}

        {status === "ok" ? (
          <p className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Mot de passe mis à jour, redirection...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {status === "error" && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMsg}</p>
            )}
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={!ready}>
              Mettre à jour le mot de passe
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
