"use client";

import { useMemo, useState } from "react";
import {
  bestStreakAllTimeForHabit,
  completionRate30d,
  currentStreak,
  type HabitLite,
} from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";

type SortKey = "name" | "current" | "best" | "rate";
type SortDir = "asc" | "desc";

type HabitStatsTableProps = {
  habits: HabitLite[];
  logs: HabitLogRow[];
  allLogs: HabitLogRow[];
  fromDay: string;
  toDay: string;
};

export function HabitStatsTable({
  habits,
  logs,
  allLogs,
  fromDay,
  toDay,
}: HabitStatsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    return habits.map((h) => ({
      habit: h,
      current: currentStreak(allLogs, h.id, toDay),
      best: bestStreakAllTimeForHabit(allLogs, h.id),
      rate: completionRate30d(logs, h.id, fromDay, toDay),
    }));
  }, [habits, logs, allLogs, fromDay, toDay]);

  const sorted = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (sortKey) {
        case "current":
          return (a.current - b.current) * mul;
        case "best":
          return (a.best - b.best) * mul;
        case "rate":
          return (a.rate - b.rate) * mul;
        default:
          return a.habit.name.localeCompare(b.habit.name, "fr") * mul;
      }
    });
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function head(label: string, key: SortKey) {
    const active = sortKey === key;
    return (
      <th className="p-3">
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className={`text-xs uppercase ${active ? "text-indigo-300" : "text-neutral-500"}`}
        >
          {label}
          {active ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
        </button>
      </th>
    );
  }

  return (
    <div className="glass overflow-x-auto rounded-xl shadow-sm">
      <table className="w-full min-w-[360px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {head("Habitude", "name")}
            {head("Série actuelle", "current")}
            {head("Meilleure série", "best")}
            {head("Taux période", "rate")}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-sm text-neutral-500">
                Aucune habitude active.
              </td>
            </tr>
          ) : (
            sorted.map(({ habit, current, best, rate }) => (
              <tr key={habit.id} className="border-b border-white/10 last:border-0">
                <td className="p-3 font-medium text-white">
                  <span className="mr-1.5" aria-hidden>
                    {habit.icon_emoji || "•"}
                  </span>
                  {habit.name}
                </td>
                <td className="p-3 text-neutral-400">{current} j</td>
                <td className="p-3 text-neutral-400">{best} j</td>
                <td className="p-3 text-neutral-400">{rate}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
