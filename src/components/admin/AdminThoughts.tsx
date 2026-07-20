"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { CoverImageField, GalleryField } from "@/components/admin/ImageUpload";
import { EntityMultiSelect } from "@/components/admin/EntityMultiSelect";
import { EntitySelect } from "@/components/admin/EntitySelect";
import { LinksEditor } from "@/components/admin/LinksEditor";
import { Field } from "@/components/admin/Field";
import { ARTICLE_STATUSES, articleStatusMeta } from "@/lib/article-status";
import type { ThoughtItem, CardSize, WorkLink, ContentType, ContentSource, ArticleStatus } from "@/types";

const SIZES: CardSize[] = ["sm", "md", "lg", "xl"];
const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "markdown", label: "Markdown (may contain HTML)" },
  { value: "html", label: "HTML" },
  { value: "plaintext", label: "Plain text" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
];

interface FormState {
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  date: string;
  tags: string;
  size: CardSize;
  status: ArticleStatus;
  blogId: string;
  contentType: ContentType;
  contentSource: ContentSource;
  url: string;
  readingTime: string;
  coverImage: string;
  images: string[];
  links: WorkLink[];
  awardIds: string[];
  skillIds: string[];
  toolIds: string[];
}

const emptyForm = (): FormState => ({
  title: "",
  slug: "",
  summary: "",
  content: "",
  date: new Date().toISOString().slice(0, 10),
  tags: "",
  size: "md",
  status: "draft",
  blogId: "",
  contentType: "markdown",
  contentSource: "inline",
  url: "",
  readingTime: "",
  coverImage: "",
  images: [],
  links: [],
  awardIds: [],
  skillIds: [],
  toolIds: [],
});

function toForm(w: ThoughtItem): FormState {
  return {
    _id: w._id,
    title: w.title,
    slug: w.slug,
    summary: w.summary,
    content: w.content ?? "",
    date: (w.date || "").slice(0, 10),
    tags: (w.tags ?? []).join(", "),
    size: w.size ?? "md",
    status: w.status ?? "published",
    blogId: w.blog?._id ?? "",
    contentType: w.contentType ?? "markdown",
    contentSource: w.contentSource ?? "inline",
    url: w.url ?? "",
    readingTime: w.readingTime ? String(w.readingTime) : "",
    coverImage: w.coverImage ?? "",
    images: w.images ?? [],
    links: w.links ?? [],
    awardIds: (w.awards ?? []).map((a) => a._id),
    skillIds: (w.skills ?? []).map((s) => s._id),
    toolIds: (w.tools ?? []).map((t) => t._id),
  };
}

