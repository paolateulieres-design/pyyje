"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import { signUpAction } from "./actions";
import SubmitButton from "@/components/SubmitButton";

export default function InscriptionPage() {
  return (
    <Suspense fallback={null}>
      <InscriptionForm />
    </Suspense>
  );
}

function InscriptionForm() {
  const params = useSearchParams();
  const inviteToken = params.get("invite") || "";
  const preset = params.get("type") === "redaction" ? "redaction" : "pigiste";
  const [type_compte, setType] = useState<"pigiste" | "redaction">(preset);
  const error = params.get("error");

  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>

        {inviteToken && (
          <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
            Vous avez reçu une proposition de pige. Créez votre compte pour la consulter.
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Une erreur est survenue : {decodeURIComponent(error)}
          </p>
        )}

        <div className="mt-6 flex rounded-lg bg-gray-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => setType("pigiste")}
            className={`flex-1 rounded-md py-2 ${type_compte === "pigiste" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            Je suis pigiste
          </button>
          <button
            type="button"
            onClick={() => setType("redaction")}
            className={`flex-1 rounded-md py-2 ${type_compte === "redaction" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            Je suis une rédaction
          </button>
        </div>

        <form action={signUpAction} className="mt-6 space-y-4">
          <input type="hidden" name="type_compte" value={type_compte} />
          <input type="hidden" name="invite_token" value={inviteToken} />

          {type_compte === "pigiste" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input name="prenom" required className="input" />
              </div>
              <div>
                <label className="label">Nom</label>
                <input name="nom" required className="input" />
              </div>
            </div>
          ) : (
            <div>
              <label className="label">Nom du média</label>
              <input name="nom_media" required className="input" />
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <input type="email" name="email" required className="input" />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" name="password" required minLength={6} className="input" />
          </div>

          <SubmitButton className="btn-primary w-full">
            Créer mon compte
          </SubmitButton>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          Votre compte sera activé après validation par un administrateur.
        </p>
      </main>
    </div>
  );
}
