import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayUtcString } from "@/lib/dates";
import {
  bestStreakAllTimeAmongHabits,
  globalCompletion30d,
  type HabitLite,
} from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";
import { StatsHeader } from "@/components/stats/StatsHeader";
import { MonthCalendar } from "@/components/stats/MonthCalendar";
import { HabitStatsTable } from "@/components/stats/HabitStatsTable";
import { PageHeader } from "@/components/nav/PageHeader";

export const metadata: Metadata = {
  title: "Stats — Deepna",
};

function addDays(isoDay: string, delta: number): string {
  const t = Date.parse(`${isoDay}T12:00:00Z`) + delta * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

function monthBounds(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(year, month, 0));
  const end = last.toISOString().slice(0, 10);
  return { start, end };
}

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const toDay = todayUtcString();
  const fromDay = addDays(toDay, -29);
  const now = new Date();
  const calYear = now.getUTCFullYear();
  const calMonth = now.getUTCMonth() + 1;
  const { start: monthStart, end: monthEnd } = monthBounds(calYear, calMonth);

  const [habitsRes, logs30Res, logsAllRes, logsMonthRes] = await Promise.all([
    supabase
      .from("habits")
      .select("id, name, missed_days_count")
      .eq("user_id", user.id)
      .eq("archived", false),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_on", fromDay)
      .lte("logged_on", toDay),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_on", monthStart)
      .lte("logged_on", monthEnd),
  ]);

  const habits = (habitsRes.data ?? []) as HabitLite[];
  const logs30 = (logs30Res.data ?? []) as HabitLogRow[];
  const logsAll = (logsAllRes.data ?? []) as HabitLogRow[];
  const logsMonth = (logsMonthRes.data ?? []) as HabitLogRow[];

  const globalPct = globalCompletion30d(logs30, habits, fromDay, toDay);
  const bestStreakAllTime = bestStreakAllTimeAmongHabits(logsAll, habits);

  return (
    <div className="min-h-full flex-1">
      <PageHeader
        title="Statistiques"
        subtitle="30 derniers jours (UTC)"
        showAdd
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 pb-28">
        <StatsHeader
          globalPct={globalPct}
          bestStreakAllTime={bestStreakAllTime}
          activeHabits={habits.length}
        />
        <MonthCalendar
          year={calYear}
          month={calMonth}
          logs={logsMonth}
          habits={habits}
        />
        <HabitStatsTable
          habits={habits}
          logs={logs30}
          fromDay={fromDay}
          toDay={toDay}
        />
      </div>
    </div>
  );
}
