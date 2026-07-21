"use client";

import { ExternalLink } from "lucide-react";
import { embedUrl } from "@/lib/embed";

/**
 * Editor field for externally-hosted content: capture the URL and try to
 * display it (embed for known providers, otherwise an iframe of the page).
 */
export function ExternalContent({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const src = value.trim() ? embedUrl(value.trim()) : "";

  return (
    <div className="space-y-3">
      <input
        type="url"
        className="admin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://youtube.com/watch?v=… , a GitHub file, an article URL…"
      />
      {src ? (
        <div className="space-y-2">
          <iframe
            src={src}
            title="External content preview"
            className="h-[65vh] w-full rounded-2xl"
            style={{ border: "1px solid var(--card-border)", background: "var(--surface-2)" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <a
            href={value.trim()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            <ExternalLink size={13} /> Some sites block embedding — open in a new tab to verify
          </a>
        </div>
      ) : (
        <div
          className="flex h-40 items-center justify-center rounded-2xl text-sm"
          style={{ border: "1px dashed var(--card-border)", color: "var(--text-secondary)" }}
        >
          Paste an external URL to preview it here.
        </div>
      )}
    </div>
  );
}
