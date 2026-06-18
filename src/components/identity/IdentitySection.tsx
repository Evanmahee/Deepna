"use client";

import { CheckinButton } from "@/components/identity/CheckinButton";
import type { IdentityPeriod } from "@/types/identity";

type IdentitySectionProps = {
  period: IdentityPeriod;
  title: string;
  reps: number;
  mantra: string;
  isActive?: boolean;
  currentCount: number;
};

export function IdentitySection({
  period,
  title,
  reps,
  mantra,
  isActive = false,
  currentCount,
}: IdentitySectionProps) {
  const done = currentCount >= reps;

  return (
    <section
      className={[
        "glass rounded-xl p-4 shadow-sm transition-all",
        done ? "opacity-90" : "",
        isActive
          ? "ring-2 ring-indigo-400/80 bg-indigo-500/10"
          : "",
      ].join(" ")}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {isActive ? (
              <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-[10px] font-medium uppercase text-indigo-200">
                Maintenant
              </span>
            ) : null}
          </div>
          <p className="text-sm text-neutral-400">
            Progression :{" "}
            <span className="font-mono font-semibold text-white">
              {currentCount}/{reps}
            </span>
          </p>
        </div>
        {done ? (
          <span className="text-2xl text-emerald-400" aria-label="Terminé">
            ✓
          </span>
        ) : null}
      </div>
      <CheckinButton
        period={period}
        mantra={mantra}
        disabled={done}
        currentCount={currentCount}
        targetReps={reps}
      />
    </section>
  );
}
