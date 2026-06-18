"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MantraDisplay } from "@/components/identity/MantraDisplay";
import { IdentitySection } from "@/components/identity/IdentitySection";
import {
  IDENTITY_REPS,
  activeIdentityPeriod,
  parseRepCount,
  totalRepsToday,
} from "@/lib/identity-reps";
import type { IdentityCheckinRow, IdentityPeriod } from "@/types/identity";

const PERIODS: { period: IdentityPeriod; title: string }[] = [
  { period: "morning", title: "Matin" },
  { period: "afternoon", title: "Après-midi" },
  { period: "evening", title: "Soir" },
];

type Props = {
  initialStatement: string | null;
  checkins: IdentityCheckinRow[];
  embedded?: boolean;
};

function byPeriod(rows: IdentityCheckinRow[]) {
  const m: Partial<Record<IdentityPeriod, IdentityCheckinRow>> = {};
  for (const r of rows) {
    m[r.period] = r;
  }
  return m;
}

export function IdentityClient({
  initialStatement,
  checkins,
  embedded = false,
}: Props) {
  const router = useRouter();
  const [mantra, setMantra] = useState(initialStatement ?? "");
  const [mantraError, setMantraError] = useState<string | null>(null);
  const map = byPeriod(checkins);
  const active = activeIdentityPeriod();

  const counts: Partial<Record<IdentityPeriod, number>> = {};
  for (const { period } of PERIODS) {
    counts[period] = parseRepCount(map[period]?.reflection);
  }
  const dayTotal = totalRepsToday(counts);

  async function saveMantra(next: string) {
    const previous = mantra;
    setMantra(next);
    setMantraError(null);
    try {
      const res = await fetch("/api/identity/statement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity_statement: next.trim() || null,
        }),
        credentials: "same-origin",
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Sauvegarde impossible");
      }
      router.refresh();
    } catch (e) {
      setMantra(previous);
      setMantraError(
        e instanceof Error ? e.message : "Impossible de sauvegarder le mantra",
      );
    }
  }

  return (
    <div
      className={[
        "mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-6",
        embedded ? "" : "pb-28",
      ].join(" ")}
    >
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Mon mantra
        </h2>
        <MantraDisplay value={mantra} onChange={(v) => void saveMantra(v)} />
        {mantraError ? (
          <p className="mt-2 text-xs text-red-400" role="alert">
            {mantraError}
          </p>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Check-ins identité
          </h2>
          <span className="text-xs text-neutral-500">
            {dayTotal}/18 aujourd&apos;hui
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {PERIODS.map(({ period, title }) => (
            <IdentitySection
              key={period}
              period={period}
              title={title}
              reps={IDENTITY_REPS[period]}
              mantra={mantra}
              isActive={period === active}
              currentCount={counts[period] ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
