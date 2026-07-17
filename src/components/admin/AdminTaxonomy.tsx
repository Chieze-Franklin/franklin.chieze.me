"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "url" | "date" | "number" | "csv" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
}

type Entity = { _id: string } & Record<string, unknown>;

interface Props {
  endpoint: string; // e.g. "/api/skills"
  singular: string; // e.g. "Skill"
  displayKey: string; // which field to show in the list (e.g. "name" or "title")
  fields: FieldDef[];
  /** Optional note appended to the delete confirmation. */
  removeNote?: string;
}

// Convert a stored value to the string the form input holds.
function toInput(value: unknown, type?: FieldDef["type"]): string {
  if (type === "csv") return Array.isArray(value) ? value.join(", ") : "";
  if (value === undefined || value === null) return "";
  return String(value);
}

export function AdminTaxonomy({ endpoint, singular, displayKey, fields, removeNote }: Props) {
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (!res.ok) {
      setListError(data.error || `Failed to load (HTTP ${res.status})`);
      setLoading(false);
      return;
    }
    setListError("");
    setItems(data.items ?? []);
    setLoading(false);
  }, [endpoint]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!active) return;
      if (!res.ok) setListError(data.error || `Failed to load (HTTP ${res.status})`);
      else setItems(data.items ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [endpoint]);

  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""]));

  const openNew = () => {
    setEditId(null);
    setError("");
    setForm(blank());
  };

  const openEdit = (item: Entity) => {
    setEditId(item._id);
    setError("");
    setForm(Object.fromEntries(fields.map((f) => [f.key, toInput(item[f.key], f.type)])));
  };

  const save = async () => {
    if (!form) return;
    const missing = fields.find((f) => f.required && !form[f.key]?.trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    setSaving(true);
    setError("");
    // Build the payload, converting csv → array and number → number.
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = form[f.key] ?? "";
      if (f.type === "csv") payload[f.key] = raw.split(",").map((s) => s.trim()).filter(Boolean);
      else if (f.type === "number") payload[f.key] = raw === "" ? undefined : Number(raw);
      else payload[f.key] = raw;
    }
    try {
      const res = await fetch(editId ? `${endpoint}/${editId}` : endpoint, {
        method: editId ? "PATCH" : "POST",
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

  const remove = async (item: Entity) => {
    if (!confirm(`Delete "${String(item[displayKey] ?? "")}"?${removeNote ? ` ${removeNote}` : ""}`)) return;
    const res = await fetch(`${endpoint}/${item._id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) await refresh();
    else alert(data.error || `Failed to delete (HTTP ${res.status})`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {loading ? "Loading…" : `${items.length} ${singular.toLowerCase()}${items.length === 1 ? "" : "s"}`}
        </p>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> New {singular.toLowerCase()}
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

      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {String(item[displayKey] ?? "")}
              </p>
              {typeof item.description === "string" && item.description && (
                <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                  {item.description}
                </p>
              )}
            </div>
            <button className="btn btn-ghost !px-2.5 !py-2" onClick={() => openEdit(item)} aria-label="Edit">
              <Pencil size={15} />
            </button>
            <button className="btn btn-ghost !px-2.5 !py-2" onClick={() => remove(item)} aria-label="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No {singular.toLowerCase()}s yet.
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
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 my-auto"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                {editId ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
              </h2>
              <button className="btn btn-ghost !px-2.5 !py-2" onClick={() => setForm(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4">
              {fields.map((f) => (
                <label key={f.key} className="block">
                  <span
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {f.label}
                    {f.required ? " *" : ""}
                  </span>
                  {f.type === "textarea" ? (
                    <textarea
                      className="admin-input"
                      rows={3}
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="admin-input"
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    >
                      {(f.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={
                        f.type === "date" ? "date" : f.type === "number" ? "number" : f.type === "url" ? "url" : "text"
                      }
                      className="admin-input"
                      value={form[f.key] ?? ""}
                      placeholder={f.type === "csv" ? "Comma-separated" : undefined}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  )}
                </label>
              ))}
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
                {editId ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
