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

function cellClass(ratio: number, hasHabits: boolean): string {
  if (!hasHabits) {
    return "bg-white/10 text-neutral-500";
  }
  if (ratio >= 1) {
    return "bg-emerald-500 text-white";
  }
  if (ratio > 0) {
    return "bg-amber-500 text-white";
  }
  return "bg-white/15 text-neutral-500";
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
  const hasHabits = habits.length > 0;

  return (
    <div className="glass rounded-xl p-3 shadow-sm">
      <p className="mb-2 text-sm font-medium text-white">
        Calendrier — {month}/{year}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-500">
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
              className={`flex aspect-square items-center justify-center rounded text-xs font-medium ${cellClass(c.ratio, hasHabits)}`}
            >
              {c.day}
            </div>
          ),
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Tout fait
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />
          Partiel
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-white/15" />
          Rien
        </span>
      </div>
    </div>
  );
}
