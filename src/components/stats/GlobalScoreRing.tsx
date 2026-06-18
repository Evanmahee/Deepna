type GlobalScoreRingProps = {
  pct: number;
  subtitle: string;
};

export function GlobalScoreRing({ pct, subtitle }: GlobalScoreRingProps) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="glass flex flex-col items-center rounded-2xl px-6 py-8 shadow-sm">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#6366f1"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{pct}%</span>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-neutral-400">
        Taux de complétion · {subtitle}
      </p>
    </div>
  );
}
