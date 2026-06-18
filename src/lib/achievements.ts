import { dayCompletionRatio, bestStreakAllTimeForHabit, type HabitLite } from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";

export type AchievementDef = {
  id: string;
  emoji: string;
  name: string;
  description: string;
};

export type AchievementStatus = AchievementDef & {
  unlocked: boolean;
  unlockedAt: string | null;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_step",
    emoji: "👣",
    name: "Premier pas",
    description: "Première habitude complétée",
  },
  {
    id: "perfect_week",
    emoji: "🌟",
    name: "Semaine parfaite",
    description: "7 jours consécutifs à 100 %",
  },
  {
    id: "fire_month",
    emoji: "🔥",
    name: "Mois de feu",
    description: "30 jours consécutifs avec au moins 1 habitude",
  },
  {
    id: "centurion",
    emoji: "💯",
    name: "Centurion",
    description: "100 habitudes complétées au total",
  },
  {
    id: "early_bird",
    emoji: "🌅",
    name: "Matinal",
    description: "Habitude complétée avant 8h, 7 fois",
  },
  {
    id: "night_owl",
    emoji: "🦉",
    name: "Noctambule",
    description: "Habitude complétée après 22h, 7 fois",
  },
  {
    id: "diversified",
    emoji: "🎯",
    name: "Diversifié",
    description: "5 habitudes actives simultanément",
  },
  {
    id: "flawless",
    emoji: "💎",
    name: "Sans faille",
    description: "21 jours consécutifs sur une habitude",
  },
];

function sortedUniqueDays(logs: HabitLogRow[], completedOnly = true): string[] {
  const days = new Set<string>();
  for (const l of logs) {
    if (!completedOnly || l.completed) {
      days.add(l.logged_on);
    }
  }
  return [...days].sort();
}

function consecutiveRun(
  days: string[],
  predicate: (day: string) => boolean,
  target: number,
): string | null {
  if (days.length === 0) return null;
  let run = 0;
  let runStart = days[0];
  for (const day of days) {
    if (predicate(day)) {
      if (run === 0) runStart = day;
      run += 1;
      if (run >= target) return day;
    } else {
      run = 0;
    }
  }
  return null;
}

function hourFromCompletedAt(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getUTCHours();
}

export function computeAchievements(
  logs: HabitLogRow[],
  habits: HabitLite[],
  today: string,
): AchievementStatus[] {
  const completedLogs = logs.filter((l) => l.completed);
  const allDays = sortedUniqueDays(logs, true);

  const firstStepAt =
    completedLogs.length > 0
      ? completedLogs
          .slice()
          .sort((a, b) =>
            (a.completed_at ?? a.logged_on).localeCompare(
              b.completed_at ?? b.logged_on,
            ),
          )[0]?.logged_on ?? null
      : null;

  const calendarDays = sortedUniqueDays(
    logs.filter((l) => l.completed || habits.length > 0),
    false,
  );
  const rangeDays: string[] = [];
  if (calendarDays.length > 0) {
    let t = Date.parse(`${calendarDays[0]}T12:00:00Z`);
    const end = Date.parse(`${today}T12:00:00Z`);
    while (t <= end) {
      rangeDays.push(new Date(t).toISOString().slice(0, 10));
      t += 86400000;
    }
  }

  const perfectWeekAt = consecutiveRun(
    rangeDays,
    (day) => habits.length > 0 && dayCompletionRatio(logs, habits, day) >= 1,
    7,
  );

  const fireMonthAt = consecutiveRun(
    rangeDays,
    (day) => completedLogs.some((l) => l.logged_on === day),
    30,
  );

  const centurionAt =
    completedLogs.length >= 100
      ? completedLogs
          .slice()
          .sort((a, b) =>
            (a.completed_at ?? a.logged_on).localeCompare(
              b.completed_at ?? b.logged_on,
            ),
          )[99]?.logged_on ?? null
      : null;

  const morningLogs = completedLogs.filter((l) => {
    const h = hourFromCompletedAt(l.completed_at);
    return h !== null && h < 8;
  });
  const morningAt =
    morningLogs.length >= 7
      ? morningLogs
          .slice()
          .sort((a, b) =>
            (a.completed_at ?? "").localeCompare(b.completed_at ?? ""),
          )[6]?.logged_on ?? null
      : null;

  const nightLogs = completedLogs.filter((l) => {
    const h = hourFromCompletedAt(l.completed_at);
    return h !== null && h >= 22;
  });
  const nightAt =
    nightLogs.length >= 7
      ? nightLogs
          .slice()
          .sort((a, b) =>
            (a.completed_at ?? "").localeCompare(b.completed_at ?? ""),
          )[6]?.logged_on ?? null
      : null;

  const diversifiedUnlocked = habits.length >= 5;

  let flawlessAt: string | null = null;
  for (const h of habits) {
    if (bestStreakAllTimeForHabit(logs, h.id) >= 21) {
      const days = completedLogs
        .filter((l) => l.habit_id === h.id)
        .map((l) => l.logged_on)
        .sort();
      let run = 0;
      for (let i = 0; i < days.length; i++) {
        if (i === 0 || Date.parse(`${days[i]}T12:00:00Z`) - Date.parse(`${days[i - 1]}T12:00:00Z`) === 86400000) {
          run += 1;
          if (run >= 21) {
            flawlessAt = days[i];
            break;
          }
        } else {
          run = 1;
        }
      }
      if (flawlessAt) break;
    }
  }

  const unlockMap: Record<string, { unlocked: boolean; unlockedAt: string | null }> = {
    first_step: { unlocked: Boolean(firstStepAt), unlockedAt: firstStepAt },
    perfect_week: { unlocked: Boolean(perfectWeekAt), unlockedAt: perfectWeekAt },
    fire_month: { unlocked: Boolean(fireMonthAt), unlockedAt: fireMonthAt },
    centurion: { unlocked: Boolean(centurionAt), unlockedAt: centurionAt },
    early_bird: { unlocked: Boolean(morningAt), unlockedAt: morningAt },
    night_owl: { unlocked: Boolean(nightAt), unlockedAt: nightAt },
    diversified: {
      unlocked: diversifiedUnlocked,
      unlockedAt: diversifiedUnlocked ? today : null,
    },
    flawless: { unlocked: Boolean(flawlessAt), unlockedAt: flawlessAt },
  };

  return ACHIEVEMENTS.map((def) => ({
    ...def,
    ...unlockMap[def.id],
  }));
}
