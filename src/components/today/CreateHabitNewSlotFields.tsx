"use client";

type Props = {
  newLabel: string;
  setNewLabel: (v: string) => void;
  newStart: string;
  setNewStart: (v: string) => void;
  newEnd: string;
  setNewEnd: (v: string) => void;
};

const field =
  "rounded border border-[#333] bg-[#0a0a0f] px-2 py-1.5 text-sm text-white";

export function CreateHabitNewSlotFields({
  newLabel,
  setNewLabel,
  newStart,
  setNewStart,
  newEnd,
  setNewEnd,
}: Props) {
  return (
    <div className="space-y-2 rounded-lg border border-[#333] bg-[#111] p-3">
      <input
        value={newLabel}
        onChange={(e) => setNewLabel(e.target.value)}
        className={`w-full ${field}`}
        placeholder="Nom du créneau"
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
