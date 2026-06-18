type ProgressRingProps = {
  completed: number;
  total: number;
  size?: number;
  className?: string;
};

export function ProgressRing({
  completed,
  total,
  size = 36,
  className = "",
}: ProgressRingProps) {
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, completed / total) : 0;
  const offset = circ * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`-rotate-90 ${className}`}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="white"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}
