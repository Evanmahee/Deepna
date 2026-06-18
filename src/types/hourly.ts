export type HourlyMood = 1 | 2 | 3;

export type HourlyCheckinRow = {
  id: string;
  user_id: string;
  /** Heure UTC 0–23 */
  slot_hour: number;
  note: string | null;
  mood: HourlyMood;
};

export function moodLabel(mood: number): string {
  const labels: Record<number, string> = {
    1: "Productif",
    2: "Neutre",
    3: "Perdu",
  };
  return labels[mood] ?? String(mood);
}

/** Libellé horaire à partir de `slot_hour` (0–23 UTC). */
export function formatHourlyCheckinWhen(row: HourlyCheckinRow): string {
  const h = String(row.slot_hour).padStart(2, "0");
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${today} · ${h}h00 (UTC)`;
}
