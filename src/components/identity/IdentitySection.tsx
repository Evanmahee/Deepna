"use client";

import { CheckinButton } from "@/components/identity/CheckinButton";
import { parseRepCount } from "@/lib/identity-reps";
import type { IdentityCheckinRow, IdentityPeriod } from "@/types/identity";

type IdentitySectionProps = {
  period: IdentityPeriod;
  title: string;
  reps: number;
  checkin: IdentityCheckinRow | undefined;
  mantra: string;
};

export function IdentitySection({
  period,
  title,
  reps,
  checkin,
  mantra,
}: IdentitySectionProps) {
  const currentCount = parseRepCount(checkin?.reflection);
  const done = currentCount >= reps;

  return (
    <section
      className={`glass rounded-xl p-4 shadow-sm ${
        done ? "glass-subtle opacity-90" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-neutral-400">
            Progression :{" "}
            <span className="font-mono font-semibold text-white">
              {currentCount}/{reps}
            </span>
          </p>
        </div>
        {done ? (
          <span className="text-2xl text-white" aria-label="Terminé">
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
