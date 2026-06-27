import type { Theme } from "@/types";

export function getThemeFromHour(hour: number): Theme {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 12) return "dawn";
  if (h >= 12 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

/* ── 12-hour helpers (kept for backwards-compat) ─────────────── */
export function getAngleFromHour(hour: number): number {
  return ((hour % 12) / 12) * 360;
}
export function getHourFromAngle(angle: number): number {
  return Math.round((angle / 360) * 12);
}

/* ── 24-hour helpers — used by the theme clock ───────────────────
   The dial represents a full 24h cycle (one revolution = 24h, 0°/12 o'clock
   = midnight). This makes every theme reachable by dragging, with no
   AM/PM ambiguity. */
export function getAngleFromHour24(hour: number): number {
  const h = ((hour % 24) + 24) % 24;
  return (h / 24) * 360;
}
export function getHourFromAngle24(angle: number): number {
  const a = ((angle % 360) + 360) % 360;
  return Math.round((a / 360) * 24) % 24;
}

/* Representative hour for each theme — where the hand lands when a theme
   is picked from the dropdown (centre of each theme's time window). */
export const themeRepresentativeHour: Record<Theme, number> = {
  dawn: 8,    // mid-morning
  day: 14,    // early afternoon
  dusk: 18,   // early evening
  night: 23,  // late night
};

export const themeLabels: Record<Theme, string> = {
  dawn: "Dawn",
  day: "Day",
  dusk: "Dusk",
  night: "Night",
};
