import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import { signInAction } from "./actions";
import SubmitButton from "@/components/SubmitButton";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Se connecter</h1>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </p>
        )}

        <form action={signInAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next || ""} />
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" required className="input" />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" name="password" required className="input" />
          </div>
          <SubmitButton className="btn-primary w-full">
            Se connecter
          </SubmitButton>
        </form>

        <p className="mt-3 text-sm">
          <Link href="/mot-de-passe-oublie" className="text-brand-600">
            Mot de passe oublié ?
          </Link>
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-brand-600 font-medium">
            Inscrivez-vous
          </Link>
        </p>
      </main>
    </div>
  );
}
