"use client";

import { useMemo, useState } from "react";
import { DateStrip } from "@/components/today/DateStrip";
import { TimeBlockSection } from "@/components/today/TimeBlockSection";
import { FloatingAddButton } from "@/components/today/FloatingAddButton";
import { TodayPageHeader } from "@/components/today/TodayPageHeader";
import { TodayDayProgress } from "@/components/today/TodayDayProgress";
import { CreateGroupModal } from "@/components/today/CreateGroupModal";
import { dayCompletionStats } from "@/lib/today-display";
import type { DayCompletionStatus } from "@/lib/day-completion";
import type { HabitLogRow, HabitRowData, TimeBlockRow } from "@/types/today";

type TodayPageClientProps = {
  logDate: string;
  timeBlocks: TimeBlockRow[];
  habits: HabitRowData[];
  logsByHabitId: Record<string, HabitLogRow>;
  completionByDay: Record<string, DayCompletionStatus>;
};

function groupByBlock(habits: HabitRowData[]) {
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
  return byBlock;
}

export function TodayPageClient({
  logDate,
  timeBlocks,
  habits,
  logsByHabitId,
  completionByDay,
}: TodayPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const filteredHabits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter((h) => h.name.toLowerCase().includes(q));
  }, [habits, searchQuery]);

  const byBlock = useMemo(
    () => groupByBlock(filteredHabits),
    [filteredHabits],
  );

  const unassigned = byBlock.get(null) ?? [];
  const hasNoGroups = timeBlocks.length === 0;
  const noResults =
    searchQuery.trim().length > 0 && filteredHabits.length === 0;

  const completedToday = useMemo(() => {
    let n = 0;
    for (const h of filteredHabits) {
      if (logsByHabitId[h.id]?.completed) n += 1;
    }
    return n;
  }, [filteredHabits, logsByHabitId]);

  const dayStats = dayCompletionStats(filteredHabits.length, completedToday);

  return (
    <div className="flex min-h-full min-w-0 flex-1 flex-col overflow-x-hidden">
      <div className="sticky top-0 z-10">
        <TodayPageHeader
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          logDate={logDate}
        />
        {!noResults && filteredHabits.length > 0 ? (
          <TodayDayProgress
            completed={completedToday}
            total={filteredHabits.length}
            label={dayStats.label}
            pct={dayStats.pct}
          />
        ) : null}
        <DateStrip selectedDate={logDate} completionByDay={completionByDay} />
      </div>
      <main className="flex-1 space-y-1 px-3 pb-4 pt-6">
        {noResults ? (
          <p className="glass rounded-xl px-4 py-6 text-center text-sm text-neutral-400">
            Aucune habitude ne correspond à « {searchQuery.trim()} ».
          </p>
        ) : null}

        {!noResults && habits.length === 0 ? (
          <p className="glass rounded-xl px-4 py-6 text-center text-sm text-neutral-400">
            Commence par créer ta première habitude → appuie sur le bouton{" "}
            <span className="font-semibold text-white">+</span> en haut à droite
            ou en bas à droite.
          </p>
        ) : null}

        {hasNoGroups && !noResults ? (
          <div className="glass rounded-2xl px-6 py-10 text-center">
            <span className="text-5xl" aria-hidden>
              🎯
            </span>
            <p className="mt-4 text-base font-medium text-white">
              Commence par créer ton premier groupe d&apos;habitudes
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              Organise tes habitudes par moment de la journée (matin, soir…).
            </p>
            <button
              type="button"
              onClick={() => setGroupModalOpen(true)}
              className="mt-6 rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Créer un groupe
            </button>
          </div>
        ) : null}

        {!noResults &&
          timeBlocks.map((block, i) => (
            <TimeBlockSection
              key={block.id}
              block={block}
              habits={byBlock.get(block.id) ?? []}
              logsByHabitId={logsByHabitId}
              logDate={logDate}
              defaultOpen={i === 0}
            />
          ))}

        {!noResults && !hasNoGroups && unassigned.length > 0 ? (
          <TimeBlockSection
            block={null}
            habits={unassigned}
            logsByHabitId={logsByHabitId}
            logDate={logDate}
            defaultOpen={false}
          />
        ) : null}

        {!noResults && hasNoGroups && unassigned.length > 0 ? (
          <TimeBlockSection
            block={null}
            habits={unassigned}
            logsByHabitId={logsByHabitId}
            logDate={logDate}
            defaultOpen
            unassignedLabel="Habitudes sans groupe"
          />
        ) : null}
      </main>
      <FloatingAddButton initialView="custom" />
      <CreateGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
      />
    </div>
  );
}
