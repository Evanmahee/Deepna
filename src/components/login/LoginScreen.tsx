import { LoginCredentialsForm } from "@/components/login/LoginCredentialsForm";

export function LoginScreen() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Deepna
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Connexion ou inscription pour continuer.
        </p>
      </div>
      <LoginCredentialsForm />
    </div>
  );
}
