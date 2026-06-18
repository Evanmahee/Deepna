import { describe, expect, it } from "vitest";
import {
  bestStreakAllTimeForHabit,
  completionRate30d,
  currentStreak,
  globalCompletion30d,
} from "./habit-stats";
import type { HabitLogRow } from "@/types/today";

const habits = [{ id: "h1", name: "Sport", missed_days_count: 0 }];

function log(day: string, completed: boolean): HabitLogRow {
  return {
    id: `l-${day}`,
    habit_id: "h1",
    user_id: "u1",
    logged_on: day,
    completed,
    completed_at: completed ? `${day}T12:00:00.000Z` : null,
  };
}

describe("habit-stats", () => {
  it("currentStreak compte les jours consécutifs", () => {
    const logs = [log("2026-06-16", true), log("2026-06-15", true), log("2026-06-14", false)];
    expect(currentStreak(logs, "h1", "2026-06-16")).toBe(2);
  });

  it("completionRate30d à 0% sans logs", () => {
    expect(completionRate30d([], "h1", "2026-06-01", "2026-06-03")).toBe(0);
  });

  it("completionRate30d compte les jours complétés", () => {
    const logs = [log("2026-06-01", true), log("2026-06-02", false), log("2026-06-03", true)];
    expect(completionRate30d(logs, "h1", "2026-06-01", "2026-06-03")).toBe(67);
  });

  it("globalCompletion30d sans habitudes retourne 0", () => {
    expect(globalCompletion30d([], [], "2026-06-01", "2026-06-03")).toBe(0);
  });

  it("bestStreakAllTimeForHabit trouve la plus longue série", () => {
    const logs = [
      log("2026-06-01", true),
      log("2026-06-02", true),
      log("2026-06-03", true),
      log("2026-06-05", true),
    ];
    expect(bestStreakAllTimeForHabit(logs, "h1")).toBe(3);
  });
});
