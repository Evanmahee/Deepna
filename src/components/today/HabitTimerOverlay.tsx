"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, X } from "lucide-react";

const PRESETS = [5, 10, 15, 25, 30] as const;

type HabitTimerOverlayProps = {
  habitName: string;
  defaultMinutes?: number | null;
  onClose: () => void;
  onComplete: () => void;
};

export function HabitTimerOverlay({
  habitName,
  defaultMinutes,
  onComplete,
  onClose,
}: HabitTimerOverlayProps) {
  const [phase, setPhase] = useState<"pick" | "run">(
    defaultMinutes ? "run" : "pick",
  );
  const [totalSec, setTotalSec] = useState((defaultMinutes ?? 25) * 60);
  const [remaining, setRemaining] = useState((defaultMinutes ?? 25) * 60);
  const [running, setRunning] = useState(true);
  const [customMin, setCustomMin] = useState("");
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    onComplete();
    onClose();
  }, [onComplete, onClose]);

  useEffect(() => {
    if (phase !== "run" || !running || remaining <= 0) return;
    const t = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(t);
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, running, remaining, finish]);

  function startMinutes(m: number) {
    const sec = m * 60;
    setTotalSec(sec);
    setRemaining(sec);
    setRunning(true);
    setPhase("run");
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = totalSec > 0 ? ((totalSec - remaining) / totalSec) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[350] flex items-end justify-center bg-black/80 p-4 sm:items-center">
      <div className="glass-sheet-dark w-full max-w-sm rounded-2xl p-5">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-neutral-500">Timer</p>
            <p className="font-semibold text-white">{habitName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {phase === "pick" ? (
          <>
            <p className="mb-3 text-sm text-neutral-400">Durée</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => startMinutes(m)}
                  className="rounded-xl bg-white/10 py-3 text-sm font-medium text-white hover:bg-white/15"
                >
                  {m} min
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                min={1}
                max={180}
                placeholder="Custom (min)"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                disabled={!customMin || Number(customMin) < 1}
                onClick={() => startMinutes(Number(customMin))}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white disabled:opacity-40"
              >
                Go
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative mx-auto my-6 h-40 w-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold tabular-nums text-white">
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"
                aria-label={running ? "Pause" : "Reprendre"}
              >
                {running ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRemaining(totalSec);
                  setRunning(false);
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"
                aria-label="Reset"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
