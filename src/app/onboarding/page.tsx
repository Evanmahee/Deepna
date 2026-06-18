"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ONBOARDING_GOALS,
  suggestionsForGoal,
  type OnboardingGoalId,
} from "@/lib/onboarding-suggestions";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [goal, setGoal] = useState<OnboardingGoalId | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(
    () => (goal ? suggestionsForGoal(goal) : []),
    [goal],
  );

  function toggleHabit(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function saveName() {
    const name = firstName.trim();
    if (!name) {
      setError("Indique ton prénom.");
      return false;
    }
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: name }),
      credentials: "same-origin",
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(j.error ?? "Erreur profil");
      return false;
    }
    return true;
  }

  async function handleNext() {
    setError(null);
    setLoading(true);
    try {
      if (step === 1) {
        if (await saveName()) setStep(2);
      } else if (step === 2) {
        if (!goal) {
          setError("Choisis un objectif principal.");
        } else {
          setSelected(new Set());
          setStep(3);
        }
      } else if (step === 3) {
        if (selected.size === 0) {
          setError("Sélectionne au moins une habitude.");
        } else {
          setStep(4);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    setError(null);
    setLoading(true);
    try {
      const picks = suggestions.filter((s) => selected.has(s.id));
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habits: picks.map((s) => ({ name: s.name, icon_emoji: s.emoji })),
          wakeTime,
          sleepTime,
        }),
        credentials: "same-origin",
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Finalisation impossible");
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = [
    "Comment tu t'appelles ?",
    "Quel est ton objectif principal ?",
    "Choisis tes premières habitudes",
    "Tes horaires",
  ];

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-4 py-8 pb-28">
      <header>
        <p className="text-xs font-medium text-neutral-500">
          Étape {step} / {TOTAL_STEPS}
        </p>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i + 1 <= step ? "bg-indigo-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <h1 className="mt-4 text-xl font-semibold text-white">
          {stepTitles[step - 1]}
        </h1>
      </header>

      {step === 1 ? (
        <label className="block space-y-2">
          <span className="text-sm text-neutral-400">Ton prénom</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            autoComplete="given-name"
            placeholder="Ex. Baptiste"
            autoFocus
          />
        </label>
      ) : null}

      {step === 2 ? (
        <div className="grid grid-cols-2 gap-3">
          {ONBOARDING_GOALS.map((g) => {
            const on = goal === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGoal(g.id)}
                className={`flex flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left transition ${
                  on
                    ? "border-indigo-400/60 bg-indigo-500/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {g.emoji}
                </span>
                <span className="text-sm font-medium text-white">{g.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {step === 3 ? (
        <>
          <p className="text-sm text-neutral-400">
            Suggestions pour «{" "}
            {ONBOARDING_GOALS.find((g) => g.id === goal)?.label} » — minimum 1
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s) => {
              const on = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleHabit(s.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                    on
                      ? "border-indigo-400/60 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                      on
                        ? "border-indigo-400 bg-indigo-500 text-white"
                        : "border-white/20"
                    }`}
                    aria-hidden
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span aria-hidden>{s.emoji}</span>
                  <span className="min-w-0 truncate">{s.name}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-neutral-400">
              À quelle heure tu te lèves ?
            </span>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-neutral-400">
              Tu te couches vers ?
            </span>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-white/30 focus:outline-none"
            />
          </label>
          <p className="text-xs text-neutral-500">
            On crée deux groupes <strong className="text-neutral-400">Matin</strong>{" "}
            et <strong className="text-neutral-400">Soir</strong>, et on place tes
            habitudes dans le bloc Matin.
          </p>
        </div>
      ) : null}

      <div className="flex gap-2">
        {step > 1 ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setError(null);
              setStep((s) => s - 1);
            }}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-neutral-300 hover:bg-white/5 disabled:opacity-50"
          >
            Retour
          </button>
        ) : null}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleNext()}
            className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? "…" : "Continuer"}
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleFinish()}
            className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? "…" : "Commencer"}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <footer className="mt-auto text-center text-xs text-neutral-500">
        <Link href="/legal/privacy" className="hover:text-neutral-300">
          Confidentialité
        </Link>
        <span className="mx-2">·</span>
        <Link href="/legal/terms" className="hover:text-neutral-300">
          CGU
        </Link>
      </footer>
    </div>
  );
}
