import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayUtcString } from "@/lib/dates";
import type { HabitLite } from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";
import { StatsPageClient } from "@/components/stats/StatsPageClient";
import { PageHeader } from "@/components/nav/PageHeader";

export const metadata: Metadata = {
  title: "Stats — Deepna",
};

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const today = todayUtcString();
  const now = new Date();
  const calYear = now.getUTCFullYear();
  const calMonth = now.getUTCMonth() + 1;

  const [habitsRes, logsRes] = await Promise.all([
    supabase
      .from("habits")
      .select("id, name, missed_days_count, icon_emoji, icon_color")
      .eq("user_id", user.id)
      .eq("archived", false),
    supabase.from("habit_logs").select("*").eq("user_id", user.id),
  ]);

  const habits = (habitsRes.data ?? []) as HabitLite[];
  const allLogs = (logsRes.data ?? []) as HabitLogRow[];

  return (
    <div className="min-h-full flex-1">
      <PageHeader title="Statistiques" showAdd />
      <StatsPageClient
        habits={habits}
        allLogs={allLogs}
        today={today}
        calYear={calYear}
        calMonth={calMonth}
      />
    </div>
  );
}
