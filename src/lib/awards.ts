import { mockAwards } from "@/lib/mock-data";
import type { Award, RelatedRefType } from "@/types";

/** Awards/certifications associated with a given item (work, play, thought, news, experience). */
export function awardsFor(type: RelatedRefType, id: string): Award[] {
  return mockAwards.filter((a) => a.related?.some((r) => r.type === type && r.id === id));
}
