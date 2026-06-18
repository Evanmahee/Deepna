import type { HourlyCheckinRow } from "@/types/hourly";
import { formatHourlyCheckinWhen, moodLabel } from "@/types/hourly";

type CheckinHistoryProps = {
  rows: HourlyCheckinRow[];
};

export function CheckinHistory({ rows }: CheckinHistoryProps) {
  return (
    <div className="rounded-xl border border-[#333] bg-[#111] p-4">
      <h2 className="mb-3 text-sm font-semibold text-zinc-300">
        Derniers check-ins
      </h2>
      <ul className="space-y-3">
        {rows.length === 0 ? (
          <li className="text-sm text-zinc-500">Aucun historique.</li>
        ) : (
          rows.map((r) => (
            <li
              key={r.id}
              className="border-b border-[#222] pb-3 text-sm last:border-0 last:pb-0"
            >
              <div className="flex justify-between gap-2 text-xs text-zinc-500">
                <span>{formatHourlyCheckinWhen(r)}</span>
                <span className="text-[#6366f1]">{moodLabel(r.mood)}</span>
              </div>
              {r.note ? (
                <p className="mt-1 text-zinc-300">{r.note}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
