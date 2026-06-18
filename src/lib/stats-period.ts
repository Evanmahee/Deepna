import { addDaysUtc, todayUtcString } from "@/lib/dates";

export type StatsPeriod = "7" | "30" | "90" | "all";

export const PERIOD_OPTIONS: { id: StatsPeriod; label: string }[] = [
  { id: "7", label: "7j" },
  { id: "30", label: "30j" },
  { id: "90", label: "90j" },
  { id: "all", label: "Tout" },
];

export function periodLabel(period: StatsPeriod): string {
  switch (period) {
    case "7":
      return "7 derniers jours";
    case "30":
      return "30 derniers jours";
    case "90":
      return "90 derniers jours";
    case "all":
      return "tous les temps";
  }
}

export function periodBounds(
  period: StatsPeriod,
  today = todayUtcString(),
  earliestLogDay?: string | null,
): { fromDay: string; toDay: string } {
  const toDay = today;
  if (period === "all") {
    return { fromDay: earliestLogDay ?? toDay, toDay };
  }
  const days = period === "7" ? 6 : period === "30" ? 29 : 89;
  return { fromDay: addDaysUtc(toDay, -days), toDay };
}
