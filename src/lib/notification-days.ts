export const NOTIFICATION_DAYS = [
  { id: "mon", label: "L" },
  { id: "tue", label: "Ma" },
  { id: "wed", label: "Me" },
  { id: "thu", label: "J" },
  { id: "fri", label: "V" },
  { id: "sat", label: "S" },
  { id: "sun", label: "D" },
] as const;

export type NotificationDayId = (typeof NOTIFICATION_DAYS)[number]["id"];

export const ALL_NOTIFICATION_DAYS: NotificationDayId[] = NOTIFICATION_DAYS.map(
  (d) => d.id,
);

export function normalizeNotificationDays(days: string[] | undefined): NotificationDayId[] {
  const valid = new Set(ALL_NOTIFICATION_DAYS);
  const out = (days ?? []).filter((d): d is NotificationDayId =>
    valid.has(d as NotificationDayId),
  );
  return out.length > 0 ? out : [...ALL_NOTIFICATION_DAYS];
}
