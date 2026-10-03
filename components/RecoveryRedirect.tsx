"use client";

import { useEffect } from "react";

// Si Supabase renvoie le lien de réinitialisation vers une autre page que
// /reinitialiser-mot-de-passe (adresse non autorisée dans "Redirect URLs" →
// repli sur la Site URL), on y redirige en gardant les jetons du fragment.
export default function RecoveryRedirect() {
  useEffect(() => {
    const { hash, pathname } = window.location;
    if (hash.includes("type=recovery") && pathname !== "/reinitialiser-mot-de-passe") {
      window.location.replace(`/reinitialiser-mot-de-passe${hash}`);
    }
  }, []);
  return null;
}
