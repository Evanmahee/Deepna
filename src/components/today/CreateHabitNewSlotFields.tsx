"use client";

type Props = {
  newLabel: string;
  setNewLabel: (v: string) => void;
  newStart: string;
  setNewStart: (v: string) => void;
  newEnd: string;
  setNewEnd: (v: string) => void;
  variant?: "light" | "dark";
};

import { glassInputClass, glassInputDarkClass } from "@/lib/glass";

const lightField = `${glassInputClass} px-2 py-1.5`;

const darkField = `${glassInputDarkClass} px-2 py-1.5`;

export function CreateHabitNewSlotFields({
  newLabel,
  setNewLabel,
  newStart,
  setNewStart,
  newEnd,
  setNewEnd,
  variant = "light",
}: Props) {
  const isDark = variant === "dark";
  const field = isDark ? darkField : lightField;
  const wrapClass = isDark
    ? "glass-dark-subtle space-y-2 rounded-xl p-3"
    : "glass-subtle space-y-2 rounded-xl p-3";

  return (
    <div className={wrapClass}>
      <input
        value={newLabel}
        onChange={(e) => setNewLabel(e.target.value)}
        className={`w-full ${field}`}
        placeholder="Nom du groupe"
      />
      <div className="flex gap-2">
        <input
          type="time"
          value={newStart}
          onChange={(e) => setNewStart(e.target.value)}
          className={`flex-1 ${field}`}
        />
        <input
          type="time"
          value={newEnd}
          onChange={(e) => setNewEnd(e.target.value)}
          className={`flex-1 ${field}`}
        />
      </div>
    </div>
  );
}
