"use client";

import { useState, useMemo } from "react";
import { NewsCard } from "@/components/cards/NewsCard";
import type { ThoughtItem } from "@/types";

/** A blog's articles with a per-blog tag filter. */
export function BlogArticles({ items }: { items: ThoughtItem[] }) {
  const [tag, setTag] = useState("");

  const tags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => (it.tags ?? []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(
    () => (tag ? items.filter((it) => (it.tags ?? []).includes(tag)) : items),
    [items, tag]
  );

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm" style={{ color: "var(--text-3)" }}>
        No articles in this blog yet.
      </p>
    );
  }

  return (
    <>
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {["", ...tags].map((t) => {
            const active = tag === t;
            return (
              <button
                key={t || "all"}
                onClick={() => setTag(t)}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
                style={{
                  background: active ? "var(--accent)" : "var(--surface)",
                  color: active ? "#fff" : "var(--text-2)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                }}
              >
                {t || "All"}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm" style={{ color: "var(--text-3)" }}>
          No articles match this tag.
        </p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4" style={{ columnGap: "1rem" }}>
          {filtered.map((item, i) => (
            <div key={item._id} className="break-inside-avoid mb-4">
              <NewsCard item={item} basePath="thoughts" priority={i === 0} openExternal={false} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
