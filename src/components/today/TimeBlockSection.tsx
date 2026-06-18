"use client";

import { useEffect, useState } from "react";
import type { HabitLogRow, HabitRowData, TimeBlockRow } from "@/types/today";
import { HabitRow } from "@/components/today/HabitRow";
import { GroupChevronButton } from "@/components/today/GroupChevronButton";

type TimeBlockSectionProps = {
  block: TimeBlockRow | null;
  habits: HabitRowData[];
  logsByHabitId: Record<string, HabitLogRow | undefined>;
  logDate: string;
  defaultOpen?: boolean;
  unassignedLabel?: string;
};

function formatBlockTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso.slice(0, 16);
  }
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function TimeBlockSection({
  block,
  habits,
  logsByHabitId,
  logDate,
  defaultOpen = false,
  unassignedLabel,
}: TimeBlockSectionProps) {
  const [completedOverrides, setCompletedOverrides] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setCompletedOverrides({});
  }, [logDate, logsByHabitId]);

  const isHabitCompleted = (habitId: string) => {
    if (habitId in completedOverrides) {
      return completedOverrides[habitId];
    }
    return Boolean(logsByHabitId[habitId]?.completed);
  };

  const title = block
    ? `${block.icon_emoji ? `${block.icon_emoji} ` : ""}${block.title}`
    : (unassignedLabel ?? "Sans créneau");
  const subtitle = block
    ? `${formatBlockTime(block.starts_at)} – ${formatBlockTime(block.ends_at)}`
    : "Habitudes non assignées";

  if (habits.length === 0) {
    return null;
  }

  const sortedHabits = [...habits].sort((a, b) => {
    const ca = isHabitCompleted(a.id);
    const cb = isHabitCompleted(b.id);
    if (ca !== cb) return ca ? 1 : -1;
    return (
      (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
      a.name.localeCompare(b.name, "fr")
    );
  });

  const completedCount = sortedHabits.filter((h) =>
    isHabitCompleted(h.id),
  ).length;
  const pct =
    sortedHabits.length > 0
      ? Math.min(100, (completedCount / sortedHabits.length) * 100)
      : 0;
  const hasProgress = completedCount > 0;

  return (
    <details
      open={defaultOpen}
      className="group glass-sheet-dark glass-sheet-dark--card glass-group-card mb-3 overflow-hidden rounded-2xl"
    >
      <summary
        className="relative flex cursor-pointer list-none items-center overflow-hidden border-b border-white/10 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden"
        role="progressbar"
        aria-valuenow={completedCount}
        aria-valuemin={0}
        aria-valuemax={sortedHabits.length}
        aria-label={`${title} — ${completedCount} sur ${sortedHabits.length} complétées`}
      >
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 z-0 bg-white transition-[width] duration-500 ease-out group-open:opacity-0"
          style={{ width: `${pct}%` }}
        />
        <div className="relative z-10 flex w-full min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2
              className={`truncate text-base font-semibold ${
                hasProgress
                  ? "text-black group-open:text-white"
                  : "text-white"
              }`}
            >
              {title}
            </h2>
            <p
              className={`truncate text-xs ${
                hasProgress
                  ? "text-black/55 group-open:text-neutral-500"
                  : "text-neutral-500"
              }`}
            >
              {subtitle}
            </p>
          </div>
          <GroupChevronButton completed={completedCount} total={sortedHabits.length} />
        </div>
      </summary>
      <div className="space-y-2 px-3 py-3">
        {sortedHabits.map((h) => {
          const done = isHabitCompleted(h.id);
          return (
            <HabitRow
              key={h.id}
              habit={h}
              logDate={logDate}
              completedToday={done}
              dimmed={done}
              onCompletedChange={(next) =>
                setCompletedOverrides((prev) => ({ ...prev, [h.id]: next }))
              }
            />
          );
        })}
      </div>
    </details>
  );
}
