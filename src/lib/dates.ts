/** Date locale (YYYY-MM-DD) en UTC pour alignement avec colonne `date` / `logged_on`. */
export function utcDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayUtcString(): string {
  return utcDateString(new Date());
}

/** Valide `YYYY-MM-DD` ; sinon retourne aujourd'hui UTC. */
export function parseLoggedOnParam(raw: string | undefined): string {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return todayUtcString();
  }
  const t = Date.parse(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(t)) {
    return todayUtcString();
  }
  return raw;
}

export function addDaysUtc(isoDay: string, delta: number): string {
  const t = Date.parse(`${isoDay}T12:00:00.000Z`);
  const d = new Date(t + delta * 86400000);
  return utcDateString(d);
}
