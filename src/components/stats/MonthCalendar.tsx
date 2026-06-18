"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysUtc, todayUtcString } from "@/lib/dates";
import {
  dayCompletionRatio,
  type HabitLite,
} from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";

type MonthCalendarProps = {
  logs: HabitLogRow[];
  habits: HabitLite[];
  initialYear: number;
  initialMonth: number;
};

function cellClass(ratio: number, hasHabits: boolean, isFuture: boolean): string {
  if (isFuture) return "bg-transparent text-neutral-600";
  if (!hasHabits) return "bg-white/10 text-neutral-500";
  if (ratio >= 1) return "bg-emerald-700 text-white";
  if (ratio > 0.5) return "bg-emerald-500/80 text-white";
  if (ratio > 0) return "bg-orange-500 text-white";
  return "bg-neutral-700 text-neutral-400";
}

function monthBounds(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(year, month, 0));
  const end = last.toISOString().slice(0, 10);
  return { start, end };
}

export function MonthCalendar({
  logs,
  habits,
  initialYear,
  initialMonth,
}: MonthCalendarProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const today = todayUtcString();

  const monthLogs = useMemo(() => {
    const { start, end } = monthBounds(year, month);
    return logs.filter((l) => l.logged_on >= start && l.logged_on <= end);
  }, [logs, year, month]);

  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const startPad = first.getUTCDay();
  const daysInMonth = last.getUTCDate();
  const cells: { day: number | null; iso: string | null; ratio: number }[] = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ day: null, iso: null, ratio: 0 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      day: d,
      iso,
      ratio: dayCompletionRatio(monthLogs, habits, iso),
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, iso: null, ratio: 0 });
  }

  const wdays = ["D", "L", "M", "M", "J", "V", "S"];
  const hasHabits = habits.length > 0;
  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
    "fr-FR",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  return (
    <div className="glass rounded-xl p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium capitalize text-white">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
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
              key={c.iso}
              title={`${Math.round(c.ratio * 100)}%`}
              className={`flex aspect-square items-center justify-center rounded text-xs font-medium ${cellClass(
                c.ratio,
                hasHabits,
                Boolean(c.iso && c.iso > today),
              )}`}
            >
              {c.day}
            </div>
          ),
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-700" />
          100 %
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
          &gt;50 %
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500" />
          &lt;50 %
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-neutral-700" />
          0 %
        </span>
      </div>
    </div>
  );
}
