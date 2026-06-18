"use client";

type TodayDayProgressProps = {
  pct: number;
};

export function TodayDayProgress({ pct }: TodayDayProgressProps) {
  return (
    <div className="px-3 pb-2">
      <div
        className="mx-auto h-1 max-w-md overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression du jour : ${pct}%`}
      >
        <div
          className="h-full rounded-full bg-[#6366f1] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
