/** Sous-titre header : « Jeudi 18 juin · 3/7 · 43% » */
export function formatTodaySubtitle(
  isoDay: string,
  completed: number,
  total: number,
  pct: number,
): string {
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  const weekday = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    timeZone: "UTC",
  });
  const dayMonth = d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  if (total === 0) {
    return `${cap} ${dayMonth}`;
  }
  return `${cap} ${dayMonth} · ${completed}/${total} · ${pct}%`;
}

export function dayCompletionStats(
  total: number,
  completed: number,
): { pct: number; label: string } {
  if (total === 0) {
    return { pct: 0, label: "0 habitude" };
  }
  const pct = Math.round((completed / total) * 100);
  return {
    pct,
    label: `${completed}/${total} · ${pct}%`,
  };
}
