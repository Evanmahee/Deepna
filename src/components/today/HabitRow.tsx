"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Timer } from "lucide-react";
import { EditHabitModal } from "@/components/today/EditHabitModal";
import { HabitContextMenu } from "@/components/today/HabitContextMenu";
import { HabitTimerOverlay } from "@/components/today/HabitTimerOverlay";
import { useToast } from "@/components/ui/ToastProvider";
import { useLongPress } from "@/lib/use-long-press";
import type { HabitRowData } from "@/types/today";

type HabitRowProps = {
  habit: HabitRowData;
  logDate: string;
  completedToday: boolean;
  dimmed?: boolean;
  onCompletedChange?: (completed: boolean) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
};

const SWIPE_THRESHOLD = 72;

async function logAction(
  habitId: string,
  loggedOn: string,
  action: "toggle" | "complete" | "fail" | "skip",
) {
  const res = await fetch("/api/habits/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habitId, loggedOn, action }),
  });
  const json = (await res.json()) as {
    completed?: boolean;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(json.error ?? "Erreur");
  }
  return json;
}

export function HabitRow({
  habit,
  logDate,
  completedToday,
  dimmed = false,
  onCompletedChange,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver = false,
}: HabitRowProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [completed, setCompleted] = useState(completedToday);
  const [pending, setPending] = useState(false);
  const [sweep, setSweep] = useState<"in" | "out" | null>(null);
  const [checkPop, setCheckPop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    setCompleted(completedToday);
  }, [completedToday, habit.id, logDate]);

  useEffect(() => {
    if (!sweep) {
      return;
    }
    const t = window.setTimeout(() => setSweep(null), 520);
    return () => window.clearTimeout(t);
  }, [sweep]);

  useEffect(() => {
    if (!checkPop) return;
    const t = window.setTimeout(() => setCheckPop(false), 200);
    return () => window.clearTimeout(t);
  }, [checkPop]);

  function triggerSweep(mode: "in" | "out") {
    setSweep(null);
    requestAnimationFrame(() => setSweep(mode));
  }

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const { longPressProps, didLongPress, resetLongPress } = useLongPress({
    onLongPress: openMenu,
  });

  const toggle = useCallback(async () => {
    const prevC = completed;
    const nextC = !prevC;
    if (nextC && !prevC) {
      triggerSweep("in");
      setCheckPop(true);
    } else if (!nextC && prevC) {
      triggerSweep("out");
    }
    setCompleted(nextC);
    onCompletedChange?.(nextC);
    setPending(true);
    try {
      const json = await logAction(habit.id, logDate, "toggle");
      if (typeof json.completed === "boolean") {
        setCompleted(json.completed);
        onCompletedChange?.(json.completed);
      }
      showToast(nextC ? "Habitude cochée ✓" : "Habitude décochée");
      router.refresh();
    } catch {
      setCompleted(prevC);
      onCompletedChange?.(prevC);
      setSweep(null);
    } finally {
      setPending(false);
    }
  }, [completed, habit.id, logDate, onCompletedChange, router, showToast]);

  async function archiveHabit() {
    setBusy(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Archivage impossible");
      }
      showToast("Habitude archivée");
      router.refresh();
    } catch {
      /* silencieux */
    } finally {
      setBusy(false);
    }
  }

  async function deleteHabit() {
    setBusy(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Suppression impossible");
      }
      showToast("Habitude supprimée");
      router.refresh();
    } catch {
      /* silencieux */
    } finally {
      setBusy(false);
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
    longPressProps.onTouchStart?.(e);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const endX = e.changedTouches[0]?.clientX ?? 0;
    const deltaX = endX - touchStartX.current;
    if (deltaX < -SWIPE_THRESHOLD && !didLongPress()) {
      openMenu();
    }
    longPressProps.onTouchEnd?.(e);
  }

  return (
    <>
      <div
        {...longPressProps}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative flex select-none items-center gap-2 overflow-hidden border px-4 py-3 shadow-sm transition-all duration-300 active:scale-[0.99] sm:gap-3 ${
          completed ? "glass-habit-done text-white/50" : "glass-habit text-white"
        } ${dimmed ? "opacity-55 saturate-[0.4]" : ""} ${busy ? "pointer-events-none opacity-40" : ""} ${isDragOver ? "ring-2 ring-indigo-400" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${habit.name}. Appui court pour cocher. Appui long ou glisser à gauche pour les options.`}
        onClick={() => {
          if (didLongPress()) {
            resetLongPress();
            return;
          }
          if (pending || busy) {
            return;
          }
          void toggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!pending && !busy) {
              void toggle();
            }
          }
        }}
      >
        {sweep ? (
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-[1] bg-indigo-500/30 ${
              sweep === "in" ? "habit-complete-sweep" : "habit-uncheck-sweep"
            }`}
          />
        ) : null}
        <span className="relative z-10 shrink-0 text-lg sm:text-xl" aria-hidden>
          {habit.icon_emoji || "•"}
        </span>
        <div className="relative z-10 min-w-0 flex-1">
          <p className="truncate text-sm font-semibold sm:text-base">{habit.name}</p>
        </div>
        {habit.duration_minutes != null ? (
          <button
            type="button"
            data-no-long-press
            onClick={(e) => {
              e.stopPropagation();
              setTimerOpen(true);
            }}
            className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
            aria-label="Lancer le timer"
          >
            <Timer className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
        <button
          type="button"
          data-no-long-press
          disabled={pending}
          onClick={(e) => {
            e.stopPropagation();
            if (didLongPress()) {
              e.preventDefault();
              resetLongPress();
              return;
            }
            void toggle();
          }}
          aria-pressed={completed}
          aria-label={completed ? "Marquer non fait" : "Marquer fait"}
          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-[border-color] duration-300 disabled:opacity-50 sm:h-9 sm:w-9 ${
            completed
              ? "border-indigo-400/60 text-indigo-300"
              : "border-white/35 text-white"
          }`}
        >
          {(completed || sweep === "in" || sweep === "out") && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 36 36"
              aria-hidden
            >
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#6366f1"
                strokeWidth="28"
                strokeDasharray="88"
                strokeLinecap="butt"
                className={
                  sweep === "in"
                    ? "habit-check-stroke-in"
                    : sweep === "out"
                      ? "habit-check-stroke-out"
                      : ""
                }
                style={completed && !sweep ? { strokeDashoffset: 0 } : undefined}
              />
            </svg>
          )}
          <span className={`relative z-10 flex items-center justify-center ${checkPop ? "habit-check-pop" : ""}`}>
            {completed ? (
              <Check
                className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                strokeWidth={3}
                aria-hidden
              />
            ) : (
              <Plus
                className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                strokeWidth={2.5}
                aria-hidden
              />
            )}
          </span>
        </button>
      </div>

      <HabitContextMenu
        habit={menuOpen ? habit : null}
        onClose={() => setMenuOpen(false)}
        onEdit={() => setEditing(true)}
        onArchive={() => archiveHabit()}
        onDelete={() => deleteHabit()}
      />

      <EditHabitModal
        habit={editing ? habit : null}
        onClose={() => setEditing(false)}
      />

      {timerOpen ? (
        <HabitTimerOverlay
          habitName={habit.name}
          defaultMinutes={habit.duration_minutes}
          onClose={() => setTimerOpen(false)}
          onComplete={() => {
            if (!completed && !pending) void toggle();
          }}
        />
      ) : null}
    </>
  );
}
