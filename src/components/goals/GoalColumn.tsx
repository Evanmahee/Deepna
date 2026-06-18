"use client";

import { useState } from "react";
import type { GoalRow, GoalTerm } from "@/types/goals";
import { GoalCard } from "@/components/goals/GoalCard";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";

const TITLES: Record<GoalTerm, string> = {
  short: "Court terme",
  mid: "Moyen terme",
  long: "Long terme",
};

type GoalColumnProps = {
  term: GoalTerm;
  goals: GoalRow[];
};

export function GoalColumn({ term, goals }: GoalColumnProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
          <h2 className="text-sm font-semibold text-white">{TITLES[term]}</h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg font-light text-white transition-colors hover:bg-white/20"
            aria-label={`Ajouter un objectif ${TITLES[term].toLowerCase()}`}
          >
            +
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {goals.length === 0 ? (
            <p className="text-xs text-neutral-500">Aucun objectif</p>
          ) : (
            goals.map((g) => <GoalCard key={g.id} goal={g} />)
          )}
        </div>
      </div>
      <CreateGoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTerm={term}
      />
    </>
  );
}