export function AdminThoughts() {
  const [items, setItems] = useState<ThoughtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const save = async () => {
    if (!form) return;
    if (!form.title.trim() || !form.summary.trim()) {
      setError("Title and summary are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        content: form.content,
        date: form.date,
        size: form.size,
        status: form.status,
        blogId: form.blogId,
        contentType: form.contentType,
        contentSource: form.contentSource,
        url: form.url,
        readingTime: form.readingTime,
        coverImage: form.coverImage,
        images: form.images,
        links: form.links.filter((l) => l.url.trim()),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        awardIds: form.awardIds,
        skillIds: form.skillIds,
        toolIds: form.toolIds,
      };
      const res = form._id
        ? await fetch(`/api/thoughts/${form._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/thoughts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setForm(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ThoughtItem) => {
    if (!confirm(`Delete "${item.title}"? This also removes its images.`)) return;
    const res = await fetch(`/api/thoughts/${item._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) await refresh();
    else alert(data.error || `Failed to delete (HTTP ${res.status})`);
  };

  const update = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {loading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}
        </p>
        <button className="btn btn-primary" onClick={() => setForm(emptyForm())}>
          <Plus size={16} /> New thought
        </button>
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
                {item.contentType} · /{item.slug} · {item.views ?? 0} views
              </p>
            </div>
            <button className="btn btn-ghost !px-2.5 !py-2" onClick={() => setForm(toForm(item))} aria-label="Edit">
              <Pencil size={15} />
            </button>
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

      {form && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setForm(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 my-auto"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                {form._id ? "Edit thought" : "New thought"}
              </h2>
              <button className="btn btn-ghost !px-2.5 !py-2" onClick={() => setForm(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4">
              <Field label="Title">
                <input className="admin-input" value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Post title" />
              </Field>
              <Field label="Slug (optional — generated from title if blank)">
                <input className="admin-input" value={form.slug} onChange={(e) => update({ slug: e.target.value })} placeholder="my-article" />
              </Field>
              <Field label="Summary">
                <textarea className="admin-input" rows={2} value={form.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="One-line description shown on the card" />
              </Field>

              <Field label="Status">
                <select className="admin-input" value={form.status} onChange={(e) => update({ status: e.target.value as ArticleStatus })}>
                  {ARTICLE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <EntitySelect endpoint="/api/blogs" labelKey="title" title="Blog (optional)" imageKey="logo" value={form.blogId} onChange={(id) => update({ blogId: id })} />

              <div className="grid grid-cols-3 gap-4">
                <Field label="Content type">
                  <select className="admin-input" value={form.contentType} onChange={(e) => update({ contentType: e.target.value as ContentType })}>
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Date">
                  <input type="date" className="admin-input" value={form.date} onChange={(e) => update({ date: e.target.value })} />
                </Field>
                <Field label="Card size">
                  <select className="admin-input" value={form.size} onChange={(e) => update({ size: e.target.value as CardSize })}>
                    {SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {(() => {
                const isMedia = form.contentType === "audio" || form.contentType === "video";
                const isExternal = !isMedia && form.contentSource === "external";
                return (
                  <>
                    {/* Content source only applies to text types */}
                    {!isMedia && (
                      <Field label="Content location">
                        <select className="admin-input" value={form.contentSource} onChange={(e) => update({ contentSource: e.target.value as ContentSource })}>
                          <option value="inline">In this site (write the content below)</option>
                          <option value="external">External resource (link out)</option>
                        </select>
                      </Field>
                    )}

                    {/* Body only for inline text */}
                    {!isMedia && form.contentSource === "inline" && (
                      <Field label="Body">
                        <textarea className="admin-input" rows={8} value={form.content} onChange={(e) => update({ content: e.target.value })} placeholder="The article body — rendered per the content type." />
                      </Field>
                    )}

                    {/* URL: media source, external content, or optional canonical link */}
                    <Field
                      label={
                        isMedia
                          ? "Media URL (YouTube/Vimeo or a direct audio/video file)"
                          : isExternal
                          ? "External content URL (YouTube, GitHub, …)"
                          : "Original / canonical URL (optional)"
                      }
                    >
                      <input type="url" className="admin-input" value={form.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" />
                    </Field>
                  </>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tags (comma-separated)">
                  <input className="admin-input" value={form.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="infrastructure, africa, startups" />
                </Field>
                <Field label="Reading time (minutes)">
                  <input
                    type="number"
                    min={0}
                    className="admin-input"
                    value={form.readingTime}
                    onChange={(e) => update({ readingTime: e.target.value })}
                    placeholder="12"
                  />
                </Field>
              </div>

              <LinksEditor links={form.links} onChange={(links) => update({ links })} />

              <Field label="Cover image">
                <CoverImageField value={form.coverImage} onChange={(url) => update({ coverImage: url })} />
              </Field>
              <Field label="Screenshots / gallery">
                <GalleryField value={form.images} onChange={(images) => update({ images })} />
              </Field>

              <EntityMultiSelect endpoint="/api/skills" labelKey="name" title="Skills" selected={form.skillIds} onChange={(ids) => update({ skillIds: ids })} />
              <EntityMultiSelect endpoint="/api/tools" labelKey="name" title="Tools" selected={form.toolIds} onChange={(ids) => update({ toolIds: ids })} />
              <EntityMultiSelect endpoint="/api/awards" labelKey="title" title="Awards" selected={form.awardIds} onChange={(ids) => update({ awardIds: ids })} />
            </div>

            {error && (
              <p className="mt-4 text-sm" style={{ color: "#be123c" }}>
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-ghost" onClick={() => setForm(null)} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {form._id ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
