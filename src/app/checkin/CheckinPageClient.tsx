"use client";

import { useRouter } from "next/navigation";
import { CheckinForm } from "@/components/checkin/CheckinForm";
import { CheckinHistory } from "@/components/checkin/CheckinHistory";
import { formatElapsedSince } from "@/types/hourly";
import type { HourlyCheckinRow } from "@/types/hourly";

type CheckinPageClientProps = {
  rows: HourlyCheckinRow[];
};

function formatLastCheckinTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CheckinPageClient({ rows }: CheckinPageClientProps) {
  const router = useRouter();
  const last = rows[0];

  return (
    <>
      {last ? (
        <div className="glass rounded-xl px-4 py-3">
          <p className="text-sm text-neutral-300">
            Dernier check-in{" "}
            <span className="font-medium text-white">
              {formatElapsedSince(last.created_at)}
            </span>
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Enregistré à {formatLastCheckinTime(last.created_at)}
          </p>
        </div>
      ) : (
        <p className="glass rounded-xl px-4 py-3 text-sm text-neutral-400">
          Aucun check-in enregistré. Note ce que tu fais maintenant.
        </p>
      )}
      <CheckinForm onSuccess={() => router.refresh()} />
      <CheckinHistory rows={rows} />
    </>
  );
}
