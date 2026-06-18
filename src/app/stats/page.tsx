import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayUtcString } from "@/lib/dates";
import {
  bestStreakAmongHabits,
  completedCountThisMonth,
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

  const [habitsRes, logsRes, profileRes] = await Promise.all([
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
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const habits = (habitsRes.data ?? []) as HabitLite[];
  const logs = (logsRes.data ?? []) as HabitLogRow[];
  const firstName = profileRes.data?.display_name?.trim() ?? null;

  const globalPct = globalCompletion30d(logs, habits, fromDay, toDay);
  const bestStreak = bestStreakAmongHabits(logs, habits, toDay);
  const now = new Date();
  const monthDone = completedCountThisMonth(
    logs,
    habits,
    now.getUTCFullYear(),
    now.getUTCMonth(),
  );

  const calYear = now.getUTCFullYear();
  const calMonth = now.getUTCMonth() + 1;

  return (
    <div className="min-h-full flex-1 bg-[#0a0a0f] text-white">
      <PageHeader
        title="Statistiques"
        subtitle="30 derniers jours (UTC)"
        firstName={firstName}
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 pb-28">
        <StatsHeader
          globalPct={globalPct}
          bestStreak={bestStreak}
          monthCompleted={monthDone}
        />
        <MonthCalendar
          year={calYear}
          month={calMonth}
          logs={logs}
          habits={habits}
        />
        <div className="rounded-xl border border-[#333] bg-[#111] p-3 text-xs text-zinc-400">
          <p className="mb-2 font-medium text-zinc-300">Légende du calendrier</p>
          <ul className="space-y-1">
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-emerald-800" />{" "}
              Jour à 100 % des habitudes cochées
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-emerald-600/70" />{" "}
              Entre 50 % et 99 %
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-emerald-900/40" />{" "}
              Partiel (moins de la moitié)
            </li>
            <li>
              <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-zinc-800" />{" "}
              Aucune habitude complétée ce jour-là
            </li>
          </ul>
        </div>
        {habits.length > 0 && globalPct < 30 ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/95">
            Chaque série commence par un jour où tu te montres présent. Ce
            mois-ci est encore léger : vise une petite habitude chaque jour, la
            courbe suivra.
          </p>
        ) : null}
        <HabitStatsTable
          habits={habits}
          logs={logs}
          fromDay={fromDay}
          toDay={toDay}
        />
      </div>
    </div>
  );
}
