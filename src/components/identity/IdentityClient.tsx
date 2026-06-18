"use client";

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
  /** Intégré dans une page plus large (ex. profil) — sans marge basse nav */
  embedded?: boolean;
};

function byPeriod(rows: IdentityCheckinRow[]) {
  const m: Partial<Record<IdentityPeriod, IdentityCheckinRow>> = {};
  for (const r of rows) {
    m[r.period] = r;
  }
  return m;
}

const PERIOD_LABEL: Record<IdentityPeriod, string> = {
  morning: "ce matin",
  afternoon: "cet apm",
  evening: "ce soir",
};

export function IdentityClient({
  initialStatement,
  checkins,
  embedded = false,
}: Props) {
  const [mantra, setMantra] = useState(initialStatement ?? "");
  const map = byPeriod(checkins);
  const active = activeIdentityPeriod();

  const counts: Partial<Record<IdentityPeriod, number>> = {};
  for (const { period } of PERIODS) {
    counts[period] = parseRepCount(map[period]?.reflection);
  }
  const dayTotal = totalRepsToday(counts);

  return (
    <div
      className={[
        "mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6",
        embedded ? "" : "pb-28",
      ].join(" ")}
    >
      <MantraDisplay value={mantra} onChange={setMantra} />

      <div className="glass rounded-xl px-4 py-3 text-sm text-neutral-300">
        <p>
          Aujourd&apos;hui :{" "}
          <span className="font-mono font-semibold text-white">{dayTotal}</span>{" "}
          / 18 répétitions
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Période active ({PERIOD_LABEL[active]}) :{" "}
          <span className="font-mono text-neutral-300">
            {counts[active] ?? 0}/{IDENTITY_REPS[active]}
          </span>
        </p>
      </div>

      {PERIODS.map(({ period, title }) => (
        <IdentitySection
          key={period}
          period={period}
          title={title}
          reps={IDENTITY_REPS[period]}
          checkin={map[period]}
          mantra={mantra}
        />
      ))}
    </div>
  );
}
