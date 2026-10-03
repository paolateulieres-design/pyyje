"use client";

import { useEffect, useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import { requestPasswordResetAction } from "./actions";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Retour de /auth/confirm avec un lien expiré ou déjà utilisé.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("lien") === "invalide") {
      setErrorMsg("Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.");
      setStatus("error");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await requestPasswordResetAction(email);
    if (error) {
      setErrorMsg(error);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
        <p className="mt-2 text-sm text-gray-500">
          Recevez un lien par email pour choisir un nouveau mot de passe.
        </p>

        {status === "sent" ? (
          <p className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être
            envoyé.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {status === "error" && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMsg}</p>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Envoyer le lien
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
