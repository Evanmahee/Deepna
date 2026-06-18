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

function ringClass(status: DayCompletionStatus): string {
  if (status === "full") return "ring-2 ring-[#6366f1]";
  if (status === "partial") return "ring-2 ring-orange-500";
  return "ring-2 ring-transparent";
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
    activeRef.current?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center",
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
                <span
                  className={[
                    "relative z-10 text-center text-[11px] font-medium leading-none",
                    active ? "text-white" : "text-neutral-500",
                  ].join(" ")}
                >
                  {label}
                </span>
                <span
                  className={[
                    "relative z-10 box-border flex shrink-0 items-center justify-center rounded-full text-xs font-semibold leading-none transition-colors",
                    active
                      ? "bg-[#6366f1] text-white"
                      : [
                          "border-neutral-600 text-neutral-400",
                          ringClass(status),
                        ].join(" "),
                  ].join(" ")}
                  style={{
                    width: `${CIRCLE_SIZE_PX}px`,
                    height: `${CIRCLE_SIZE_PX}px`,
                  }}
                >
                  {num}
                </span>
                {!active && status === "none" ? (
                  <span
                    aria-hidden
                    className="relative z-10 h-1.5 w-1.5 rounded-full bg-neutral-600"
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
