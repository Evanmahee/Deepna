type StatsHeaderProps = {
  globalPct: number;
  bestStreakAllTime: number;
  activeHabits: number;
};

export function StatsHeader({
  globalPct,
  bestStreakAllTime,
  activeHabits,
}: StatsHeaderProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="glass rounded-xl p-4 text-center shadow-sm">
        <p className="text-xs uppercase text-neutral-500">Complétion 30j</p>
        <p className="mt-1 text-2xl font-bold text-white">{globalPct}%</p>
      </div>
      <div className="glass rounded-xl p-4 text-center shadow-sm">
        <p className="text-xs uppercase text-neutral-500">Meilleure série</p>
        <p className="mt-1 text-2xl font-bold text-white">
          {bestStreakAllTime} j
        </p>
        <p className="mt-0.5 text-[10px] text-neutral-500">tous temps</p>
      </div>
      <div className="glass rounded-xl p-4 text-center shadow-sm">
        <p className="text-xs uppercase text-neutral-500">Habitudes actives</p>
        <p className="mt-1 text-2xl font-bold text-white">{activeHabits}</p>
      </div>
    </div>
  );
}
