import type { GoalRow, GoalTerm } from "@/types/goals";
import { GoalCard } from "@/components/goals/GoalCard";

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
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <h2 className="border-b border-slate-200 pb-2 text-sm font-semibold uppercase tracking-wide text-neutral-900">
        {TITLES[term]}
      </h2>
      <div className="flex flex-col gap-3">
        {goals.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun objectif</p>
        ) : (
          goals.map((g) => <GoalCard key={g.id} goal={g} />)
        )}
      </div>
    </div>
  );
}
