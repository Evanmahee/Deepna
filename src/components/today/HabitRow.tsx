"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { EditHabitModal } from "@/components/today/EditHabitModal";
import { HabitActionSheet } from "@/components/today/HabitActionSheet";
import { HabitInspectModal } from "@/components/today/HabitInspectModal";
import { useLongPress } from "@/lib/use-long-press";
import type { HabitRowData } from "@/types/today";

type HabitRowProps = {
  habit: HabitRowData;
  logDate: string;
  completedToday: boolean;
  onCompletedChange?: (completed: boolean) => void;
};

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
  onCompletedChange,
}: HabitRowProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(completedToday);
  const [pending, setPending] = useState(false);
  const [sweep, setSweep] = useState<"in" | "out" | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  function triggerSweep(mode: "in" | "out") {
    setSweep(null);
    requestAnimationFrame(() => setSweep(mode));
  }

  const openSheet = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const { longPressProps, didLongPress, resetLongPress } = useLongPress({
    onLongPress: openSheet,
  });

  const toggle = useCallback(async () => {
    const prevC = completed;
    const nextC = !prevC;
    if (nextC && !prevC) {
      triggerSweep("in");
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
      router.refresh();
    } catch {
      setCompleted(prevC);
      onCompletedChange?.(prevC);
      setSweep(null);
    } finally {
      setPending(false);
    }
  }, [completed, habit.id, logDate, onCompletedChange, router]);

  async function archiveHabit() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Archivage impossible");
      }
      router.refresh();
    } catch {
      /* silencieux */
    } finally {
      setDeleting(false);
    }
  }

  async function duplicateHabit() {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${habit.name} (copie)`,
        icon_emoji: habit.icon_emoji,
        icon_color: habit.icon_color,
        habit_type: habit.habit_type,
        description: habit.description,
        time_block_id: habit.time_block_id,
      }),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(j.error ?? "Duplication impossible");
    }
    router.refresh();
  }

  async function resetHistory() {
    const res = await fetch(`/api/habits/${habit.id}/history`, {
      method: "DELETE",
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(j.error ?? "Réinitialisation impossible");
    }
    setCompleted(false);
    router.refresh();
  }

  async function setLogAction(action: "complete" | "fail" | "skip") {
    if (action === "complete" && !completed) {
      triggerSweep("in");
    } else if ((action === "fail" || action === "skip") && completed) {
      triggerSweep("out");
    }
    const json = await logAction(habit.id, logDate, action);
    if (action === "skip") {
      setCompleted(false);
    } else if (typeof json.completed === "boolean") {
      setCompleted(json.completed);
    }
    router.refresh();
  }

  return (
    <>
      <div
        {...longPressProps}
        className={`relative flex select-none items-center gap-2 overflow-hidden rounded-xl border px-2 py-2.5 shadow-sm transition-colors duration-300 active:scale-[0.99] sm:gap-3 sm:px-3 ${
          completed
            ? "border-black/10 bg-white text-black"
            : "glass-habit text-white"
        } ${deleting ? "pointer-events-none opacity-40" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${habit.name}. Appui court pour cocher. Appui long pour les options.`}
        onClick={() => {
          if (didLongPress()) {
            resetLongPress();
            return;
          }
          if (pending || deleting) {
            return;
          }
          void toggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!pending && !deleting) {
              void toggle();
            }
          }
        }}
      >
        {sweep ? (
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-[1] bg-white ${
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
            completed ? "border-black text-white" : "border-white/35 text-white"
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
                stroke="#000000"
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
          <span className="relative z-10 flex items-center justify-center">
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

      <HabitActionSheet
        habit={sheetOpen ? habit : null}
        logDate={logDate}
        completed={completed}
        onClose={() => setSheetOpen(false)}
        onComplete={() => setLogAction("complete")}
        onFail={() => setLogAction("fail")}
        onSkip={() => setLogAction("skip")}
        onEdit={() => setEditing(true)}
        onAddNote={() => setEditing(true)}
        onInspect={() => setInspecting(true)}
        onDuplicate={() => duplicateHabit()}
        onResetHistory={() => resetHistory()}
        onArchive={() => archiveHabit()}
        onDelete={() => archiveHabit()}
      />

      <EditHabitModal
        habit={editing ? habit : null}
        onClose={() => setEditing(false)}
      />
      <HabitInspectModal
        habit={inspecting ? habit : null}
        onClose={() => setInspecting(false)}
      />
    </>
  );
}
