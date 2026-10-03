"use client";

import { useState } from "react";
import SubmitButton from "@/components/SubmitButton";

type Redaction = { id: string; nom_media: string; rubriques: string[] | null };

export default function NouveauPitchForm({
  redactions,
  action,
}: {
  redactions: Redaction[];
  action: (formData: FormData) => void;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  return (
    <form action={action} className="mt-6 max-w-2xl space-y-5">
      <div>
        <label className="label">Titre</label>
        <input name="titre" required className="input" />
      </div>
      <div>
        <label className="label">Présentation du sujet</label>
        <textarea
          name="resume"
          required
          rows={4}
          className="input"
          placeholder="De quoi s'agit-il ? Quelle est l'originalité de votre angle ?"
        />
      </div>

      <div>
        <label className="label">Sélectionner les rédactions destinataires</label>
        <p className="mb-3 text-xs text-gray-500">
          Chaque rédaction ne verra pas les autres destinataires de ce pitch.
        </p>
        <div className="space-y-3">
          {redactions.length === 0 && (
            <p className="text-sm text-gray-500">Aucune rédaction active pour le moment.</p>
          )}
          {redactions.map((r) => (
            <div key={r.id} className="card">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <input
                  type="checkbox"
                  name={`redaction_${r.id}`}
                  onChange={(e) =>
                    setSelected((s) => ({ ...s, [r.id]: e.target.checked }))
                  }
                />
                {r.nom_media}
              </label>
              {selected[r.id] && (
                <select name={`rubrique_${r.id}`} className="input mt-2" required>
                  <option value="">— Choisir une rubrique —</option>
                  {(r.rubriques || []).map((rub) => (
                    <option key={rub} value={rub}>
                      {rub}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      <SubmitButton className="btn-primary">
        Envoyer le pitch
      </SubmitButton>
    </form>
  );
}
