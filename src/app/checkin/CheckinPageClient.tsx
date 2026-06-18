"use client";

import { useRouter } from "next/navigation";
import { CheckinForm } from "@/components/checkin/CheckinForm";
import { CheckinHistory } from "@/components/checkin/CheckinHistory";
import { formatElapsedSince } from "@/types/hourly";
import type { HourlyCheckinRow } from "@/types/hourly";

type CheckinPageClientProps = {
  rows: HourlyCheckinRow[];
};

export function CheckinPageClient({ rows }: CheckinPageClientProps) {
  const router = useRouter();
  const last = rows[0];

  return (
    <>
      {last ? (
        <p className="glass rounded-xl px-4 py-3 text-sm text-neutral-300">
          Dernier check-in {formatElapsedSince(last.created_at)} — tu n&apos;as
          rien noté depuis ?
        </p>
      ) : (
        <p className="glass rounded-xl px-4 py-3 text-sm text-neutral-400">
          Aucun check-in aujourd&apos;hui. Note ce que tu fais maintenant.
        </p>
      )}
      <CheckinForm onSuccess={() => router.refresh()} />
      <CheckinHistory rows={rows} />
    </>
  );
}
