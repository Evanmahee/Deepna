import {
  bestStreakInRange,
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
    <div className="glass overflow-x-auto rounded-xl shadow-sm">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase text-neutral-500">
            <th className="p-3">Habitude</th>
            <th className="p-3">Série act.</th>
            <th className="p-3">Meilleure</th>
            <th className="p-3">30j</th>
            <th className="p-3">Manquées</th>
          </tr>
        </thead>
        <tbody>
          {habits.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-sm text-neutral-500">
                Aucune habitude active. Crée-en une depuis l&apos;onglet
                Aujourd&apos;hui.
              </td>
            </tr>
          ) : (
            habits.map((h) => (
              <tr key={h.id} className="border-b border-white/10 last:border-0">
                <td className="p-3 font-medium text-white">{h.name}</td>
                <td className="p-3 text-neutral-400">
                  {currentStreak(logs, h.id, toDay)} j
                </td>
                <td className="p-3 text-neutral-400">
                  {bestStreakInRange(logs, h.id, fromDay, toDay)} j
                </td>
                <td className="p-3 text-neutral-400">
                  {completionRate30d(logs, h.id, fromDay, toDay)}%
                </td>
                <td className="p-3 text-neutral-400">{h.missed_days_count}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
