"use client";

type TodayDayProgressProps = {
  completed: number;
  total: number;
  label: string;
  pct: number;
};

export function TodayDayProgress({
  completed,
  total,
  label,
  pct,
}: TodayDayProgressProps) {
  if (total === 0) return null;

  return (
    <div className="px-3 pb-2">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
          <span>{label}</span>
          <span className="font-mono text-neutral-300">{pct}%</span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${completed} sur ${total} habitudes complétées`}
        >
          <div
            className="h-full rounded-full bg-indigo-500 transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
