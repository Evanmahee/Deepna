import {
  completionRate30d,
  currentStreak,
  type HabitLite,
} from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";

type HabitStatsTableProps = {
  habits: HabitLite[];
  logs: HabitLogRow[];
  fromDay: string;
  toDay: string;
};

export function HabitStatsTable({
  habits,
  logs,
  fromDay,
  toDay,
}: HabitStatsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#333] bg-[#111]">
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#333] text-xs uppercase text-zinc-500">
            <th className="p-3">Habitude</th>
            <th className="p-3">Série</th>
            <th className="p-3">30j</th>
            <th className="p-3">Manquées</th>
          </tr>
        </thead>
        <tbody>
          {habits.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-sm text-zinc-500">
                Aucune habitude active. Crée-en une depuis l&apos;onglet
                Aujourd&apos;hui.
              </td>
            </tr>
          ) : (
            habits.map((h) => (
              <tr key={h.id} className="border-b border-[#222] last:border-0">
                <td className="p-3 font-medium text-white">{h.name}</td>
                <td className="p-3 text-zinc-300">
                  {currentStreak(logs, h.id, toDay)} j
                </td>
                <td className="p-3 text-zinc-300">
                  {completionRate30d(logs, h.id, fromDay, toDay)}%
                </td>
                <td className="p-3 text-zinc-300">{h.missed_days_count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
