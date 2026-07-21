"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CoverImageField, GalleryField } from "@/components/admin/ImageUpload";
import { EntityMultiSelect } from "@/components/admin/EntityMultiSelect";
import { EntitySelect } from "@/components/admin/EntitySelect";
import { LinksEditor } from "@/components/admin/LinksEditor";
import { Field } from "@/components/admin/Field";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { HtmlEditor } from "@/components/admin/HtmlEditor";
import { MediaUpload, MediaPreview } from "@/components/admin/MediaUpload";
import { ExternalContent } from "@/components/admin/ExternalContent";
import { ARTICLE_STATUSES } from "@/lib/article-status";
import { CONTENT_TYPES, isMediaType } from "@/lib/content-type";
import type { ThoughtItem, CardSize, WorkLink, ContentType, ContentSource, ArticleStatus } from "@/types";

const SIZES: CardSize[] = ["sm", "md", "lg", "xl"];

interface FormState {
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

function toForm(w?: ThoughtItem): FormState {
  return {
    title: w?.title ?? "",
    slug: w?.slug ?? "",
    summary: w?.summary ?? "",
    content: w?.content ?? "",
    date: (w?.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    tags: (w?.tags ?? []).join(", "),
    size: w?.size ?? "md",
    status: w?.status ?? "draft",
    blogId: w?.blog?._id ?? "",
    contentType: w?.contentType ?? "richtext",
    contentSource: w?.contentSource ?? "inline",
    url: w?.url ?? "",
    readingTime: w?.readingTime ? String(w.readingTime) : "",
    coverImage: w?.coverImage ?? "",
    images: w?.images ?? [],
    links: w?.links ?? [],
    awardIds: (w?.awards ?? []).map((a) => a._id),
    skillIds: (w?.skills ?? []).map((s) => s._id),
    toolIds: (w?.tools ?? []).map((t) => t._id),
  };
}

export function ArticleEditor({ item }: { item?: ThoughtItem }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toForm(item));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const media = isMediaType(form.contentType);
  const external = form.contentSource === "external";
  // A canonical URL only makes sense for inline text (media/external use `url` for the body).
  const showCanonical = !media && !external;

  const save = async () => {
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
      const res = item
        ? await fetch(`/api/thoughts/${item._id}`, {
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
      router.push("/admin/thoughts");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Top bar */}
      <div
        className="sticky top-16 z-20 mb-6 flex items-center justify-between gap-4 px-4 py-3 sm:px-8"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--card-border)" }}
      >
        <Link href="/admin/thoughts" className="btn btn-ghost !px-3 !py-2">
          <ArrowLeft size={16} /> Thoughts
        </Link>
        <h1 className="truncate text-lg font-black" style={{ color: "var(--text-primary)" }}>
          {item ? "Edit article" : "New article"}
        </h1>
        <div className="flex items-center gap-3">
          {error && <span className="hidden text-sm sm:inline" style={{ color: "#be123c" }}>{error}</span>}
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {item ? "Save changes" : "Create article"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 px-4 text-sm sm:hidden sm:px-8" style={{ color: "#be123c" }}>
          {error}
        </p>
      )}

      <div className="flex flex-col gap-8 px-4 sm:px-8 lg:flex-row">
        {/* ── Left: metadata ─────────────────────────────────── */}
        <aside className="w-full shrink-0 lg:w-[360px]">
          <div className="grid gap-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2">
            <Field label="Cover image">
              <CoverImageField value={form.coverImage} onChange={(url) => update({ coverImage: url })} />
            </Field>
            <Field label="Screenshots / gallery">
              <GalleryField value={form.images} onChange={(images) => update({ images })} />
            </Field>

            <Field label="Title">
              <input className="admin-input" value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Article title" />
            </Field>
            <Field label="Slug (optional — generated from title if blank)">
              <input className="admin-input" value={form.slug} onChange={(e) => update({ slug: e.target.value })} placeholder="my-article" />
            </Field>
            <Field label="Summary">
              <textarea className="admin-input" rows={3} value={form.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="One-line description shown on the card" />
            </Field>

            <Field label="Status">
              <select className="admin-input" value={form.status} onChange={(e) => update({ status: e.target.value as ArticleStatus })}>
                {ARTICLE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>

            <EntitySelect endpoint="/api/blogs" labelKey="title" title="Blog (optional)" imageKey="logo" urlKey="url" value={form.blogId} onChange={(id) => update({ blogId: id })} />

            <Field label="Content type">
              <select className="admin-input" value={form.contentType} onChange={(e) => update({ contentType: e.target.value as ContentType })}>
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Content location">
              <select className="admin-input" value={form.contentSource} onChange={(e) => update({ contentSource: e.target.value as ContentSource })}>
                <option value="inline">{media ? "Upload to this site" : "Write on this site"}</option>
                <option value="external">External resource</option>
              </select>
            </Field>

            {showCanonical && (
              <Field label="Original / canonical URL (optional)">
                <input type="url" className="admin-input" value={form.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date">
                <input type="date" className="admin-input" value={form.date} onChange={(e) => update({ date: e.target.value })} />
              </Field>
              <Field label="Card size">
                <select className="admin-input" value={form.size} onChange={(e) => update({ size: e.target.value as CardSize })}>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tags (comma-separated)">
                <input className="admin-input" value={form.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="infra, africa" />
              </Field>
              <Field label="Reading time (min)">
                <input type="number" min={0} className="admin-input" value={form.readingTime} onChange={(e) => update({ readingTime: e.target.value })} placeholder="12" />
              </Field>
            </div>

            <LinksEditor links={form.links} onChange={(links) => update({ links })} />

            <EntityMultiSelect endpoint="/api/skills" labelKey="name" title="Skills" selected={form.skillIds} onChange={(ids) => update({ skillIds: ids })} />
            <EntityMultiSelect endpoint="/api/tools" labelKey="name" title="Tools" selected={form.toolIds} onChange={(ids) => update({ toolIds: ids })} />
            <EntityMultiSelect endpoint="/api/awards" labelKey="title" title="Awards" selected={form.awardIds} onChange={(ids) => update({ awardIds: ids })} />
          </div>
        </aside>

        {/* ── Right: content editor ──────────────────────────── */}
        <main className="min-w-0 flex-1">
          <MainContent form={form} update={update} />
        </main>
      </div>
    </div>
  );
}

function MainContent({ form, update }: { form: FormState; update: (p: Partial<FormState>) => void }) {
  const { contentType, contentSource } = form;

  if (contentSource === "external") {
    if (isMediaType(contentType)) {
      return (
        <div className="space-y-3">
          <input
            type="url"
            className="admin-input"
            value={form.url}
            onChange={(e) => update({ url: e.target.value })}
            placeholder={`Direct ${contentType} URL or a YouTube/Vimeo link…`}
          />
          {form.url.trim() ? (
            <MediaPreview url={form.url.trim()} contentType={contentType} />
          ) : (
            <div
              className="flex h-40 items-center justify-center rounded-2xl text-sm"
              style={{ border: "1px dashed var(--card-border)", color: "var(--text-secondary)" }}
            >
              Paste the {contentType} URL to preview it.
            </div>
          )}
        </div>
      );
    }
    return <ExternalContent value={form.url} onChange={(url) => update({ url })} />;
  }

  // Inline
  if (contentType === "richtext") {
    return <RichTextEditor value={form.content} onChange={(content) => update({ content })} />;
  }
  if (contentType === "html") {
    return <HtmlEditor value={form.content} onChange={(content) => update({ content })} />;
  }
  // pdf / audio / video, uploaded to S3
  return (
    <MediaUpload
      value={form.url}
      onChange={(url) => update({ url })}
      contentType={contentType as "pdf" | "audio" | "video"}
    />
  );
}
