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
      <table className="w-full min-w-[360px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase text-neutral-500">
            <th className="p-3">Nom</th>
            <th className="p-3">Série actuelle</th>
            <th className="p-3">Meilleure série</th>
            <th className="p-3">Taux 30j</th>
          </tr>
        </thead>
        <tbody>
          {habits.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-sm text-neutral-500">
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
