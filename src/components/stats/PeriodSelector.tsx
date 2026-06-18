"use client";

import type { StatsPeriod } from "@/lib/stats-period";
import { PERIOD_OPTIONS } from "@/lib/stats-period";

type PeriodSelectorProps = {
  value: StatsPeriod;
  onChange: (p: StatsPeriod) => void;
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={[
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === opt.id
              ? "bg-[#6366f1] text-white"
              : "bg-white/10 text-neutral-400 hover:text-white",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
