import {
  dayCompletionRatio,
  type HabitLite,
} from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";

type MonthCalendarProps = {
  year: number;
  month: number;
  logs: HabitLogRow[];
  habits: HabitLite[];
};

function cellClass(ratio: number): string {
  if (ratio >= 1) {
    return "bg-emerald-800 text-white";
  }
  if (ratio >= 0.5) {
    return "bg-emerald-600/70 text-white";
  }
  if (ratio > 0) {
    return "bg-emerald-900/40 text-zinc-300";
  }
  return "bg-zinc-800 text-zinc-500";
}

export function MonthCalendar({
  year,
  month,
  logs,
  habits,
}: MonthCalendarProps) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const startPad = first.getUTCDay();
  const daysInMonth = last.getUTCDate();
  const cells: { day: number | null; ratio: number }[] = [];
  for (let i = 0; i < startPad; i++) {
    cells.push({ day: null, ratio: 0 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      day: d,
      ratio: dayCompletionRatio(logs, habits, iso),
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, ratio: 0 });
  }

  const wdays = ["D", "L", "M", "M", "J", "V", "S"];

  return (
    <div className="rounded-xl border border-[#333] bg-[#111] p-3">
      <p className="mb-2 text-sm font-medium text-zinc-300">
        Calendrier — {month}/{year}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-zinc-500">
        {wdays.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((c, i) =>
          c.day === null ? (
            <div key={`e-${i}`} className="aspect-square rounded" />
          ) : (
            <div
              key={c.day}
              title={`${Math.round(c.ratio * 100)}%`}
              className={`flex aspect-square items-center justify-center rounded text-xs font-medium ${cellClass(c.ratio)}`}
            >
              {c.day}
            </div>
          ),
        )}
      </div>
      <p className="mt-2 text-[10px] text-zinc-500">
        Vert foncé = 100%, vert = 50%+, gris = 0%
      </p>
    </div>
  );
}
