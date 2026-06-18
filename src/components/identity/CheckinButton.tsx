"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IdentityPeriod } from "@/types/identity";

type CheckinButtonProps = {
  period: IdentityPeriod;
  mantra: string;
  disabled: boolean;
};

export function CheckinButton({ period, mantra, disabled }: CheckinButtonProps) {
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

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void submit()}
        className="rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {loading ? "…" : "Valider"}
      </button>
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
