"use client";

import { useState, useEffect, useMemo } from "react";
import { MasonryGrid } from "@/components/cards/MasonryGrid";
import { NewsCard } from "@/components/cards/NewsCard";
import { PageHeader } from "@/components/layout/PageHeader";
import type { ThoughtItem } from "@/types";

export default function ThoughtsPage() {
  const [items, setItems] = useState<ThoughtItem[]>([]);
  const [blog, setBlog] = useState(""); // blog slug ("" = all)
  const [tag, setTag] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/thoughts?limit=100");
        const data = await res.json();
        if (active && res.ok) setItems(data.items ?? []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Blogs that actually have articles, for the blog filter.
  const blogs = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of items) if (it.blog) map.set(it.blog.slug, it.blog.title);
    return [...map.entries()]
      .map(([slug, title]) => ({ slug, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [items]);

  // Tags available under the current blog selection.
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      if (blog && it.blog?.slug !== blog) continue;
      (it.tags ?? []).forEach((t) => set.add(t));
    }
    return [...set].sort();
  }, [items, blog]);

  const filtered = useMemo(
    () =>
      items.filter(
        (it) => (!blog || it.blog?.slug === blog) && (!tag || (it.tags ?? []).includes(tag))
      ),
    [items, blog, tag]
  );

  return (
    <>
      <PageHeader
        eyebrow="Thoughts"
        title="Articles, posts & vlogs"
        subtitle="Ideas about engineering, startups, and building for Africa."
      />
      <section className="mx-auto w-full max-w-7xl px-6 pb-28">
        {(blogs.length > 0 || tags.length > 0) && (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {blogs.length > 0 && (
              <select
                value={blog}
                onChange={(e) => {
                  setBlog(e.target.value);
                  setTag("");
                }}
                className="admin-input"
                style={{ maxWidth: 260 }}
              >
                <option value="">All blogs</option>
                {blogs.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.title}
                  </option>
                ))}
              </select>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
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
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm" style={{ color: "var(--text-3)" }}>
            No articles match this filter yet.
          </p>
        ) : (
          <MasonryGrid
            items={filtered}
            renderCard={(item, index) => (
              <NewsCard item={item} basePath="thoughts" priority={index === 0} openExternal={false} />
            )}
          />
        )}
      </section>
    </>
  );
}
