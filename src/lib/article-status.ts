import type { ArticleStatus } from "@/types";

export const ARTICLE_STATUSES: { value: ArticleStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "#8a8a8f" },
  { value: "published", label: "Published", color: "#047857" },
  { value: "archived", label: "Archived", color: "#b45309" },
];

export const ARTICLE_STATUS_VALUES: ArticleStatus[] = ARTICLE_STATUSES.map((s) => s.value);

export function articleStatusMeta(status?: ArticleStatus) {
  return ARTICLE_STATUSES.find((s) => s.value === status) ?? ARTICLE_STATUSES[1];
}
