import type { ApplicationStatus } from "@/types";

export const STATUSES: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: "saved", label: "Saved", color: "#8a8a8f" },
  { id: "applied", label: "Applied", color: "#0071e3" },
  { id: "interviewing", label: "Interviewing", color: "#b45309" },
  { id: "offer", label: "Offer", color: "#7c3aed" },
  { id: "accepted", label: "Accepted", color: "#047857" },
  { id: "rejected", label: "Rejected", color: "#be123c" },
];

export function statusMeta(id: ApplicationStatus) {
  return STATUSES.find((s) => s.id === id) ?? STATUSES[0];
}
