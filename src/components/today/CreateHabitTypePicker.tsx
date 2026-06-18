"use client";

type HabitType = "good" | "bad" | "neutral";

type CreateHabitTypePickerProps = {
  value: HabitType;
  onChange: (t: HabitType) => void;
  variant?: "light" | "dark";
};

const activeClass: Record<HabitType, string> = {
  good: "glass-subtle border-neutral-900/40 text-neutral-900",
  bad: "glass-subtle border-neutral-500/60 text-neutral-900",
  neutral: "glass-subtle border-slate-400/60 text-slate-800",
};

const activeClassDark: Record<HabitType, string> = {
  good: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300",
  bad: "border-rose-500/50 bg-rose-500/20 text-rose-300",
  neutral: "border-violet-500/50 bg-violet-500/20 text-violet-300",
};

export function CreateHabitTypePicker({
  value,
  onChange,
  variant = "light",
}: CreateHabitTypePickerProps) {
  const isDark = variant === "dark";
  const active = isDark ? activeClassDark : activeClass;
  const labelClass = isDark ? "text-neutral-400" : "text-slate-600";
  const idleClass = isDark
    ? "glass-dark-subtle text-neutral-400 hover:bg-white/10"
    : "glass-pill text-slate-500";

  return (
    <div>
      <p className={`mb-1 text-xs font-medium ${labelClass}`}>Type</p>
      <div className="flex gap-2">
        {(["good", "bad", "neutral"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
              value === t ? active[t] : idleClass
            }`}
          >
            {t === "good" ? "Bien" : t === "bad" ? "Mal" : "Neutre"}
          </button>
        ))}
      </div>
    </div>
  );
}
