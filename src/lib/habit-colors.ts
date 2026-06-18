export type HabitColor = {
  id: string;
  hex: string;
  label: string;
};

/** Palette DA — neutres + accents discrets. */
export const HABIT_COLORS: HabitColor[] = [
  { id: "white", hex: "#FFFFFF", label: "Blanc" },
  { id: "silver", hex: "#A3A3A3", label: "Argent" },
  { id: "graphite", hex: "#525252", label: "Graphite" },
  { id: "black", hex: "#000000", label: "Noir" },
  { id: "sand", hex: "#C4A574", label: "Sable" },
  { id: "sage", hex: "#6B8F71", label: "Sauge" },
  { id: "slate", hex: "#6B7A8F", label: "Ardoise" },
  { id: "plum", hex: "#8B6B7A", label: "Prune" },
  { id: "clay", hex: "#8F6B6B", label: "Terre" },
  { id: "lavender", hex: "#7A6B8F", label: "Lavande" },
  { id: "sky", hex: "#5B8FA8", label: "Ciel" },
  { id: "mint", hex: "#5B8F7A", label: "Menthe" },
];

export const DEFAULT_HABIT_COLOR = HABIT_COLORS[0].hex;

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export function isValidHabitColor(value: string | null | undefined): value is string {
  return typeof value === "string" && HEX_RE.test(value);
}

export function normalizeHabitColor(value: string | null | undefined): string {
  if (isValidHabitColor(value)) {
    return value.toUpperCase();
  }
  return DEFAULT_HABIT_COLOR;
}

export function habitColorLabel(hex: string): string {
  return HABIT_COLORS.find((c) => c.hex.toUpperCase() === hex.toUpperCase())?.label ?? "Personnalisée";
}

/** Texte lisible sur fond de carte d'habitude. */
export function habitColorForeground(hex: string): string {
  const normalized = normalizeHabitColor(hex);
  if (normalized === "#FFFFFF" || normalized === "#A3A3A3") {
    return "#000000";
  }
  return "#FFFFFF";
}
