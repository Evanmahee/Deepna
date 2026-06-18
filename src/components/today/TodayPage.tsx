import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseLoggedOnParam, addDaysUtc } from "@/lib/dates";
import { buildCompletionByDay } from "@/lib/day-completion";
import type { HabitLite } from "@/lib/habit-stats";
import { TodayPageClient } from "@/components/today/TodayPageClient";
import type { HabitLogRow, HabitRowData, TimeBlockRow } from "@/types/today";

type TodayPageProps = {
  searchParams: Promise<{ date?: string }>;
};

export async function TodayPage({ searchParams }: TodayPageProps) {
  const sp = await searchParams;
  const logDate = parseLoggedOnParam(
    typeof sp.date === "string" ? sp.date : undefined,
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [tbRes, habitsRes, logsRes] = await Promise.all([
    supabase
      .from("time_blocks")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("archived", false)
      .order("name", { ascending: true }),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_on", logDate),
  ]);

  const timeBlocks = (tbRes.data ?? []) as TimeBlockRow[];
  const habits = (habitsRes.data ?? []) as HabitRowData[];
  const logs = (logsRes.data ?? []) as HabitLogRow[];

  const habitLite: HabitLite[] = habits.map((h) => ({
    id: h.id,
    name: h.name,
    missed_days_count: h.missed_days_count,
  }));

  const stripFrom = addDaysUtc(logDate, -42);
  const stripTo = addDaysUtc(logDate, 14);

  const { data: stripLogsData } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_on", stripFrom)
    .lte("logged_on", stripTo);

  const stripLogs = (stripLogsData ?? []) as HabitLogRow[];
  const stripDays: string[] = [];
  for (let i = -42; i <= 14; i++) {
    stripDays.push(addDaysUtc(logDate, i));
  }
  const completionByDay = buildCompletionByDay(stripLogs, habitLite, stripDays);

  const logsByHabitId: Record<string, HabitLogRow> = {};
  for (const log of logs) {
    logsByHabitId[log.habit_id] = log;
  }

  return (
    <TodayPageClient
      logDate={logDate}
      timeBlocks={timeBlocks}
      habits={habits}
      logsByHabitId={logsByHabitId}
      completionByDay={completionByDay}
    />
  );
}
