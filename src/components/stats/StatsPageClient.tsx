"use client";

import { useMemo, useState } from "react";
import {
  bestStreakAllTimeAmongHabits,
  bestStreakAmongHabits,
  earliestLogDay,
  globalCompletionInRange,
  totalCompletedInRange,
  type HabitLite,
} from "@/lib/habit-stats";
import { periodBounds, periodLabel, type StatsPeriod } from "@/lib/stats-period";
import type { HabitLogRow } from "@/types/today";
import { PeriodSelector } from "@/components/stats/PeriodSelector";
import { GlobalScoreRing } from "@/components/stats/GlobalScoreRing";
import { StatsMetricsRow } from "@/components/stats/StatsMetricsRow";
import { MonthCalendar } from "@/components/stats/MonthCalendar";
import { WeeklyGrid } from "@/components/stats/WeeklyGrid";
import { HabitStatsTable } from "@/components/stats/HabitStatsTable";
import { AchievementsGrid } from "@/components/stats/AchievementsGrid";

type StatsPageClientProps = {
  habits: HabitLite[];
  allLogs: HabitLogRow[];
  today: string;
  calYear: number;
  calMonth: number;
};

function logsInRange(
  logs: HabitLogRow[],
  fromDay: string,
  toDay: string,
): HabitLogRow[] {
  return logs.filter((l) => l.logged_on >= fromDay && l.logged_on <= toDay);
}

export function StatsPageClient({
  habits,
  allLogs,
  today,
  calYear,
  calMonth,
}: StatsPageClientProps) {
  const [period, setPeriod] = useState<StatsPeriod>("30");

  const earliest = earliestLogDay(allLogs);
  const { fromDay, toDay } = periodBounds(period, today, earliest);
  const periodLogs = useMemo(
    () => logsInRange(allLogs, fromDay, toDay),
    [allLogs, fromDay, toDay],
  );

  const globalPct = globalCompletionInRange(periodLogs, habits, fromDay, toDay);
  const currentStreak = bestStreakAmongHabits(allLogs, habits, toDay);
  const bestStreak = bestStreakAllTimeAmongHabits(allLogs, habits);
  const totalCompleted = totalCompletedInRange(allLogs, fromDay, toDay);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 pb-28">
      <PeriodSelector value={period} onChange={setPeriod} />
      <GlobalScoreRing pct={globalPct} subtitle={periodLabel(period)} />
      <StatsMetricsRow
        currentStreak={currentStreak}
        bestStreak={bestStreak}
        totalCompleted={totalCompleted}
      />
      <MonthCalendar
        logs={allLogs}
        habits={habits}
        initialYear={calYear}
        initialMonth={calMonth}
      />
      <WeeklyGrid habits={habits} logs={periodLogs} endDay={toDay} />
      <HabitStatsTable
        habits={habits}
        logs={periodLogs}
        allLogs={allLogs}
        fromDay={fromDay}
        toDay={toDay}
      />
      <AchievementsGrid logs={allLogs} habits={habits} today={today} />
    </div>
  );
}
