"use client";

import { Plus, Trash2 } from "lucide-react";
import type { WorkLink } from "@/types";

/** Repeatable editor for secondary labelled links (label + url). */
export function LinksEditor({
  links,
  onChange,
}: {
  links: WorkLink[];
  onChange: (links: WorkLink[]) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Other links
      </span>
      <div className="grid gap-2">
        {links.map((lnk, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="admin-input"
              style={{ maxWidth: 140 }}
              value={lnk.label}
              placeholder="Label"
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
            />
            <input
              type="url"
              className="admin-input"
              value={lnk.url}
              placeholder="https://…"
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], url: e.target.value };
                onChange(next);
              }}
            />
            <button
              type="button"
              className="btn btn-ghost !px-2.5 !py-2 shrink-0"
              onClick={() => onChange(links.filter((_, j) => j !== i))}
              aria-label="Remove link"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-ghost self-start !py-2"
          onClick={() => onChange([...links, { label: "", url: "" }])}
        >
          <Plus size={14} /> Add link
        </button>
      </div>
    </div>
  );
}
