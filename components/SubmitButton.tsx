"use client";

import { useFormStatus } from "react-dom";

// Bouton de formulaire avec retour visuel : désactivé et animé pendant
// l'envoi, pour qu'on sache que le clic a bien été pris en compte (et éviter
// les doubles envois).
export default function SubmitButton({
  className = "btn-primary",
  children,
  disabled,
}: {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`${className} gap-2`}
      disabled={disabled || pending}
      aria-busy={pending}
    >
      {pending && (
        <span
          aria-hidden
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
