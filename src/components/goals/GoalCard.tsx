"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GoalRow, GoalStatus, GoalTerm } from "@/types/goals";

const ORDER: GoalStatus[] = ["active", "completed", "abandoned"];

const LABELS: Record<GoalStatus, string> = {
  active: "En cours",
  completed: "Complété",
  abandoned: "Abandonné",
};

const STATUS_COLORS: Record<GoalStatus, string> = {
  active: "text-indigo-300",
  completed: "text-emerald-400",
  abandoned: "text-neutral-500",
};

type GoalCardProps = { goal: GoalRow };

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<GoalStatus>(goal.status);
  const [pending, setPending] = useState(false);

  async function cycle() {
    if (pending) return;
    const i = ORDER.indexOf(status);
    const next = ORDER[(i + 1) % ORDER.length];
    setPending(true);
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goal.id, status: next }),
      });
      if (!res.ok) {
        throw new Error("patch");
      }
      setStatus(next);
      router.refresh();
    } catch {
      setStatus(goal.status);
    } finally {
      setPending(false);
    }
  }

  const dateLabel = goal.target_date
    ? new Date(`${goal.target_date}T12:00:00Z`).toLocaleDateString("fr-FR")
    : "—";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => void cycle()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void cycle();
        }
      }}
      className="glass cursor-pointer rounded-xl p-3 shadow-sm transition-colors hover:bg-white/10 active:scale-[0.99] disabled:pointer-events-none"
      aria-label={`${goal.title} — ${LABELS[status]}. Cliquer pour changer le statut.`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white">{goal.title}</h3>
        <span
          className={`shrink-0 text-[10px] font-medium uppercase ${STATUS_COLORS[status]}`}
        >
          {LABELS[status]}
        </span>
      </div>
      {goal.description ? (
        <p className="mt-1 text-sm text-neutral-400">{goal.description}</p>
      ) : null}
      <p className="mt-2 text-xs text-neutral-500">Cible : {dateLabel}</p>
    </article>
  );
}
