type StatsHeaderProps = {
  globalPct: number;
  bestStreak: number;
  monthCompleted: number;
};

export function StatsHeader({
  globalPct,
  bestStreak,
  monthCompleted,
}: StatsHeaderProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-[#333] bg-[#111] p-4 text-center">
        <p className="text-xs uppercase text-zinc-500">Complétion 30j</p>
        <p className="mt-1 text-2xl font-bold text-[#6366f1]">{globalPct}%</p>
      </div>
      <div className="rounded-xl border border-[#333] bg-[#111] p-4 text-center">
        <p className="text-xs uppercase text-zinc-500">Meilleure série</p>
        <p className="mt-1 text-2xl font-bold text-white">{bestStreak} j</p>
      </div>
      <div className="rounded-xl border border-[#333] bg-[#111] p-4 text-center">
        <p className="text-xs uppercase text-zinc-500">Complétés ce mois</p>
        <p className="mt-1 text-2xl font-bold text-emerald-400">{monthCompleted}</p>
      </div>
    </div>
  );
}
