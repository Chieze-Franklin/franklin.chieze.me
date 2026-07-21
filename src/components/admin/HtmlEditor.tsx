"use client";

import { useState } from "react";
import { Code2, Eye } from "lucide-react";

/** Raw HTML editor with a toggle between the source and a rendered preview. */
export function HtmlEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--card-border)" }}>
      <div
        className="flex items-center gap-1 p-2"
        style={{ borderBottom: "1px solid var(--card-border)", background: "var(--surface-2)" }}
      >
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`btn !px-3 !py-1.5 text-xs ${preview ? "btn-ghost" : "btn-primary"}`}
        >
          <Code2 size={14} /> HTML
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`btn !px-3 !py-1.5 text-xs ${preview ? "btn-primary" : "btn-ghost"}`}
        >
          <Eye size={14} /> Preview
        </button>
      </div>
      {preview ? (
        <div
          className="prose-editor min-h-[60vh] p-5"
          style={{ color: "var(--text-primary)" }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="<h2>Your article</h2>\n<p>Raw HTML goes here…</p>"
          className="w-full min-h-[60vh] p-5 font-mono text-sm focus:outline-none resize-y"
          style={{ background: "transparent", color: "var(--text-primary)" }}
        />
      )}
    </div>
  );
}
