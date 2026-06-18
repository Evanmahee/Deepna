"use client";

import { useMemo } from "react";
import { computeAchievements } from "@/lib/achievements";
import type { HabitLite } from "@/lib/habit-stats";
import type { HabitLogRow } from "@/types/today";

type AchievementsGridProps = {
  logs: HabitLogRow[];
  habits: HabitLite[];
  today: string;
};

function formatUnlockDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(Date.parse(`${iso}T12:00:00Z`));
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function AchievementsGrid({ logs, habits, today }: AchievementsGridProps) {
  const achievements = useMemo(
    () => computeAchievements(logs, habits, today),
    [logs, habits, today],
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="glass rounded-xl p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-white">Badges</h2>
        <span className="text-xs text-neutral-500">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={[
              "rounded-xl border p-3 text-center transition-opacity",
              a.unlocked
                ? "border-indigo-500/30 bg-indigo-500/10"
                : "border-white/10 bg-white/5 opacity-45 grayscale",
            ].join(" ")}
          >
            <span className="text-2xl" aria-hidden>
              {a.emoji}
            </span>
            <p className="mt-1 text-xs font-semibold text-white">{a.name}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-neutral-500">
              {a.description}
            </p>
            {a.unlocked && a.unlockedAt ? (
              <p className="mt-1 text-[10px] text-indigo-300">
                Débloqué le {formatUnlockDate(a.unlockedAt)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
