import { ExternalLink } from "lucide-react";
import { Markdown } from "@/components/ui/Markdown";
import type { ThoughtItem } from "@/types";

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

/** Convert a YouTube/Vimeo URL into an embeddable URL, or null if not recognized. */
function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* fall through */
  }
  return null;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "the source";
  }
}

/** Renders an article's body according to its content type and source. */
export function ArticleContent({ item }: { item: ThoughtItem }) {
  const { contentType, contentSource, content, url, title, summary } = item;

  // ── Media (always URL-based) ──────────────────────────────────
  if (contentType === "video") {
    if (!url) return null;
    const embed = embedUrl(url);
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

  // ── Text types stored externally → link out ───────────────────
  if (contentSource === "external") {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Read on {hostOf(url)} <ExternalLink size={15} />
      </a>
    );
  }

  // ── Inline text ───────────────────────────────────────────────
  const body = content || summary;
  if (contentType === "html") {
    return (
      <div
        className="markdown text-base leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
        // Trusted, admin-authored HTML.
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }
  if (contentType === "markdown") {
    return (
      <div className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <Markdown allowHtml>{body}</Markdown>
      </div>
    );
  }
  // plaintext
  return (
    <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
      {body}
    </p>
  );
}
