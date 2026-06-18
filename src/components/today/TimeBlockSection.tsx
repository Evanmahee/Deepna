import type { HabitLogRow, HabitRowData, TimeBlockRow } from "@/types/today";
import { HabitRow } from "@/components/today/HabitRow";

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
  const title = block
    ? `${block.icon_emoji ? `${block.icon_emoji} ` : ""}${block.title}`
    : "Sans créneau";
  const subtitle = block
    ? `${formatBlockTime(block.starts_at)} – ${formatBlockTime(block.ends_at)}`
    : "Habitudes non assignées";

  if (habits.length === 0) {
    return null;
  }

  return (
    <details
      open={defaultOpen}
      className="group mb-3 overflow-hidden rounded-2xl glass shadow-sm shadow-slate-900/5"
    >
      <summary className="glass-subtle flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
        <span className="text-neutral-500 transition-transform group-open:rotate-180">
          ▼
        </span>
      </summary>
      <div className="glass-subtle space-y-2 border-t border-white/10 px-3 py-3">
        {habits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            logDate={logDate}
            completedToday={Boolean(logsByHabitId[h.id]?.completed)}
          />
        ))}
      </div>
    </details>
  );
}
