import type { HourlyCheckinRow } from "@/types/hourly";
import {
  formatHourlyCheckinWhen,
  moodEmoji,
  moodLabel,
} from "@/types/hourly";

type CheckinHistoryProps = {
  rows: HourlyCheckinRow[];
};

export function CheckinHistory({ rows }: CheckinHistoryProps) {
  return (
    <div className="glass rounded-xl p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-white">
        Derniers check-ins
      </h2>
      <ul className="space-y-3">
        {rows.length === 0 ? (
          <li className="text-sm text-neutral-500">Aucun historique.</li>
        ) : (
          rows.map((r) => (
            <li
              key={r.id}
              className="border-b border-white/10 pb-3 text-sm last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                <span>{formatHourlyCheckinWhen(r)}</span>
                <span
                  className="flex items-center gap-1.5 text-base"
                  title={moodLabel(r.mood)}
                >
                  <span aria-hidden>{moodEmoji(r.mood)}</span>
                  <span className="sr-only">{moodLabel(r.mood)}</span>
                </span>
              </div>
              {r.note ? (
                <p className="mt-1 text-neutral-300">{r.note}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
