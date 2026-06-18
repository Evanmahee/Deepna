import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseLoggedOnParam } from "@/lib/dates";
import { DateStrip } from "@/components/today/DateStrip";
import { TimeBlockSection } from "@/components/today/TimeBlockSection";
import { FloatingAddButton } from "@/components/today/FloatingAddButton";
import { PageHeader } from "@/components/nav/PageHeader";
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

  const [tbRes, habitsRes, logsRes, profileRes] = await Promise.all([
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
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const timeBlocks = (tbRes.data ?? []) as TimeBlockRow[];
  const habits = (habitsRes.data ?? []) as HabitRowData[];
  const logs = (logsRes.data ?? []) as HabitLogRow[];
  const firstName = profileRes.data?.display_name?.trim() ?? null;

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

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="Aujourd'hui"
        subtitle={new Date(`${logDate}T12:00:00Z`).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        firstName={firstName}
      />
      <DateStrip selectedDate={logDate} />
      <main className="flex-1 space-y-1 px-3 py-4">
        {habits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#333] bg-[#111] px-4 py-6 text-center text-sm text-zinc-400">
            Commence par créer ta première habitude → utilise le bouton{" "}
            <span className="text-zinc-200">+</span> en bas à droite.
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
      <FloatingAddButton timeBlocks={timeBlocks} />
    </div>
  );
}
