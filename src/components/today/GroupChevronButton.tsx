"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const RING_R = 13.5;
const RING_C = 2 * Math.PI * RING_R;

type GroupChevronButtonProps = {
  completed: number;
  total: number;
};

export function GroupChevronButton({ completed, total }: GroupChevronButtonProps) {
  const pct = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
  const offset = RING_C * (1 - pct / 100);
  const prevPct = useRef(pct);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (prevPct.current !== pct) {
      setAnimate(true);
      prevPct.current = pct;
    }
  }, [pct]);

  return (
    <div className="relative z-20 flex h-8 w-8 shrink-0 items-center justify-center">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 32 32"
        aria-hidden
      >
        <circle cx="16" cy="16" r="12" fill="#2c2c2e" />
        <circle
          cx="16"
          cy="16"
          r={RING_R}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={2}
        />
        <circle
          cx="16"
          cy="16"
          r={RING_R}
          fill="none"
          stroke="#ffffff"
          strokeWidth={2}
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 16 16)"
          style={{
            transition: animate
              ? "stroke-dashoffset 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
              : undefined,
          }}
        />
      </svg>
      <ChevronDown
        className="relative z-10 h-4 w-4 shrink-0 text-white/90 transition-transform duration-200 group-open:rotate-180"
        strokeWidth={2.5}
        aria-hidden
      />
    </div>
  );
}
