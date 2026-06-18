import { dayCompletionRatio, type HabitLite } from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";

export type DayCompletionStatus = "empty" | "none" | "partial" | "full";

export function dayCompletionStatus(
  logs: HabitLogRow[],
  habits: HabitLite[],
  day: string,
): DayCompletionStatus {
  if (habits.length === 0) {
    return "empty";
  }
  const ratio = dayCompletionRatio(logs, habits, day);
  if (ratio <= 0) {
    return "none";
  }
  if (ratio >= 1) {
    return "full";
  }
  return "partial";
}

export function buildCompletionByDay(
  logs: HabitLogRow[],
  habits: HabitLite[],
  days: string[],
): Record<string, DayCompletionStatus> {
  const out: Record<string, DayCompletionStatus> = {};
  for (const day of days) {
    out[day] = dayCompletionStatus(logs, habits, day);
  }
  return out;
}
