"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { EntityMultiSelect } from "@/components/admin/EntityMultiSelect";
import { EntitySelect } from "@/components/admin/EntitySelect";
import { Field } from "@/components/admin/Field";
import type { JobRole } from "@/types";

interface FormState {
  _id?: string;
  companyId: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  skillIds: string[];
  toolIds: string[];
  highlights: string; // one per line
  awardIds: string[];
}

const emptyForm = (): FormState => ({
  companyId: "",
  title: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  description: "",
  skillIds: [],
  toolIds: [],
  highlights: "",
  awardIds: [],
});

function toForm(r: JobRole): FormState {
  return {
    _id: r._id,
    companyId: r.company?._id ?? "",
    title: r.title,
    startDate: (r.startDate || "").slice(0, 10),
    endDate: r.endDate ? r.endDate.slice(0, 10) : "",
    description: r.description ?? "",
    skillIds: (r.skills ?? []).map((s) => s._id),
    toolIds: (r.tools ?? []).map((t) => t._id),
    highlights: (r.highlights ?? []).join("\n"),
    awardIds: (r.awards ?? []).map((a) => a._id),
  };
}

export function AdminJobRoles() {
  const [items, setItems] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/job-roles");
    const data = await res.json();
    if (!res.ok) {
      setListError(data.error || `Failed to load (HTTP ${res.status})`);
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
      const res = await fetch("/api/job-roles");
      const data = await res.json();
      if (!active) return;
      if (!res.ok) setListError(data.error || `Failed to load (HTTP ${res.status})`);
      else setItems(data.items ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    if (!form) return;
    if (!form.companyId) {
      setError("Please select or create a company.");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        companyId: form.companyId,
        title: form.title,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        description: form.description,
        skillIds: form.skillIds,
        toolIds: form.toolIds,
        highlights: form.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
        awardIds: form.awardIds,
      };
      const res = form._id
        ? await fetch(`/api/job-roles/${form._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/job-roles", {
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

  const remove = async (item: JobRole) => {
    if (!confirm(`Delete "${item.title} · ${item.company?.name ?? ""}"?`)) return;
    const res = await fetch(`/api/job-roles/${item._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) await refresh();
    else alert(data.error || `Failed to delete (HTTP ${res.status})`);
  };

  const update = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {loading ? "Loading…" : `${items.length} role${items.length === 1 ? "" : "s"}`}
        </p>
        <button className="btn btn-primary" onClick={() => setForm(emptyForm())}>
          <Plus size={16} /> New role
        </button>
      </div>

      {listError && (
        <pre
          className="mb-4 whitespace-pre-wrap rounded-xl p-4 text-xs"
          style={{ background: "var(--surface-2)", color: "#be123c", border: "1px solid var(--card-border)" }}
        >
          {listError}
        </pre>
      )}

      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {item.title} · {item.company?.name ?? "—"}
              </p>
              <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                {new Date(item.startDate).getFullYear()} — {item.endDate ? new Date(item.endDate).getFullYear() : "Present"}
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
          <p className="py-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No roles yet.
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
                {form._id ? "Edit role" : "New role"}
              </h2>
              <button className="btn btn-ghost !px-2.5 !py-2" onClick={() => setForm(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4">
              <EntitySelect endpoint="/api/companies" labelKey="name" title="Company" value={form.companyId} onChange={(id) => update({ companyId: id })} />

              <Field label="Title">
                <input className="admin-input" value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Senior Engineer" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Start date">
                  <input type="date" className="admin-input" value={form.startDate} onChange={(e) => update({ startDate: e.target.value })} />
                </Field>
                <Field label="End date (blank = present)">
                  <input type="date" className="admin-input" value={form.endDate} onChange={(e) => update({ endDate: e.target.value })} />
                </Field>
              </div>

              <Field label="Description">
                <textarea className="admin-input" rows={3} value={form.description} onChange={(e) => update({ description: e.target.value })} />
              </Field>

              <Field label="Highlights (one per line)">
                <textarea className="admin-input" rows={3} value={form.highlights} onChange={(e) => update({ highlights: e.target.value })} placeholder={"Grew the team from 1 to 12\nShipped the first paid customers"} />
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
