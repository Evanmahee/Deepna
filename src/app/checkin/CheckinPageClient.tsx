"use client";

import { useRouter } from "next/navigation";
import { CheckinForm } from "@/components/checkin/CheckinForm";
import { CheckinHistory } from "@/components/checkin/CheckinHistory";
import type { HourlyCheckinRow } from "@/types/hourly";

type CheckinPageClientProps = {
  rows: HourlyCheckinRow[];
};

export function CheckinPageClient({ rows }: CheckinPageClientProps) {
  const router = useRouter();

  return (
    <>
      <CheckinForm onSuccess={() => router.refresh()} />
      <CheckinHistory rows={rows} />
    </>
  );
}
