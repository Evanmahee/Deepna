import { addDaysUtc } from "@/lib/dates";
import type { HabitLite } from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";

type WeeklyGridProps = {
  habits: HabitLite[];
  logs: HabitLogRow[];
  endDay: string;
};

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"] as const;

function weekdayIndex(iso: string): number {
  const d = new Date(Date.parse(`${iso}T12:00:00.000Z`)).getUTCDay();
  return d === 0 ? 6 : d - 1;
}

function weekDaysEnding(endDay: string): string[] {
  const end = Date.parse(`${endDay}T12:00:00.000Z`);
  const endDow = new Date(end).getUTCDay();
  const mondayOffset = endDow === 0 ? -6 : 1 - endDow;
  const monday = addDaysUtc(endDay, mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDaysUtc(monday, i));
}

function isCompleted(
  logs: HabitLogRow[],
  habitId: string,
  day: string,
): boolean {
  return logs.some(
    (l) => l.habit_id === habitId && l.logged_on === day && l.completed,
  );
}

export function WeeklyGrid({ habits, logs, endDay }: WeeklyGridProps) {
  const days = weekDaysEnding(endDay);

  return (
    <div className="glass overflow-x-auto rounded-xl p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-white">Semaine en cours</h2>
      {habits.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune habitude active.</p>
      ) : (
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr>
              <th className="pb-2 text-left text-xs font-medium text-neutral-500">
                Habitude
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="pb-2 text-center text-xs font-medium text-neutral-500"
                >
                  {WEEKDAY_LABELS[weekdayIndex(day)]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => (
              <tr key={h.id} className="border-t border-white/10">
                <td className="max-w-[8rem] truncate py-2 pr-2 font-medium text-white">
                  {h.name}
                </td>
                {days.map((day) => {
                  const done = isCompleted(logs, h.id, day);
                  return (
                    <td key={day} className="py-2 text-center">
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full ${
                          done ? "bg-white" : "bg-white/15 ring-1 ring-white/20"
                        }`}
                        aria-label={done ? "Fait" : "Non fait"}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
