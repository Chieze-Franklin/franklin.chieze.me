"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { STATUSES } from "@/lib/applications";
import type { JobApplication, ApplicationStatus } from "@/types";

interface Props {
  initial?: JobApplication;
  onSave: (app: JobApplication) => void;
  onClose: () => void;
}

const field =
  "w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-colors";

export function ApplicationForm({ initial, onSave, onClose }: Props) {
  const [f, setF] = useState({
    company: initial?.company ?? "",
    role: initial?.role ?? "",
    location: initial?.location ?? "",
    companyWebsite: initial?.companyWebsite ?? "",
    companyLinkedin: initial?.companyLinkedin ?? "",
    jobUrl: initial?.jobUrl ?? "",
    jobDescription: initial?.jobDescription ?? "",
    notes: initial?.notes ?? "",
    status: (initial?.status ?? "saved") as ApplicationStatus,
  });

  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const save = () => {
    if (!f.company.trim() || !f.role.trim()) return;
    const now = new Date().toISOString();
    onSave({
      _id: initial?._id ?? crypto.randomUUID(),
      ...f,
      coverLetter: initial?.coverLetter,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
    onClose();
  };

  const inputStyle = {
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--line)",
  } as const;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-3xl"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="headline text-xl" style={{ color: "var(--text)" }}>
            {initial ? "Edit application" : "New application"}
          </h3>
          <button onClick={onClose} className="p-1 transition-opacity hover:opacity-60" style={{ color: "var(--text-2)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Company *">
              <input className={field} style={inputStyle} value={f.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." />
            </Labeled>
            <Labeled label="Role *">
              <input className={field} style={inputStyle} value={f.role} onChange={(e) => set("role", e.target.value)} placeholder="Senior Engineer" />
            </Labeled>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Location">
              <input className={field} style={inputStyle} value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Remote · Lagos" />
            </Labeled>
            <Labeled label="Status">
              <select className={field} style={inputStyle} value={f.status} onChange={(e) => set("status", e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </Labeled>
          </div>

          <Labeled label="Company website">
            <input className={field} style={inputStyle} value={f.companyWebsite} onChange={(e) => set("companyWebsite", e.target.value)} placeholder="https://acme.com" />
          </Labeled>
          <Labeled label="Company LinkedIn">
            <input className={field} style={inputStyle} value={f.companyLinkedin} onChange={(e) => set("companyLinkedin", e.target.value)} placeholder="https://linkedin.com/company/acme" />
          </Labeled>
          <Labeled label="Job posting URL">
            <input className={field} style={inputStyle} value={f.jobUrl} onChange={(e) => set("jobUrl", e.target.value)} placeholder="https://acme.com/careers/123" />
          </Labeled>

          <Labeled label="Job description">
            <textarea
              className={`${field} min-h-28 resize-y`}
              style={inputStyle}
              value={f.jobDescription}
              onChange={(e) => set("jobDescription", e.target.value)}
              placeholder="Paste the responsibilities, requirements, and anything notable about the role…"
            />
          </Labeled>

          <Labeled label="Notes">
            <textarea
              className={`${field} min-h-16 resize-y`}
              style={inputStyle}
              value={f.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Referrals, recruiter name, salary band, deadlines…"
            />
          </Labeled>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: "1px solid var(--line)" }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={save} disabled={!f.company.trim() || !f.role.trim()} className="btn btn-primary disabled:opacity-40">
            {initial ? "Save changes" : "Add application"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "var(--text-2)" }}>{label}</span>
      {children}
    </label>
  );
}
