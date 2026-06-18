"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoginTabSwitcher } from "@/components/login/LoginTabSwitcher";
import { LoginGoogleButton } from "@/components/login/LoginGoogleButton";

type Mode = "signin" | "signup";

const inputClass =
  "w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export function LoginCredentialsForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (!err) {
      return;
    }
    setMessage(decodeURIComponent(err));
    window.history.replaceState({}, "", "/login");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Vérifie ta boîte mail pour confirmer le compte si requis.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setMessage(error.message);
        } else {
          window.location.href = "/";
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <LoginTabSwitcher mode={mode} onModeChange={setMode} />

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-zinc-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="toi@exemple.com"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-zinc-300"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        {message ? (
          <p className="text-sm text-zinc-400" role="status">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Chargement…"
            : mode === "signup"
              ? "Créer un compte"
              : "Se connecter"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#333]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0a0a0f] px-2 text-zinc-500">ou</span>
        </div>
      </div>

      <LoginGoogleButton disabled={loading} />
    </div>
  );
}
