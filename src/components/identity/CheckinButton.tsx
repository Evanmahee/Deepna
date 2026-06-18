"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IdentityPeriod } from "@/types/identity";

type CheckinButtonProps = {
  period: IdentityPeriod;
  mantra: string;
  disabled: boolean;
  currentCount: number;
  targetReps: number;
};

export function CheckinButton({
  period,
  mantra,
  disabled,
  currentCount,
  targetReps,
}: CheckinButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/identity/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          text_snapshot: mantra.trim() || null,
        }),
        credentials: "same-origin",
      });
      const j = (await res.json()) as {
        error?: string;
        details?: string;
        code?: string;
        supabase?: Record<string, unknown>;
        count?: number;
      };
      if (!res.ok) {
        const parts: string[] = [];
        if (j.error) {
          parts.push(j.error);
        }
        if (j.details) {
          parts.push(j.details);
        }
        if (j.supabase) {
          parts.push(JSON.stringify(j.supabase));
        }
        const msg = parts.length > 0 ? parts.join(" — ") : "Erreur";
        setError(msg);
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Réseau ou serveur injoignable");
    } finally {
      setLoading(false);
    }
  }

  const remaining = Math.max(0, targetReps - currentCount);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void submit()}
        className="rounded-xl bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-500"
      >
        {loading ? "…" : disabled ? "Terminé" : "J'ai lu et intériorisé"}
      </button>
      {!disabled && remaining > 0 ? (
        <p className="text-xs text-neutral-500">
          Encore {remaining} lecture{remaining > 1 ? "s" : ""} pour cette
          période.
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
