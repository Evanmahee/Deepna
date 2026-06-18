"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LoginGoogleButtonProps = {
  disabled?: boolean;
};

export function LoginGoogleButton({ disabled }: LoginGoogleButtonProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleGoogle() {
    setLocalError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
        window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${appUrl}/auth/callback`,
        },
      });

      if (error) {
        setLocalError(error.message);
        setBusy(false);
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      setLocalError(
        "Aucune URL Google reçue. Vérifie dans Supabase : Authentication → URL configuration (redirects autorisés) et que le fournisseur Google est activé.",
      );
      setBusy(false);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Erreur inconnue");
      setBusy(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={() => void handleGoogle()}
        disabled={disabled || busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-indigo-500 hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span aria-hidden>Google</span>
        <span>{busy ? "Redirection…" : "Continuer avec Google"}</span>
      </button>
      {localError ? (
        <p className="text-center text-xs text-red-400" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
