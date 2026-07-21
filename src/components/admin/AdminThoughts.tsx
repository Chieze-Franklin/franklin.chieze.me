"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { articleStatusMeta } from "@/lib/article-status";
import { contentTypeLabel } from "@/lib/content-type";
import type { ThoughtItem } from "@/types";

export function AdminThoughts() {
  const [items, setItems] = useState<ThoughtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/thoughts?limit=100");
    const data = await res.json();
    if (!res.ok) {
      setListError(data.error || `Failed to load thoughts (HTTP ${res.status})`);
      setLoading(false);
      return;
    }
    setListError("");
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch("/api/thoughts?limit=100");
      const data = await res.json();
      if (!active) return;
      if (!res.ok) setListError(data.error || `Failed to load thoughts (HTTP ${res.status})`);
      else setItems(data.items ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const remove = async (item: ThoughtItem) => {
    if (!confirm(`Delete "${item.title}"? This also removes its images and uploaded media.`)) return;
    const res = await fetch(`/api/thoughts/${item._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) await refresh();
    else alert(data.error || `Failed to delete (HTTP ${res.status})`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {loading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}
        </p>
        <Link href="/admin/thoughts/new" className="btn btn-primary">
          <Plus size={16} /> New article
        </Link>
      </div>

      {listError && (
        <pre
          className="mb-6 whitespace-pre-wrap rounded-xl p-4 text-xs"
          style={{ background: "var(--surface-2)", color: "#be123c", border: "1px solid var(--card-border)" }}
        >
          {listError}
        </pre>
      )}

      <div className="grid gap-3">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 rounded-2xl p-3 pr-4"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg" style={{ background: "var(--surface-2)" }}>
              {item.coverImage && <Image src={item.coverImage} alt="" fill className="object-cover" sizes="80px" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: `${articleStatusMeta(item.status).color}1a`, color: articleStatusMeta(item.status).color }}
                >
                  {articleStatusMeta(item.status).label}
                </span>
                <span className="truncate">{item.title}</span>
              </p>
              <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                {item.blog?.title ? `${item.blog.title} · ` : ""}
                {contentTypeLabel(item.contentType)} · /{item.slug} · {item.views ?? 0} views
              </p>
            </div>
            <Link href={`/admin/thoughts/${item._id}/edit`} className="btn btn-ghost !px-2.5 !py-2" aria-label="Edit">
              <Pencil size={15} />
            </Link>
            <button className="btn btn-ghost !px-2.5 !py-2" onClick={() => remove(item)} aria-label="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No thoughts yet. Add your first one.
          </p>
        )}
      </div>
    </div>
  );
}
