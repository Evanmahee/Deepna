"use client";

import { CheckinButton } from "@/components/identity/CheckinButton";
import type { IdentityPeriod } from "@/types/identity";

type IdentitySectionProps = {
  period: IdentityPeriod;
  title: string;
  reps: number;
  done: boolean;
  mantra: string;
};

export function IdentitySection({
  period,
  title,
  reps,
  done,
  mantra,
}: IdentitySectionProps) {
  return (
    <section
      className={`rounded-xl border p-4 ${
        done
          ? "border-zinc-700 bg-zinc-900/40 opacity-70"
          : "border-[#333] bg-[#111]"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-zinc-400">
            Répétitions à faire : <span className="font-mono text-white">×{reps}</span>
          </p>
        </div>
        {done ? (
          <span className="text-2xl text-emerald-400" aria-label="Validé">
            ✓
          </span>
        ) : null}
      </div>
      <CheckinButton period={period} mantra={mantra} disabled={done} />
    </section>
  );
}
