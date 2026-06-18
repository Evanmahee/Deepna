type StatsMetricsRowProps = {
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
};

export function StatsMetricsRow({
  currentStreak,
  bestStreak,
  totalCompleted,
}: StatsMetricsRowProps) {
  const items = [
    { label: "Série en cours", value: `${currentStreak} j` },
    { label: "Meilleure série", value: `${bestStreak} j` },
    { label: "Total complété", value: String(totalCompleted) },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="glass rounded-xl p-3 text-center shadow-sm"
        >
          <p className="text-[10px] uppercase tracking-wide text-neutral-500">
            {item.label}
          </p>
          <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
