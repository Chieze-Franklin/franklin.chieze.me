/**
 * Derive an icon URL from a website using a favicon service. Returns null when
 * no usable host can be parsed.
 */
export function faviconFor(url?: string): string | null {
  if (!url) return null;
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const host = new URL(normalized).hostname;
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return null;
  }
}

/**
 * Resolve the best image for an entity: an uploaded image, else a favicon
 * derived from its website, else null (callers render a placeholder).
 */
export function entityImageSrc({ image, url }: { image?: string; url?: string }): string | null {
  return image || faviconFor(url);
}
