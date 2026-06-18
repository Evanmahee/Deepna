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
      <div className="glass rounded-xl p-4 text-center shadow-sm">
        <p className="text-xs uppercase text-slate-500">Complétion 30j</p>
        <p className="mt-1 text-2xl font-bold text-neutral-900">{globalPct}%</p>
      </div>
      <div className="glass rounded-xl p-4 text-center shadow-sm">
        <p className="text-xs uppercase text-slate-500">Meilleure série</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{bestStreak} j</p>
      </div>
      <div className="glass rounded-xl p-4 text-center shadow-sm">
        <p className="text-xs uppercase text-slate-500">Complétés ce mois</p>
        <p className="mt-1 text-2xl font-bold text-neutral-900">{monthCompleted}</p>
      </div>
    </div>
  );
}
