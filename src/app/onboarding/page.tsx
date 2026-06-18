"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ONBOARDING_GOALS,
  suggestionsForGoal,
  type OnboardingGoalId,
} from "@/lib/onboarding-suggestions";
import { glassInputClass, glassSectionClass } from "@/lib/glass";

const TOTAL_STEPS = 4;
const inputClass = glassInputClass;

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
    const text = await res.text();
    let j: { error?: string } = {};
    try {
      j = text ? (JSON.parse(text) as { error?: string }) : {};
    } catch {
      setError(
        res.ok
          ? "Réponse serveur invalide"
          : `Erreur serveur (${res.status})`,
      );
      return false;
    }
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

  const stepHints = [
    "On personnalise Deepna pour toi.",
    "On adaptera les suggestions à ta priorité.",
    "Tu pourras en ajouter d'autres plus tard.",
    "Pour organiser tes habitudes matin & soir.",
  ];

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 py-8 pb-10">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Bienvenue
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Quelques étapes pour démarrer.
        </p>
      </header>

      <section className={`${glassSectionClass} flex flex-1 flex-col gap-5`}>
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-neutral-500">
              Étape {step} / {TOTAL_STEPS}
            </p>
            <p className="text-xs text-neutral-600">
              {Math.round((step / TOTAL_STEPS) * 100)} %
            </p>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i + 1 <= step ? "bg-white" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <h2 className="mt-5 text-lg font-semibold text-white">
            {stepTitles[step - 1]}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">{stepHints[step - 1]}</p>
        </div>

        {step === 1 ? (
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Ton prénom
            </span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
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
                  className={[
                    "flex flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.98]",
                    on
                      ? "border-white/30 bg-white/15 text-white ring-1 ring-white/20"
                      : "glass-dark-subtle border-white/10 text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="text-2xl" aria-hidden>
                    {g.emoji}
                  </span>
                  <span className="text-sm font-medium">{g.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <p className="text-sm text-neutral-400">
              Pour « {ONBOARDING_GOALS.find((g) => g.id === goal)?.label} » —
              minimum 1
            </p>
            <div className="grid max-h-[min(42vh,320px)] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {suggestions.map((s) => {
                const on = selected.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleHabit(s.id)}
                    className={[
                      "flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition-all active:scale-[0.99]",
                      on
                        ? "border-white/25 bg-white/10 text-white"
                        : "glass-dark-subtle border-white/10 text-neutral-300 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs",
                        on
                          ? "border-white/40 bg-white text-black"
                          : "border-white/20",
                      ].join(" ")}
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
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Réveil
              </span>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Coucher
              </span>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className={inputClass}
              />
            </label>
            <p className="rounded-xl bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-neutral-500">
              On crée les groupes{" "}
              <strong className="font-medium text-neutral-300">Matin</strong> et{" "}
              <strong className="font-medium text-neutral-300">Soir</strong>, et
              on place tes habitudes dans le bloc Matin.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-auto flex gap-2 pt-2">
          {step > 1 ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setError(null);
                setStep((s) => s - 1);
              }}
              className="glass-pill flex-1 py-3 text-sm font-medium text-neutral-300 disabled:opacity-50"
            >
              Retour
            </button>
          ) : null}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleNext()}
              className="flex-1 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading ? "…" : "Continuer"}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => void handleFinish()}
              className="flex-1 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              {loading ? "…" : "Commencer"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
