import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseLoggedOnParam, addDaysUtc } from "@/lib/dates";
import { buildCompletionByDay } from "@/lib/day-completion";
import type { HabitLite } from "@/lib/habit-stats";
import { DateStrip } from "@/components/today/DateStrip";
import { TimeBlockSection } from "@/components/today/TimeBlockSection";
import { TodayPageHeader } from "@/components/today/TodayPageHeader";
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

  const byBlock = new Map<string | null, HabitRowData[]>();
  for (const h of habits) {
    const key = h.time_block_id;
    const arr = byBlock.get(key) ?? [];
    arr.push(h);
    byBlock.set(key, arr);
  }
  for (const arr of byBlock.values()) {
    arr.sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
        a.name.localeCompare(b.name, "fr"),
    );
  }

  return (
    <div className="flex min-h-full min-w-0 flex-1 flex-col overflow-x-hidden">
      <div className="sticky top-0 z-10">
        <TodayPageHeader />
        <DateStrip selectedDate={logDate} completionByDay={completionByDay} />
      </div>
      <main className="flex-1 space-y-1 px-3 pb-4 pt-6">
        {habits.length === 0 ? (
          <p className="glass rounded-xl px-4 py-6 text-center text-sm text-neutral-400">
            Commence par créer ta première habitude → utilise le bouton{" "}
            <span className="font-semibold text-white">+</span> en haut à droite.
          </p>
        ) : null}
        {timeBlocks.map((block, i) => (
          <TimeBlockSection
            key={block.id}
            block={block}
            habits={byBlock.get(block.id) ?? []}
            logsByHabitId={logsByHabitId}
            logDate={logDate}
            defaultOpen={i === 0}
          />
        ))}
        <TimeBlockSection
          block={null}
          habits={byBlock.get(null) ?? []}
          logsByHabitId={logsByHabitId}
          logDate={logDate}
          defaultOpen={timeBlocks.length === 0}
        />
      </main>
    </div>
  );
}
