/** Convertit HH:MM ou un timestamp ISO en valeur `time` Postgres (HH:MM:SS). */
export function toScheduledTimeOnly(
  scheduledTime: string | null | undefined,
): string | null {
  if (!scheduledTime?.trim()) {
    return null;
  }
  const trimmed = scheduledTime.trim();
  const hhmm = /^(\d{2}):(\d{2})$/.exec(trimmed);
  if (hhmm) {
    const hour = Number(hhmm[1]);
    const minute = Number(hhmm[2]);
    if (hour > 23 || minute > 59) {
      return null;
    }
    return `${hhmm[1]}:${hhmm[2]}:00`;
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toTimeString().slice(0, 8);
}
