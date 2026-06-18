"use client";

import {
  habitColorForeground,
  normalizeHabitColor,
} from "@/lib/habit-colors";

type HabitCardPreviewProps = {
  emoji: string;
  name?: string;
  color: string;
  className?: string;
  completed?: boolean;
};

export function habitCardSurfaceStyle(color: string | null | undefined) {
  const bg = normalizeHabitColor(color);
  const fg = habitColorForeground(bg);
  const isLight = fg === "#000000";

  return {
    style: {
      backgroundColor: bg,
      color: fg,
      borderColor: isLight ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.14)",
    } as const,
    isLight,
    fg,
    bg,
  };
}

export function HabitCardPreview({
  emoji,
  name = "Nom de l'habitude",
  color,
  className = "",
  completed = false,
}: HabitCardPreviewProps) {
  const { style, isLight } = habitCardSurfaceStyle(color);

  return (
    <div
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 shadow-sm transition-opacity ${completed ? "opacity-75" : ""} ${className}`}
      style={style}
    >
      <span className="shrink-0 text-xl leading-none" aria-hidden>
        {emoji || "⭐"}
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</p>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
          completed
            ? isLight
              ? "border-black/80 bg-black/5"
              : "border-white/80 bg-white/10"
            : isLight
              ? "border-black/25"
              : "border-white/35"
        }`}
        aria-hidden
      >
        {completed ? (
          <span className="text-sm font-bold leading-none">✓</span>
        ) : null}
      </span>
    </div>
  );
}
