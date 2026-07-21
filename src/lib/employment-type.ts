import type { EmploymentType } from "@/types";

/** Selectable employment types for a job role (order shown in the picker). */
export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "permanent", label: "Permanent" },
  { value: "self-employed", label: "Self-employed" },
  { value: "freelance", label: "Freelance" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "apprenticeship", label: "Apprenticeship" },
];

export const EMPLOYMENT_TYPE_VALUES: EmploymentType[] = EMPLOYMENT_TYPES.map((t) => t.value);

export const employmentTypeLabel = (v?: string): string =>
  EMPLOYMENT_TYPES.find((t) => t.value === v)?.label ?? "";
