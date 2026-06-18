"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { EditHabitModal } from "@/components/today/EditHabitModal";
import { HabitInspectModal } from "@/components/today/HabitInspectModal";
import { habitCardSurfaceStyle } from "@/components/today/HabitCardPreview";
import type { HabitRowData } from "@/types/today";

type HabitRowProps = {
  habit: HabitRowData;
  logDate: string;
  completedToday: boolean;
};

export function HabitRow({
  habit,
  logDate,
  completedToday,
}: HabitRowProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(completedToday);
  const [missed, setMissed] = useState(habit.missed_days_count);
  const [pending, setPending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setCompleted(completedToday);
    setMissed(habit.missed_days_count);
  }, [completedToday, habit.missed_days_count, habit.id, logDate]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const toggle = useCallback(async () => {
    const prevC = completed;
    const prevM = missed;
    const nextC = !prevC;
    setCompleted(nextC);
    setMissed(nextC ? Math.max(0, prevM - 1) : prevM + 1);
    setPending(true);
    try {
      const res = await fetch("/api/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: habit.id, loggedOn: logDate }),
      });
      const json = (await res.json()) as {
        completed?: boolean;
        missed_days_count?: number;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Erreur");
      }
      if (typeof json.completed === "boolean") {
        setCompleted(json.completed);
      }
      if (typeof json.missed_days_count === "number") {
        setMissed(json.missed_days_count);
      }
    } catch {
      setCompleted(prevC);
      setMissed(prevM);
    } finally {
      setPending(false);
    }
  }, [completed, habit.id, logDate, missed]);

  async function archive() {
    setMenuOpen(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Suppression impossible");
      }
      router.refresh();
    } catch {
      /* silencieux */
    } finally {
      setDeleting(false);
    }
  }

  const showMissedBadge = missed > 0 && !completed;
  const { style, isLight } = habitCardSurfaceStyle(habit.icon_color);
  const mutedControl = isLight
    ? "text-black/45 hover:bg-black/10 hover:text-black/80"
    : "text-white/50 hover:bg-white/15 hover:text-white/90";
  const checkIdle = isLight ? "border-black/25 hover:border-black/60" : "border-white/35 hover:border-white/70";
  const checkDone = isLight
    ? "border-black/80 bg-black/5"
    : "border-white/80 bg-white/10";

  return (
    <>
      <div
        className={`relative flex items-center gap-2 rounded-xl border px-2 py-2.5 shadow-sm transition-opacity duration-200 sm:gap-3 sm:px-3 ${
          completed ? "opacity-75" : "opacity-100"
        }`}
        style={style}
      >
        <span className="shrink-0 text-lg sm:text-xl" aria-hidden>
          {habit.icon_emoji || "•"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold sm:text-base">{habit.name}</p>
        </div>
        {showMissedBadge ? (
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:text-xs ${
              isLight
                ? "bg-black/10 text-black/80 ring-1 ring-black/15"
                : "bg-white/15 text-white ring-1 ring-white/20"
            }`}
          >
            -{missed}
          </span>
        ) : null}
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            disabled={deleting}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Options habitude"
            aria-expanded={menuOpen}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-50 ${mutedControl}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="glass-strong absolute right-0 top-full z-20 mt-1 min-w-[9rem] overflow-hidden rounded-xl py-1 shadow-lg shadow-slate-900/10">
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-white/40"
                onClick={() => {
                  setMenuOpen(false);
                  setInspecting(true);
                }}
              >
                Inspecter
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-white/40"
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
              >
                Modifier
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-white/40"
                onClick={() => void archive()}
              >
                Supprimer
              </button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => void toggle()}
          aria-pressed={completed}
          aria-label={completed ? "Marquer non fait" : "Marquer fait"}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition disabled:opacity-50 sm:h-9 sm:w-9 ${
            completed ? checkDone : checkIdle
          }`}
        >
          {completed ? (
            <span className="text-sm font-bold leading-none sm:text-base" aria-hidden>
              ✓
            </span>
          ) : null}
        </button>
      </div>
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
