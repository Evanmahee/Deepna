"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { addDaysUtc } from "@/lib/dates";
import type { DayCompletionStatus } from "@/lib/day-completion";

type DateStripProps = {
  selectedDate: string;
  completionByDay?: Record<string, DayCompletionStatus>;
};

const VISIBLE_DAYS = 7;
const CIRCLE_SIZE_PX = 36;
const PAST_DAYS = 42;
const FUTURE_DAYS = 14;

const DOT_CLASS: Record<DayCompletionStatus, string> = {
  full: "bg-emerald-400",
  partial: "bg-amber-400",
  none: "bg-neutral-600",
  empty: "bg-transparent",
};

function dayLabel(iso: string): string {
  const d = new Date(Date.parse(`${iso}T12:00:00.000Z`));
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    timeZone: "UTC",
  });
}

function dayNumber(iso: string): number {
  return new Date(Date.parse(`${iso}T12:00:00.000Z`)).getUTCDate();
}

export function DateStrip({
  selectedDate,
  completionByDay = {},
}: DateStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  const slots = useMemo(() => {
    const list: string[] = [];
    for (let i = -PAST_DAYS; i <= FUTURE_DAYS; i++) {
      list.push(addDaysUtc(selectedDate, i));
    }
    return list;
  }, [selectedDate]);

  useEffect(() => {
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;

    const scrollLeft =
      active.offsetLeft - (container.clientWidth - active.offsetWidth) / 2;
    container.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: "auto",
    });
  }, [selectedDate, slots]);

  return (
    <div className="w-full min-w-0">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex w-full touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-0 pt-2 pb-1.5"
      >
        {slots.map((iso) => {
          const label = dayLabel(iso);
          const num = dayNumber(iso);
          const active = iso === selectedDate;
          const status = completionByDay[iso] ?? "empty";

          return (
            <Link
              key={iso}
              ref={active ? activeRef : undefined}
              href={`/?date=${iso}`}
              scroll={false}
              className="relative shrink-0 snap-center px-0 transition-transform active:scale-95"
              style={{
                flex: `0 0 calc(100% / ${VISIBLE_DAYS})`,
                width: `calc(100% / ${VISIBLE_DAYS})`,
              }}
            >
              <div className="relative flex flex-col items-center gap-1.5 pb-2">
                {active ? (
                  <span
                    aria-hidden
                    className="glass-primary pointer-events-none absolute inset-x-0.5 -inset-y-0.5 rounded-2xl shadow-sm"
                  />
                ) : null}
                <span
                  className={[
                    "relative z-10 text-center text-[11px] font-medium leading-none",
                    active ? "text-black" : "text-neutral-500",
                  ].join(" ")}
                >
                  {label}
                </span>
                <span
                  className={[
                    "relative z-10 box-border flex shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold leading-none",
                    active
                      ? "border-black text-black"
                      : "border-neutral-600 text-neutral-400",
                  ].join(" ")}
                  style={{
                    width: `${CIRCLE_SIZE_PX}px`,
                    height: `${CIRCLE_SIZE_PX}px`,
                  }}
                >
                  <span
                    aria-hidden
                    className={[
                      "absolute left-1/2 top-0 h-[2px] w-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                      active ? "bg-black" : "bg-neutral-500",
                    ].join(" ")}
                  />
                  {num}
                </span>
                {status !== "empty" ? (
                  <span
                    aria-hidden
                    className={`relative z-10 h-1.5 w-1.5 rounded-full ${DOT_CLASS[status]}`}
                  />
                ) : (
                  <span className="h-1.5 w-1.5" aria-hidden />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
