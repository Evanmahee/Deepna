"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { glassInputClass } from "@/lib/glass";

const SUGGESTIONS = [
  { id: "sport", name: "Sport", emoji: "🏋️" },
  { id: "meditation", name: "Méditation", emoji: "🧘" },
  { id: "lecture", name: "Lecture", emoji: "📚" },
  { id: "eau", name: "Eau", emoji: "💧" },
  { id: "sommeil", name: "Sommeil", emoji: "😴" },
  { id: "gratitude", name: "Gratitude", emoji: "🙏" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [statement, setStatement] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSuggestion(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function saveProfile(): Promise<boolean> {
    const name = firstName.trim();
    if (!name) {
      setError("Indique ton prénom.");
      return false;
    }
    const r1 = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: name }),
      credentials: "same-origin",
    });
    const j1 = (await r1.json()) as { error?: string; supabase?: unknown };
    if (!r1.ok) {
      setError(
        j1.error ??
          (j1.supabase ? JSON.stringify(j1.supabase) : "Erreur profil"),
      );
      return false;
    }

    const r2 = await fetch("/api/identity/statement", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity_statement: statement.trim() || null,
      }),
      credentials: "same-origin",
    });
    const j2 = (await r2.json()) as { error?: string };
    if (!r2.ok) {
      setError(j2.error ?? "Erreur identité");
      return false;
    }
    return true;
  }

  async function createHabits() {
    const picks = SUGGESTIONS.filter((s) => selected.has(s.id));
    for (const s of picks) {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name,
          icon_emoji: s.emoji,
          habit_type: "good",
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? `Impossible de créer ${s.name}`);
      }
    }
  }

  async function goToStep2() {
    setError(null);
    setLoading(true);
    try {
      const ok = await saveProfile();
      if (ok) {
        setStep(2);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Réseau");
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    setError(null);
    setLoading(true);
    try {
      await createHabits();
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-4 py-8 pb-28">
      <header className="glass-bar -mx-4 px-4 pb-4 pt-2">
        <p className="text-xs font-medium text-neutral-900">Étape {step} / 2</p>
        <h1 className="text-xl font-semibold text-slate-900">
          {step === 1 ? "Bienvenue" : "Crée tes premières habitudes"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {step === 1
            ? "Quelques infos pour personnaliser Deepna."
            : "Sélectionne celles qui te parlent — tu pourras en ajouter d'autres plus tard."}
        </p>
      </header>

      {step === 1 ? (
        <>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Ton prénom</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`${glassInputClass} py-2.5 outline-none`}
              autoComplete="given-name"
              placeholder="Ex. Baptiste"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Qui veux-tu devenir ?
            </span>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={5}
              className={`${glassInputClass} resize-y py-2.5 outline-none`}
              placeholder="Une phrase ou un paragraphe…"
            />
          </label>

          <button
            type="button"
            disabled={loading}
            onClick={() => void goToStep2()}
            className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "…" : "Continuer"}
          </button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => {
              const on = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSuggestion(s.id)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    on
                      ? "glass-subtle border-neutral-900/40 text-neutral-900"
                      : "glass text-slate-700"
                  }`}
                >
                  <span className="mr-1.5" aria-hidden>
                    {s.emoji}
                  </span>
                  {s.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void handleFinish()}
            className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "…" : "Commencer"}
          </button>
        </>
      )}

      {error ? (
        <p className="text-sm text-neutral-700" role="alert">
          {error}
        </p>
      ) : null}

      <footer className="glass-bar mt-auto -mx-4 px-4 pt-4 text-center text-xs text-slate-500">
        <Link href="/legal/privacy" className="hover:text-slate-800">
          Confidentialité
        </Link>
        <span className="mx-2">·</span>
        <Link href="/legal/terms" className="hover:text-slate-800">
          CGU
        </Link>
      </footer>
    </div>
  );
}
