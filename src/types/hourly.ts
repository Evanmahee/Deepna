export type HourlyMood = 1 | 2 | 3;

export type HourlyCheckinRow = {
  id: string;
  user_id: string;
  /** Heure UTC 0–23 */
  slot_hour: number;
  note: string | null;
  mood: HourlyMood;
  created_at: string;
};

export function moodEmoji(mood: number): string {
  const emojis: Record<number, string> = {
    1: "😔",
    2: "😐",
    3: "😊",
  };
  return emojis[mood] ?? "😐";
}

export function moodLabel(mood: number): string {
  const labels: Record<number, string> = {
    1: "Productif",
    2: "Neutre",
    3: "Perdu",
  };
  return labels[mood] ?? String(mood);
}

/** Libellé horaire à partir de `created_at` ou `slot_hour`. */
export function formatHourlyCheckinWhen(row: HourlyCheckinRow): string {
  const when = new Date(row.created_at);
  const date = when.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = when.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

export function formatElapsedSince(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, now.getTime() - then);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) {
    return "à l'instant";
  }
  if (mins < 60) {
    return `il y a ${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `il y a ${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}
