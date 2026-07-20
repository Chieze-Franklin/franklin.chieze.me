"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, ArrowRight } from "lucide-react";
import { ResumeEntryCard } from "@/components/resume/ResumeEntry";
import { SkillToolModal } from "@/components/resume/SkillToolModal";
import { ResumeDownloadModal } from "@/components/resume/ResumeDownloadModal";
import { AwardCard } from "@/components/awards/AwardCard";
import { Markdown } from "@/components/ui/Markdown";
import { EntityImage } from "@/components/ui/EntityImage";
import type {
  ResumeEntry,
  Education,
  Publication,
  Award,
  Hobby,
  Skill,
  Tool,
} from "@/types";

interface Props {
  intro: string;
  entries: ResumeEntry[];
  education: Education[];
  publications: Publication[];
  skills: Skill[];
  tools: Tool[];
  awards: Award[];
  hobbies: Hobby[];
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="headline text-xl" style={{ color: "var(--text)" }}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function year(d: string) {
  return new Date(d).getFullYear();
}

export function CV({ intro, entries, education, publications, skills, tools, awards, hobbies }: Props) {
  const [chip, setChip] = useState<{ name: string; type: "skill" | "tool" } | null>(null);
  const [showDownload, setShowDownload] = useState(false);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-28">
      {/* Intro + download */}
      <div className="flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-start sm:justify-between" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--text-2)" }}>
          <Markdown>{intro}</Markdown>
        </div>
        <button onClick={() => setShowDownload(true)} className="btn btn-primary shrink-0">
          <Download size={16} /> Download CV
        </button>
      </div>

      {/* Experience */}
      <Section title="Experience">
        <div className="flex flex-col gap-4">
          {entries.map((e) => (
            <ResumeEntryCard key={e._id} entry={e} onChipClick={(name, type) => setChip({ name, type })} />
          ))}
        </div>
      </Section>

      {/* Skills & tools (database-backed) */}
      {(skills.length > 0 || tools.length > 0) && (
        <Section title="Skills & tools">
          <div className="grid gap-6 sm:grid-cols-2">
            {skills.length > 0 && (
              <div>
                <p className="eyebrow mb-2.5" style={{ color: "var(--text-3)" }}>
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s._id}
                      className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-[13px] font-medium"
                      style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
                      title={s.description}
                    >
                      <EntityImage image={s.image} url={s.url} label={s.name} size={18} />
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tools.length > 0 && (
              <div>
                <p className="eyebrow mb-2.5" style={{ color: "var(--text-3)" }}>
                  Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((t) =>
                    t.url ? (
                      <a
                        key={t._id}
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-[13px] font-medium transition-opacity hover:opacity-70"
                        style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
                        title={t.description}
                      >
                        <EntityImage image={t.image} url={t.url} label={t.name} size={18} />
                        {t.name}
                      </a>
                    ) : (
                      <span
                        key={t._id}
                        className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-[13px] font-medium"
                        style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
                        title={t.description}
                      >
                        <EntityImage image={t.image} url={t.url} label={t.name} size={18} />
                        {t.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Education */}
      <Section title="Academic background">
        <div className="flex flex-col gap-3">
          {education.map((ed) => (
            <div key={ed._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="headline text-base" style={{ color: "var(--text)" }}>
                  {ed.degree}
                </h3>
                <span className="shrink-0 text-[12px]" style={{ color: "var(--text-3)" }}>
                  {year(ed.startDate)}{ed.endDate ? `–${year(ed.endDate)}` : "–present"}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] font-medium" style={{ color: "var(--accent)" }}>
                {ed.institution}{ed.field ? ` · ${ed.field}` : ""}
              </p>
              {ed.location && (
                <p className="text-[12px]" style={{ color: "var(--text-3)" }}>{ed.location}</p>
              )}
              {ed.description && (
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {ed.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Publications */}
      <Section title="Publications & research">
        <div className="flex flex-col gap-3">
          {publications.map((p) => (
            <div key={p._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="headline text-[15px] leading-snug" style={{ color: "var(--text)" }}>
                  {p.title}
                </h3>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>
                  {p.type}
                </span>
              </div>
              <p className="mt-1 text-[13px]" style={{ color: "var(--text-2)" }}>
                {p.authors.join(", ")} · <span style={{ color: "var(--accent)" }}>{p.venue}</span>, {p.year}
              </p>
              {p.description && (
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {p.description}
                </p>
              )}
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70" style={{ color: "var(--accent)" }}>
                  Read paper <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Awards & certifications */}
      {awards.length > 0 && (
        <Section
          title="Awards & certifications"
          action={
            <Link
              href="/awards"
              className="inline-flex items-center gap-1 text-[13px] font-medium transition-transform hover:translate-x-0.5"
              style={{ color: "var(--accent)" }}
            >
              See all <ArrowRight size={14} />
            </Link>
          }
        >
          <div className="flex flex-col gap-3">
            {awards.slice(0, 3).map((a) => (
              <AwardCard key={a._id} award={a} />
            ))}
          </div>
        </Section>
      )}

      {/* Hobbies */}
      <Section title="Hobbies & interests">
        <div className="flex flex-wrap gap-2.5">
          {hobbies.map((h) => (
            <span
              key={h._id}
              className="rounded-2xl px-4 py-2.5 text-[13px]"
              style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text-2)" }}
              title={h.description}
            >
              <span className="font-medium" style={{ color: "var(--text)" }}>{h.name}</span>
              {h.description ? ` — ${h.description}` : ""}
            </span>
          ))}
        </div>
      </Section>

      {/* Modals */}
      {chip && (
        <SkillToolModal name={chip.name} type={chip.type} entries={entries} onClose={() => setChip(null)} />
      )}
      {showDownload && (
        <ResumeDownloadModal
          entries={entries}
          intro={intro}
          education={education}
          publications={publications}
          awards={awards}
          hobbies={hobbies}
          onClose={() => setShowDownload(false)}
        />
      )}
    </div>
  );
}
