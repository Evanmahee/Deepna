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

const TERM_LABELS: Record<GoalTerm, string> = {
  short: "Court terme",
  mid: "Moyen terme",
  long: "Long terme",
};

type GoalCardProps = { goal: GoalRow };

export function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<GoalStatus>(goal.status);
  const [pending, setPending] = useState(false);

  async function cycle() {
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
    <article className="rounded-lg border border-[#333] bg-[#111] p-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white">{goal.title}</h3>
        {goal.term ? (
          <span className="shrink-0 rounded-full bg-[#6366f1]/15 px-2 py-0.5 text-[10px] font-medium text-[#a5b4fc]">
            {TERM_LABELS[goal.term] ?? goal.term}
          </span>
        ) : null}
      </div>
      {goal.description ? (
        <p className="mt-1 text-sm text-zinc-400">{goal.description}</p>
      ) : null}
      <p className="mt-2 text-xs text-zinc-500">Cible : {dateLabel}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => void cycle()}
        className="mt-3 rounded-full border border-[#6366f1]/50 bg-[#6366f1]/15 px-3 py-1 text-xs font-medium text-[#a5b4fc] hover:bg-[#6366f1]/25 disabled:opacity-50"
      >
        {LABELS[status]}
      </button>
    </article>
  );
}
