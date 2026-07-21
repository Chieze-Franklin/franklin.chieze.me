"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { CoverImageField, GalleryField } from "@/components/admin/ImageUpload";
import { EntityMultiSelect } from "@/components/admin/EntityMultiSelect";
import { EntitySelect } from "@/components/admin/EntitySelect";
import { LinksEditor } from "@/components/admin/LinksEditor";
import { Field } from "@/components/admin/Field";
import { WORK_STATUSES } from "@/lib/work-status";
import type { WorkItem, CardSize, WorkLink, WorkStatus } from "@/types";

const SIZES: CardSize[] = ["sm", "md", "lg", "xl"];

interface FormState {
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd, "" = ongoing
  status: WorkStatus;
  tags: string; // comma-separated
  size: CardSize;
  url: string;
  coverImage: string;
  images: string[];
  links: WorkLink[];
  companyId: string;
  awardIds: string[];
  skillIds: string[];
  toolIds: string[];
}

const emptyForm = (): FormState => ({
  title: "",
  slug: "",
  summary: "",
  content: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  status: "in_progress",
  tags: "",
  size: "md",
  url: "",
  coverImage: "",
  images: [],
  links: [],
  companyId: "",
  awardIds: [],
  skillIds: [],
  toolIds: [],
});

function toForm(w: WorkItem): FormState {
  return {
    _id: w._id,
    title: w.title,
    slug: w.slug,
    summary: w.summary,
    content: w.content ?? "",
    startDate: (w.startDate || "").slice(0, 10),
    endDate: (w.endDate || "").slice(0, 10),
    status: w.status ?? "in_progress",
    tags: (w.tags ?? []).join(", "),
    size: w.size ?? "md",
    url: w.url ?? "",
    coverImage: w.coverImage ?? "",
    images: w.images ?? [],
    links: w.links ?? [],
    companyId: w.company?._id ?? "",
    awardIds: (w.awards ?? []).map((a) => a._id),
    skillIds: (w.skills ?? []).map((s) => s._id),
    toolIds: (w.tools ?? []).map((t) => t._id),
  };
}

export function AdminWorks() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/works?limit=100");
    const data = await res.json();
    if (!res.ok) {
      setListError(data.error || `Failed to load works (HTTP ${res.status})`);
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
      const res = await fetch("/api/works?limit=100");
      const data = await res.json();
      if (!active) return;
      if (!res.ok) setListError(data.error || `Failed to load works (HTTP ${res.status})`);
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
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        status: form.status,
        size: form.size,
        url: form.url,
        coverImage: form.coverImage,
        images: form.images,
        links: form.links.filter((l) => l.url.trim()),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        companyId: form.companyId,
        awardIds: form.awardIds,
        skillIds: form.skillIds,
        toolIds: form.toolIds,
      };
      const res = form._id
        ? await fetch(`/api/works/${form._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/works", {
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

  const remove = async (item: WorkItem) => {
    if (!confirm(`Delete "${item.title}"? This also removes its images.`)) return;
    const res = await fetch(`/api/works/${item._id}`, { method: "DELETE" });
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
          <Plus size={16} /> New work item
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
              <p className="truncate font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </p>
              <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                /{item.slug} · {(item.images ?? []).length} image{(item.images ?? []).length === 1 ? "" : "s"}
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
            No work items yet. Add your first one.
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
                {form._id ? "Edit work item" : "New work item"}
              </h2>
              <button className="btn btn-ghost !px-2.5 !py-2" onClick={() => setForm(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4">
              <Field label="Cover image">
                <CoverImageField value={form.coverImage} onChange={(url) => update({ coverImage: url })} />
              </Field>

              <Field label="Title">
                <input className="admin-input" value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Project name" />
              </Field>

              <Field label="Slug (optional — generated from title if blank)">
                <input className="admin-input" value={form.slug} onChange={(e) => update({ slug: e.target.value })} placeholder="my-project" />
              </Field>

              <Field label="Summary">
                <textarea className="admin-input" rows={2} value={form.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="One-line description shown on the card" />
              </Field>

              <Field label="Description (optional — supports markdown)">
                <textarea className="admin-input" rows={5} value={form.content} onChange={(e) => update({ content: e.target.value })} placeholder="Full write-up shown on the work page. Markdown is supported." />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Start date">
                  <input type="date" className="admin-input" value={form.startDate} onChange={(e) => update({ startDate: e.target.value })} />
                </Field>
                <Field label="End date (blank = ongoing)">
                  <input type="date" className="admin-input" value={form.endDate} onChange={(e) => update({ endDate: e.target.value })} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <select className="admin-input" value={form.status} onChange={(e) => update({ status: e.target.value as WorkStatus })}>
                    {WORK_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
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

              <Field label="Tags (comma-separated)">
                <input className="admin-input" value={form.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="saas, platform, africa" />
              </Field>

              <Field label="Primary link (website / app store / live URL)">
                <input type="url" className="admin-input" value={form.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://example.com" />
              </Field>

              <LinksEditor links={form.links} onChange={(links) => update({ links })} />

              <Field label="Screenshots / gallery">
                <GalleryField value={form.images} onChange={(images) => update({ images })} />
              </Field>

              <EntitySelect endpoint="/api/companies" labelKey="name" title="Company (optional)" imageKey="logo" urlKey="url" value={form.companyId} onChange={(id) => update({ companyId: id })} />
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
