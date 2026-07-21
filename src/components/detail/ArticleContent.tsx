import { ExternalLink } from "lucide-react";
import { IFRAME_ALLOW, providerEmbedUrl, embedUrl, hostOf } from "@/lib/embed";
import type { ThoughtItem } from "@/types";

/** Renders an article's body according to its content type and source. */
export function ArticleContent({ item }: { item: ThoughtItem }) {
  const { contentType, contentSource, content, url, title, summary } = item;

  // ── Media (always URL-based) ──────────────────────────────────
  if (contentType === "video") {
    if (!url) return null;
    const embed = providerEmbedUrl(url);
    return embed ? (
      <div className="w-full aspect-video overflow-hidden rounded-2xl mb-8">
        <iframe src={embed} title={title} allow={IFRAME_ALLOW} allowFullScreen className="h-full w-full" />
      </div>
    ) : (
      <video controls src={url} className="mb-8 w-full rounded-2xl" />
    );
  }
  if (contentType === "audio") {
    if (!url) return null;
    return <audio controls src={url} className="mb-8 w-full" />;
  }
  if (contentType === "pdf") {
    if (!url) return null;
    return (
      <div className="mb-8">
        <iframe
          src={url}
          title={title}
          className="h-[85vh] w-full rounded-2xl"
          style={{ border: "1px solid var(--card-border)", background: "var(--surface-2)" }}
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm"
          style={{ color: "var(--accent)" }}
        >
          Open PDF <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  // ── Rich text / HTML stored externally → try to embed, else link out ──
  if (contentSource === "external") {
    if (!url) return null;
    const embed = providerEmbedUrl(url);
    if (embed) {
      return (
        <div className="w-full aspect-video overflow-hidden rounded-2xl mb-8">
          <iframe src={embed} title={title} allow={IFRAME_ALLOW} allowFullScreen className="h-full w-full" />
        </div>
      );
    }
    return (
      <div className="mb-8">
        <iframe
          src={embedUrl(url)}
          title={title}
          className="h-[85vh] w-full rounded-2xl"
          style={{ border: "1px solid var(--card-border)", background: "var(--surface-2)" }}
          allow={IFRAME_ALLOW}
          allowFullScreen
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--accent)" }}
        >
          Read on {hostOf(url)} <ExternalLink size={15} />
        </a>
      </div>
    );
  }

  // ── Inline rich text / HTML (both stored as trusted, admin-authored HTML) ──
  const body = content || summary;
  return (
    <div
      className="markdown text-base leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
      // Trusted, admin-authored HTML.
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
