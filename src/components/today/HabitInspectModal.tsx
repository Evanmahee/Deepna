"use client";

import type { HabitRowData } from "@/types/today";

type HabitInspectModalProps = {
  habit: HabitRowData | null;
  onClose: () => void;
};

export function HabitInspectModal({ habit, onClose }: HabitInspectModalProps) {
  if (!habit) {
    return null;
  }

  const note = habit.description?.trim();

  return (
    <div className="fixed inset-0 z-[250] flex flex-col justify-end">
      <button
        type="button"
        className="flex-1 bg-black/60"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="glass-sheet-dark relative max-h-[70dvh] w-full overflow-y-auto rounded-t-[32px] px-4 pb-8 pt-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {habit.icon_emoji || "•"}
          </span>
          <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Description
        </p>
        {note ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
            {note}
          </p>
        ) : (
          <p className="text-sm text-neutral-500">
            Aucune note pour cette habitude.
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
