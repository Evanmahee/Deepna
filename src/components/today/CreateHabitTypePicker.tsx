"use client";

type HabitType = "good" | "bad" | "neutral";

type CreateHabitTypePickerProps = {
  value: HabitType;
  onChange: (t: HabitType) => void;
};

export function CreateHabitTypePicker({
  value,
  onChange,
}: CreateHabitTypePickerProps) {
  return (
    <div>
      <p className="mb-1 text-xs text-zinc-400">Type</p>
      <div className="flex gap-2">
        {(["good", "bad", "neutral"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium ${
              value === t
                ? "border-[#6366f1] bg-[#6366f1]/20 text-white"
                : "border-[#333] text-zinc-400"
            }`}
          >
            {t === "good" ? "Bien" : t === "bad" ? "Mal" : "Neutre"}
          </button>
        ))}
      </div>
    </div>
  );
}
