"use client";

import { useState, useMemo } from "react";
import { UserButton } from "@clerk/nextjs";
import { Plus, Pencil, Trash2, FileText, MessageSquareText, Globe, ExternalLink, DatabaseBackup, AlertCircle } from "lucide-react";

function Linkedin({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.44-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}
import { useJobApplications } from "@/hooks/useJobApplications";
import { STATUSES, statusMeta } from "@/lib/applications";
import { ApplicationForm } from "./ApplicationForm";
import { CoverLetterStudio } from "./CoverLetterStudio";
import { QuestionsStudio } from "./QuestionsStudio";
import type { JobApplication, ApplicationStatus } from "@/types";

export function ApplyTracker() {
  const { apps, loaded, error, upsert, remove, legacyCount, importing, importLegacy, dismissLegacy } =
    useJobApplications();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [creating, setCreating] = useState(false);
  const [letterFor, setLetterFor] = useState<JobApplication | null>(null);
  const [questionsFor, setQuestionsFor] = useState<JobApplication | null>(null);
  const [importResult, setImportResult] = useState("");

  const runImport = async () => {
    const result = await importLegacy();
    if (result) {
      setImportResult(
        `Imported ${result.imported} application${result.imported === 1 ? "" : "s"}` +
          (result.skipped ? ` · ${result.skipped} already in the database` : "") +
          ". Your browser copy is kept as a backup."
      );
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    for (const s of STATUSES) c[s.id] = apps.filter((a) => a.status === s.id).length;
    return c;
  }, [apps]);

  const visible = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-28">
      {/* One-time migration of the old browser-local tracker */}
      {legacyCount > 0 && (
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
          style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)" }}
        >
          <div className="flex items-start gap-2.5">
            <DatabaseBackup size={17} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text)" }}>
              <strong>{legacyCount} application{legacyCount === 1 ? "" : "s"}</strong> from the old
              browser-only tracker {legacyCount === 1 ? "is" : "are"} not in the database yet.
              Import {legacyCount === 1 ? "it" : "them"} to keep everything in one place — your browser
              copy is kept as a backup.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={dismissLegacy} className="btn btn-ghost">Not now</button>
            <button onClick={runImport} disabled={importing} className="btn btn-primary disabled:opacity-50">
              {importing ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : null}
              {importing ? "Importing…" : "Import to database"}
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <p className="mb-5 rounded-2xl px-4 py-3 text-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text-2)" }}>
          {importResult}
        </p>
      )}

      {error && (
        <p className="mb-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-[13px]" style={{ background: "rgba(190,18,60,0.1)", border: "1px solid rgba(190,18,60,0.35)", color: "#be123c" }}>
          <AlertCircle size={15} /> {error}
        </p>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={filter === "all"} onClick={() => setFilter("all")} label={`All ${counts.all}`} />
          {STATUSES.map((s) => (
            <Chip
              key={s.id}
              active={filter === s.id}
              onClick={() => setFilter(s.id)}
              label={`${s.label} ${counts[s.id] ?? 0}`}
              dot={s.color}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCreating(true)} className="btn btn-primary">
            <Plus size={16} /> Add application
          </button>
          <UserButton />
        </div>
      </div>

      {/* List */}
      {!loaded ? (
        <div className="rounded-3xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <p className="text-[15px]" style={{ color: "var(--text-3)" }}>Loading applications…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <p className="text-[15px]" style={{ color: "var(--text-2)" }}>
            {apps.length === 0 ? "No applications yet. Add your first one to get started." : "Nothing in this status."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => (
            <ApplicationCard
              key={a._id}
              app={a}
              onStatus={(status) => upsert({ ...a, status })}
              onEdit={() => setEditing(a)}
              onDelete={() => remove(a._id)}
              onLetter={() => setLetterFor(a)}
              onQuestions={() => setQuestionsFor(a)}
            />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ApplicationForm
          initial={editing ?? undefined}
          onSave={upsert}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}

      {letterFor && (
        <CoverLetterStudio
          app={letterFor}
          onSaveLetter={(coverLetter) => upsert({ ...letterFor, coverLetter })}
          onClose={() => setLetterFor(null)}
        />
      )}

      {questionsFor && (
        <QuestionsStudio
          app={questionsFor}
          onSaveQuestions={(questions) => upsert({ ...questionsFor, questions })}
          onClose={() => setQuestionsFor(null)}
        />
      )}
    </div>
  );
}

function Chip({ active, onClick, label, dot }: { active: boolean; onClick: () => void; label: string; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors"
      style={{
        background: active ? "var(--accent)" : "var(--surface)",
        color: active ? "#fff" : "var(--text-2)",
        border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
      }}
    >
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: active ? "#fff" : dot }} />}
      {label}
    </button>
  );
}

function ApplicationCard({
  app,
  onStatus,
  onEdit,
  onDelete,
  onLetter,
  onQuestions,
}: {
  app: JobApplication;
  onStatus: (s: ApplicationStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
  onLetter: () => void;
  onQuestions: () => void;
}) {
  const meta = statusMeta(app.status);
  const asked = (app.questions ?? []).filter((q) => q.question.trim()).length;
  const answered = (app.questions ?? []).filter((q) => q.answer.trim()).length;
  const links = [
    app.companyWebsite && { href: app.companyWebsite, icon: Globe, label: "Website" },
    app.companyLinkedin && { href: app.companyLinkedin, icon: Linkedin, label: "LinkedIn" },
    app.jobUrl && { href: app.jobUrl, icon: ExternalLink, label: "Posting" },
  ].filter(Boolean) as { href: string; icon: React.ComponentType<{ size?: number }>; label: string }[];

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="headline text-lg" style={{ color: "var(--text)" }}>{app.role}</h3>
          <p className="text-[14px]" style={{ color: "var(--accent)" }}>
            {app.company}{app.location ? <span style={{ color: "var(--text-3)" }}> · {app.location}</span> : null}
          </p>
        </div>

        {/* Status selector */}
        <div className="relative shrink-0">
          <select
            value={app.status}
            onChange={(e) => onStatus(e.target.value as ApplicationStatus)}
            className="cursor-pointer appearance-none rounded-full py-1.5 pl-7 pr-7 text-[12px] font-semibold outline-none"
            style={{ background: `${meta.color}1f`, color: meta.color, border: `1px solid ${meta.color}55` }}
          >
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id} style={{ color: "#000" }}>{s.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full" style={{ background: meta.color }} />
        </div>
      </div>

      {app.jobDescription && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed" style={{ color: "var(--text-2)" }}>
          {app.jobDescription}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-opacity hover:opacity-70"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
            >
              <l.icon size={12} /> {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onLetter} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            <FileText size={13} /> Cover letter{app.coverLetter ? " ✓" : ""}
          </button>
          <button onClick={onQuestions} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            <MessageSquareText size={13} /> Questions{asked ? ` ${answered}/${asked}` : ""}
          </button>
          <button onClick={onEdit} className="rounded-full p-2 transition-colors hover:opacity-70" style={{ color: "var(--text-2)" }} aria-label="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="rounded-full p-2 transition-colors hover:opacity-70" style={{ color: "var(--text-2)" }} aria-label="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
