"use client";

import { useState } from "react";
import { MantraDisplay } from "@/components/identity/MantraDisplay";
import { IdentitySection } from "@/components/identity/IdentitySection";
import type { IdentityCheckinRow, IdentityPeriod } from "@/types/identity";

const PERIODS: { period: IdentityPeriod; title: string; reps: number }[] = [
  { period: "morning", title: "Matin", reps: 3 },
  { period: "afternoon", title: "Après-midi", reps: 6 },
  { period: "evening", title: "Soir", reps: 9 },
];

type Props = {
  initialStatement: string | null;
  checkins: IdentityCheckinRow[];
};

function byPeriod(rows: IdentityCheckinRow[]) {
  const m: Partial<Record<IdentityPeriod, IdentityCheckinRow>> = {};
  for (const r of rows) {
    m[r.period] = r;
  }
  return m;
}

export function IdentityClient({ initialStatement, checkins }: Props) {
  const [mantra, setMantra] = useState(initialStatement ?? "");
  const map = byPeriod(checkins);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6 pb-28">
      <MantraDisplay value={mantra} onChange={setMantra} />
      {PERIODS.map(({ period, title, reps }) => (
        <IdentitySection
          key={period}
          period={period}
          title={title}
          reps={reps}
          done={Boolean(map[period]?.checked_at)}
          mantra={mantra}
        />
      ))}
    </div>
  );
}
