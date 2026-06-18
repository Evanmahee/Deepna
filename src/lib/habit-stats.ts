import type { HabitLogRow } from "@/types/today";

export type HabitLite = { id: string; name: string; missed_days_count: number };

/** Jours consécutifs avec completed=true en remontant depuis `endDay` (YYYY-MM-DD). */
export function currentStreak(
  logs: HabitLogRow[],
  habitId: string,
  endDay: string,
): number {
  const byDay = new Map<string, boolean>();
  for (const l of logs) {
    if (l.habit_id === habitId) {
      byDay.set(l.logged_on, l.completed);
    }
  }
  let d = new Date(`${endDay}T12:00:00Z`);
  let n = 0;
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (!byDay.get(key)) {
      break;
    }
    n += 1;
    d = new Date(d.getTime() - 86400000);
  }
  return n;
}

export function completionRate30d(
  logs: HabitLogRow[],
  habitId: string,
  fromDay: string,
  toDay: string,
): number {
  const days: string[] = [];
  let t = Date.parse(`${fromDay}T12:00:00Z`);
  const end = Date.parse(`${toDay}T12:00:00Z`);
  while (t <= end) {
    days.push(new Date(t).toISOString().slice(0, 10));
    t += 86400000;
  }
  if (days.length === 0) {
    return 0;
  }
  let ok = 0;
  for (const day of days) {
    const row = logs.find((l) => l.habit_id === habitId && l.logged_on === day);
    if (row?.completed) {
      ok += 1;
    }
  }
  return Math.round((ok / days.length) * 100);
}

export function dayCompletionRatio(
  logs: HabitLogRow[],
  habits: HabitLite[],
  day: string,
): number {
  if (habits.length === 0) {
    return 0;
  }
  let ok = 0;
  for (const h of habits) {
    const row = logs.find((l) => l.habit_id === h.id && l.logged_on === day);
    if (row?.completed) {
      ok += 1;
    }
  }
  return ok / habits.length;
}

export function globalCompletion30d(
  logs: HabitLogRow[],
  habits: HabitLite[],
  fromDay: string,
  toDay: string,
): number {
  if (habits.length === 0) {
    return 0;
  }
  const days: string[] = [];
  let t = Date.parse(`${fromDay}T12:00:00Z`);
  const end = Date.parse(`${toDay}T12:00:00Z`);
  while (t <= end) {
    days.push(new Date(t).toISOString().slice(0, 10));
    t += 86400000;
  }
  if (days.length === 0) {
    return 0;
  }
  let cells = 0;
  let ok = 0;
  for (const day of days) {
    for (const h of habits) {
      cells += 1;
      const row = logs.find((l) => l.habit_id === h.id && l.logged_on === day);
      if (row?.completed) {
        ok += 1;
      }
    }
  }
  return Math.round((ok / cells) * 100);
}

export function bestStreakAmongHabits(
  logs: HabitLogRow[],
  habits: HabitLite[],
  endDay: string,
): number {
  let best = 0;
  for (const h of habits) {
    best = Math.max(best, currentStreak(logs, h.id, endDay));
  }
  return best;
}

export function completedCountThisMonth(
  logs: HabitLogRow[],
  habits: HabitLite[],
  year: number,
  month0: number,
): number {
  let n = 0;
  for (const l of logs) {
    if (!l.completed) {
      continue;
    }
    const d = new Date(`${l.logged_on}T12:00:00Z`);
    if (d.getUTCFullYear() === year && d.getUTCMonth() === month0) {
      if (habits.some((h) => h.id === l.habit_id)) {
        n += 1;
      }
    }
  }
  return n;
}
