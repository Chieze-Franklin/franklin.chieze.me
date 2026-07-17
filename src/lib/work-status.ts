import type { WorkStatus } from "@/types";

/** Ordered list of work statuses with display labels and badge colors. */
export const WORK_STATUSES: { value: WorkStatus; label: string; color: string }[] = [
  { value: "in_progress", label: "In progress", color: "#0071e3" },
  { value: "completed", label: "Completed", color: "#047857" },
  { value: "paused", label: "Paused", color: "#b45309" },
  { value: "cancelled", label: "Cancelled", color: "#be123c" },
];

export const WORK_STATUS_VALUES: WorkStatus[] = WORK_STATUSES.map((s) => s.value);

export function workStatusMeta(status?: WorkStatus) {
  return WORK_STATUSES.find((s) => s.value === status) ?? WORK_STATUSES[0];
}
