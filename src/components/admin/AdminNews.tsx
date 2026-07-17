"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from "lucide-react";
import { EntityMultiSelect } from "@/components/admin/EntityMultiSelect";
import type { NewsItem, CardSize } from "@/types";

const SIZES: CardSize[] = ["sm", "md", "lg", "xl"];

interface FormState {
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  url: string;
  date: string; // yyyy-mm-dd
  tags: string; // comma-separated
  size: CardSize;
  coverImage: string;
  awardIds: string[];
}

const emptyForm = (): FormState => ({
  title: "",
  slug: "",
  summary: "",
  content: "",
  url: "",
  date: new Date().toISOString().slice(0, 10),
  tags: "",
  size: "md",
  coverImage: "",
  awardIds: [],
});

function toForm(item: NewsItem): FormState {
  return {
    _id: item._id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content ?? "",
    url: item.url ?? "",
    date: new Date(item.date).toISOString().slice(0, 10),
    tags: (item.tags ?? []).join(", "),
    size: item.size ?? "md",
    coverImage: item.coverImage ?? "",
    awardIds: (item.awards ?? []).map((a) => a._id),
  };
}

export function AdminNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/news?limit=100");
    const data = await res.json();
    if (!res.ok) {
      setListError(data.error || `Failed to load news (HTTP ${res.status})`);
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
      const res = await fetch("/api/news?limit=100");
      const data = await res.json();
      if (!active) return;
      if (!res.ok) {
        setListError(data.error || `Failed to load news (HTTP ${res.status})`);
        setLoading(false);
        return;
      }
      setItems(data.items ?? []);
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
        url: form.url,
        date: form.date,
        size: form.size,
        coverImage: form.coverImage,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        awardIds: form.awardIds,
      };
      const res = form._id
        ? await fetch(`/api/news/${form._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/news", {
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

  const remove = async (item: NewsItem) => {
    if (!confirm(`Delete "${item.title}"? This also removes its cover image.`)) return;
    const res = await fetch(`/api/news/${item._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) await refresh();
    else alert(data.error || `Failed to delete (HTTP ${res.status})`);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {loading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}
        </p>
        <button className="btn btn-primary" onClick={() => setForm(emptyForm())}>
          <Plus size={16} /> New news item
        </button>
      </div>

      {/* Failed to load news — show the real server error */}
      {listError && (
        <pre
          className="mb-6 whitespace-pre-wrap rounded-xl p-4 text-xs"
          style={{ background: "var(--surface-2)", color: "#be123c", border: "1px solid var(--card-border)" }}
        >
          {listError}
        </pre>
      )}

      {/* List */}
      <div className="grid gap-3">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-4 rounded-2xl p-3 pr-4"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div
              className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg"
              style={{ background: "var(--surface-2)" }}
            >
              {item.coverImage && (
                <Image src={item.coverImage} alt="" fill className="object-cover" sizes="80px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </p>
              <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                {new Date(item.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · /{item.slug}
              </p>
            </div>
            <button
              className="btn btn-ghost !px-2.5 !py-2"
              onClick={() => setForm(toForm(item))}
              aria-label="Edit"
            >
              <Pencil size={15} />
            </button>
            <button
              className="btn btn-ghost !px-2.5 !py-2"
              onClick={() => remove(item)}
              aria-label="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No news items yet. Add your first one.
          </p>
        )}
      </div>

      {/* Editor modal */}
      {form && (
        <NewsEditor
          form={form}
          setForm={setForm}
          onClose={() => setForm(null)}
          onSave={save}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}

function NewsEditor({
  form,
  setForm,
  onClose,
  onSave,
  saving,
  error,
}: {
  form: FormState;
  setForm: (f: FormState | null) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error: string;
}) {
  const update = (patch: Partial<FormState>) => setForm({ ...form, ...patch });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 my-auto"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            {form._id ? "Edit news item" : "New news item"}
          </h2>
          <button className="btn btn-ghost !px-2.5 !py-2" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-4">
          <Field label="Title">
            <input
              className="admin-input"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Headline"
            />
          </Field>

          <Field label="Slug (optional — generated from title if blank)">
            <input
              className="admin-input"
              value={form.slug}
              onChange={(e) => update({ slug: e.target.value })}
              placeholder="my-news-item"
            />
          </Field>

          <Field label="Summary">
            <textarea
              className="admin-input"
              rows={2}
              value={form.summary}
              onChange={(e) => update({ summary: e.target.value })}
              placeholder="Short summary shown on the card"
            />
          </Field>

          <Field label="Content (optional)">
            <textarea
              className="admin-input"
              rows={5}
              value={form.content}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="Full article body"
            />
          </Field>

          <Field label="External link (optional — opens in a new tab)">
            <input
              type="url"
              className="admin-input"
              value={form.url}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="https://example.com/article"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <input
                type="date"
                className="admin-input"
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
              />
            </Field>
            <Field label="Card size">
              <select
                className="admin-input"
                value={form.size}
                onChange={(e) => update({ size: e.target.value as CardSize })}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Tags (comma-separated)">
            <input
              className="admin-input"
              value={form.tags}
              onChange={(e) => update({ tags: e.target.value })}
              placeholder="Funding, Product"
            />
          </Field>

          <Field label="Cover image">
            <CoverImageField
              value={form.coverImage}
              onChange={(url) => update({ coverImage: url })}
            />
          </Field>

          <EntityMultiSelect
            endpoint="/api/awards"
            labelKey="title"
            title="Awards"
            selected={form.awardIds}
            onChange={(ids) => update({ awardIds: ids })}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm" style={{ color: "#be123c" }}>
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {form._id ? "Save changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CoverImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // Remove the cover image — also deletes the object from the S3 bucket.
  const removeImage = async () => {
    if (!value) return;
    setBusy(true);
    setError("");
    try {
      await fetch(`/api/upload?url=${encodeURIComponent(value)}`, { method: "DELETE" });
      onChange("");
    } catch {
      setError("Could not delete image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {value ? (
        <div
          className="relative h-44 w-full overflow-hidden rounded-xl"
          style={{ background: "var(--surface-2)" }}
        >
          <Image src={value} alt="Cover preview" fill className="object-cover" sizes="600px" />
          <button
            type="button"
            onClick={removeImage}
            disabled={busy}
            className="btn btn-ghost absolute right-2 top-2 !px-2.5 !py-2"
            aria-label="Remove cover image"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors"
          style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
        >
          {busy ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-sm">{busy ? "Uploading…" : "Upload an image"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      {error && (
        <p className="mt-2 text-sm" style={{ color: "#be123c" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
