/**
 * Tiny client-side store holding the article the reader is currently viewing,
 * so the chat widget can answer questions about it. Uses an external store
 * (not React state) so a detail page can register the article without a
 * provider and the assistant can subscribe via useSyncExternalStore.
 */
export interface CurrentArticle {
  title: string;
  summary: string;
  content: string;
  slug: string;
}

let current: CurrentArticle | null = null;
const listeners = new Set<() => void>();

export function setCurrentArticle(article: CurrentArticle | null) {
  current = article;
  listeners.forEach((l) => l());
}

export function getCurrentArticleSnapshot(): CurrentArticle | null {
  return current;
}

export function subscribeCurrentArticle(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
