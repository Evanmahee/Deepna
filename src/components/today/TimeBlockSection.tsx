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
    : "Sans créneau";
  const subtitle = block
    ? `${formatBlockTime(block.starts_at)} – ${formatBlockTime(block.ends_at)}`
    : "Habitudes non assignées";

  if (habits.length === 0) {
    return null;
  }

  const completedCount = habits.filter((h) => isHabitCompleted(h.id)).length;
  const pct =
    habits.length > 0
      ? Math.min(100, (completedCount / habits.length) * 100)
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
        aria-valuemax={habits.length}
        aria-label={`${title} — ${completedCount} sur ${habits.length} complétées`}
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
          <GroupChevronButton completed={completedCount} total={habits.length} />
        </div>
      </summary>
      <div className="space-y-2 px-3 py-3">
        {habits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            logDate={logDate}
            completedToday={isHabitCompleted(h.id)}
            onCompletedChange={(next) =>
              setCompletedOverrides((prev) => ({ ...prev, [h.id]: next }))
            }
          />
        ))}
      </div>
    </details>
  );
}
