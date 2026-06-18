import type { IdentityPeriod } from "@/types/identity";

export const IDENTITY_REPS: Record<IdentityPeriod, number> = {
  morning: 3,
  afternoon: 6,
  evening: 9,
};

/** Période active selon l'heure UTC. */
export function activeIdentityPeriod(now = new Date()): IdentityPeriod {
  const h = now.getUTCHours();
  if (h >= 5 && h < 12) {
    return "morning";
  }
  if (h >= 12 && h < 18) {
    return "afternoon";
  }
  return "evening";
}

export function parseRepCount(reflection: string | null | undefined): number {
  if (!reflection?.trim()) {
    return 0;
  }
  const n = Number.parseInt(reflection.trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function totalRepsToday(
  counts: Partial<Record<IdentityPeriod, number>>,
): number {
  return (
    (counts.morning ?? 0) + (counts.afternoon ?? 0) + (counts.evening ?? 0)
  );
}
