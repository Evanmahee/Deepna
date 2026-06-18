/** Titre header « Aujourd'hui · Jeudi 18 juin » pour une date YYYY-MM-DD (UTC). */
export function formatTodayHeaderDate(isoDay: string): string {
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
  return `Aujourd'hui · ${cap} ${dayMonth}`;
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
    label: `${completed}/${total} habitudes · ${pct}%`,
  };
}
