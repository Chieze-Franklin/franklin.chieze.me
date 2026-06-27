import { forwardRef } from "react";
import { siteConfig } from "@/config/site";
import type { ResumeEntry, Education, Publication, Award, Hobby } from "@/types";

export type ResumeTemplate =
  | "minimal"
  | "classic"
  | "modern"
  | "timeline"
  | "compact"
  | "elegant";

export interface ResumeSections {
  intro?: string;
  education?: Education[];
  publications?: Publication[];
  awards?: Award[];
  hobbies?: Hobby[];
}

interface Props extends ResumeSections {
  entries: ResumeEntry[];
  template: ResumeTemplate;
  accent: string;
}

const PAGE_W = 480;
const INK = "#1a1a1a";
const SUB = "#5a5a5a";
const FAINT = "#8a8a8a";
const LINE = "#e2e2e2";

function range(e: { startDate: string; endDate?: string }) {
  const y = (d: string) => new Date(d).getFullYear();
  return `${y(e.startDate)} – ${e.endDate ? y(e.endDate) : "Present"}`;
}

const contacts = [
  siteConfig.socials.email,
  siteConfig.socials.linkedin.replace("https://", ""),
  siteConfig.socials.github.replace("https://", ""),
];

function Label({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, margin: "0 0 10px" }}>
      {children}
    </p>
  );
}

/* ─── Shared section renderers (used across templates) ─────────── */

function Intro({ intro }: { intro: string }) {
  return <p style={{ fontSize: 11.5, color: SUB, lineHeight: 1.55, marginBottom: 4 }}>{intro}</p>;
}

function EducationBlock({ items, accent }: { items: Education[]; accent: string }) {
  return (
    <div style={{ marginTop: 20 }}>
      <Label accent={accent}>Education</Label>
      {items.map((ed) => (
        <div key={ed._id} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{ed.degree}</span>
            <span style={{ fontSize: 10, color: FAINT }}>{range(ed)}</span>
          </div>
          <p style={{ fontSize: 11.5, fontWeight: 600, color: accent, marginTop: 1 }}>
            {ed.institution}{ed.field ? ` · ${ed.field}` : ""}
          </p>
          {ed.description && <p style={{ fontSize: 11, color: SUB, marginTop: 4, lineHeight: 1.5 }}>{ed.description}</p>}
        </div>
      ))}
    </div>
  );
}

function PublicationsBlock({ items, accent }: { items: Publication[]; accent: string }) {
  return (
    <div style={{ marginTop: 20 }}>
      <Label accent={accent}>Publications &amp; Research</Label>
      {items.map((p) => (
        <div key={p._id} style={{ marginBottom: 11 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: INK, lineHeight: 1.35 }}>{p.title}</p>
          <p style={{ fontSize: 10.5, color: SUB, marginTop: 1 }}>
            {p.authors.join(", ")} · <span style={{ color: accent }}>{p.venue}</span>, {p.year}
          </p>
        </div>
      ))}
    </div>
  );
}

function AwardsBlock({ items, accent }: { items: Award[]; accent: string }) {
  return (
    <div style={{ marginTop: 20 }}>
      <Label accent={accent}>Awards &amp; Certifications</Label>
      {items.map((a) => (
        <div key={a._id} style={{ marginBottom: 9 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{a.title}</span>
            <span style={{ fontSize: 10, color: FAINT }}>{new Date(a.date).getFullYear()}</span>
          </div>
          <p style={{ fontSize: 10.5, color: SUB, marginTop: 1 }}>
            {a.issuer}
            {a.credentialId ? ` · ${a.credentialId}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

function HobbiesBlock({ items, accent }: { items: Hobby[]; accent: string }) {
  return (
    <div style={{ marginTop: 20 }}>
      <Label accent={accent}>Interests</Label>
      <p style={{ fontSize: 11, color: SUB, lineHeight: 1.6 }}>{items.map((h) => h.name).join(" · ")}</p>
    </div>
  );
}

/* Extra sections rendered in document order (everything after experience). */
function ExtraSections({ accent, education, publications, awards, hobbies }: ResumeSections & { accent: string }) {
  return (
    <>
      {education && education.length > 0 && <EducationBlock items={education} accent={accent} />}
      {publications && publications.length > 0 && <PublicationsBlock items={publications} accent={accent} />}
      {awards && awards.length > 0 && <AwardsBlock items={awards} accent={accent} />}
      {hobbies && hobbies.length > 0 && <HobbiesBlock items={hobbies} accent={accent} />}
    </>
  );
}

/* ─────────────────────────── MINIMAL ─────────────────────────── */
function Minimal({ entries, accent, intro, education, publications, awards, hobbies }: Props) {
  return (
    <div style={{ padding: "44px 40px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: accent, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {siteConfig.name}
      </h1>
      <p style={{ fontSize: 12, color: SUB, marginTop: 4 }}>{siteConfig.tagline}</p>
      <p style={{ fontSize: 10.5, color: FAINT, marginTop: 8 }}>{contacts.join("  ·  ")}</p>

      <div style={{ height: 1, background: LINE, margin: "20px 0" }} />

      {intro && (
        <div style={{ marginBottom: 18 }}>
          <Label accent={accent}>Profile</Label>
          <Intro intro={intro} />
        </div>
      )}

      <Label accent={accent}>Experience</Label>
      {entries.map((e) => (
        <div key={e._id} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{e.title}</span>
            <span style={{ fontSize: 10.5, color: FAINT }}>{range(e)}</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: accent, marginTop: 1 }}>{e.company}</p>
          <p style={{ fontSize: 11.5, color: SUB, marginTop: 5, lineHeight: 1.5 }}>{e.description}</p>
          {e.highlights && e.highlights.length > 0 && (
            <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
              {e.highlights.map((h, i) => (
                <li key={i} style={{ fontSize: 11, color: SUB, lineHeight: 1.5 }}>{h}</li>
              ))}
            </ul>
          )}
          <p style={{ fontSize: 10.5, color: FAINT, marginTop: 6 }}>{[...e.skills, ...e.tools].join(" · ")}</p>
        </div>
      ))}

      <ExtraSections accent={accent} education={education} publications={publications} awards={awards} hobbies={hobbies} />
    </div>
  );
}

/* ─────────────────────────── CLASSIC ─────────────────────────── */
function Classic({ entries, accent, intro, education, publications, awards, hobbies }: Props) {
  const allSkills = Array.from(new Set(entries.flatMap((e) => e.skills)));
  const allTools = Array.from(new Set(entries.flatMap((e) => e.tools)));
  return (
    <div style={{ display: "flex", fontFamily: "Helvetica, Arial, sans-serif", minHeight: 620 }}>
      {/* Sidebar */}
      <aside style={{ width: "36%", background: "#f4f4f5", padding: "36px 22px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {siteConfig.name}
        </h1>
        <div style={{ height: 3, width: 36, background: accent, margin: "12px 0 16px" }} />

        <Label accent={accent}>Contact</Label>
        {contacts.map((c) => (
          <p key={c} style={{ fontSize: 10, color: SUB, marginBottom: 4, wordBreak: "break-all" }}>{c}</p>
        ))}

        <div style={{ height: 14 }} />
        <Label accent={accent}>Skills</Label>
        {allSkills.map((s) => (
          <p key={s} style={{ fontSize: 10.5, color: SUB, marginBottom: 3 }}>{s}</p>
        ))}

        <div style={{ height: 14 }} />
        <Label accent={accent}>Tools</Label>
        {allTools.map((t) => (
          <p key={t} style={{ fontSize: 10.5, color: SUB, marginBottom: 3 }}>{t}</p>
        ))}

        {hobbies && hobbies.length > 0 && (
          <>
            <div style={{ height: 14 }} />
            <Label accent={accent}>Interests</Label>
            {hobbies.map((h) => (
              <p key={h._id} style={{ fontSize: 10.5, color: SUB, marginBottom: 3 }}>{h.name}</p>
            ))}
          </>
        )}
      </aside>

      {/* Main */}
      <main style={{ width: "64%", padding: "36px 26px" }}>
        {intro && (
          <div style={{ marginBottom: 18 }}>
            <Label accent={accent}>Profile</Label>
            <Intro intro={intro} />
          </div>
        )}

        <Label accent={accent}>Experience</Label>
        {entries.map((e) => (
          <div key={e._id} style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{e.title}</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 1 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: accent }}>{e.company}</span>
              <span style={{ fontSize: 10, color: FAINT }}>{range(e)}</span>
            </div>
            <p style={{ fontSize: 11, color: SUB, marginTop: 5, lineHeight: 1.5 }}>{e.description}</p>
            {e.highlights && e.highlights.length > 0 && (
              <ul style={{ margin: "5px 0 0", paddingLeft: 15 }}>
                {e.highlights.map((h, i) => (
                  <li key={i} style={{ fontSize: 10.5, color: SUB, lineHeight: 1.45 }}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* Education, publications, awards live in the main column (hobbies in sidebar) */}
        <ExtraSections accent={accent} education={education} publications={publications} awards={awards} />
      </main>
    </div>
  );
}

/* ─────────────────────────── MODERN ──────────────────────────── */
function Modern({ entries, accent, intro, education, publications, awards, hobbies }: Props) {
  return (
    <div style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
      <header style={{ background: accent, color: "#fff", padding: "32px 40px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {siteConfig.name}
        </h1>
        <p style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>{siteConfig.tagline}</p>
        <p style={{ fontSize: 10.5, opacity: 0.85, marginTop: 10 }}>{contacts.join("   ·   ")}</p>
      </header>

      <div style={{ padding: "30px 40px" }}>
        {intro && (
          <div style={{ marginBottom: 20 }}>
            <Label accent={accent}>Profile</Label>
            <Intro intro={intro} />
          </div>
        )}

        <Label accent={accent}>Experience</Label>
        {entries.map((e) => (
          <div key={e._id} style={{ paddingLeft: 16, borderLeft: `3px solid ${accent}`, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{e.title}</span>
              <span style={{ fontSize: 10.5, color: FAINT }}>{range(e)}</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: accent, marginTop: 1 }}>{e.company}</p>
            <p style={{ fontSize: 11.5, color: SUB, marginTop: 5, lineHeight: 1.5 }}>{e.description}</p>
            {e.highlights && e.highlights.length > 0 && (
              <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                {e.highlights.map((h, i) => (
                  <li key={i} style={{ fontSize: 11, color: SUB, lineHeight: 1.5 }}>{h}</li>
                ))}
              </ul>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {[...e.skills, ...e.tools].map((t) => (
                <span key={t} style={{ fontSize: 9.5, color: accent, background: `${accent}1a`, padding: "2px 8px", borderRadius: 99 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}

        <ExtraSections accent={accent} education={education} publications={publications} awards={awards} hobbies={hobbies} />
      </div>
    </div>
  );
}

/* ─────────────────────────── TIMELINE ────────────────────────── */
function Timeline({ entries, accent, intro, education, publications, awards, hobbies }: Props) {
  return (
    <div style={{ padding: "40px 40px", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontSize: 27, fontWeight: 800, color: INK, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {siteConfig.name}
      </h1>
      <p style={{ fontSize: 12, color: accent, fontWeight: 600, marginTop: 3 }}>{siteConfig.tagline}</p>
      <p style={{ fontSize: 10.5, color: FAINT, marginTop: 8 }}>{contacts.join("  ·  ")}</p>

      <div style={{ height: 1, background: LINE, margin: "20px 0" }} />

      {intro && (
        <div style={{ marginBottom: 20 }}>
          <Label accent={accent}>Profile</Label>
          <Intro intro={intro} />
        </div>
      )}

      <Label accent={accent}>Experience</Label>
      <div style={{ borderLeft: `2px solid ${accent}33`, marginLeft: 4, marginTop: 2 }}>
        {entries.map((e) => (
          <div key={e._id} style={{ position: "relative", paddingLeft: 22, paddingBottom: 2, marginBottom: 16 }}>
            <span
              style={{
                position: "absolute", left: -6, top: 3, width: 9, height: 9, borderRadius: 99,
                background: accent, boxShadow: `0 0 0 3px #fff`,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{e.title}</span>
              <span style={{ fontSize: 10, color: FAINT }}>{range(e)}</span>
            </div>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: accent, marginTop: 1 }}>{e.company}</p>
            <p style={{ fontSize: 11, color: SUB, marginTop: 4, lineHeight: 1.5 }}>{e.description}</p>
            {e.highlights && e.highlights.length > 0 && (
              <ul style={{ margin: "5px 0 0", paddingLeft: 15 }}>
                {e.highlights.map((h, i) => (
                  <li key={i} style={{ fontSize: 10.5, color: SUB, lineHeight: 1.45 }}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <ExtraSections accent={accent} education={education} publications={publications} awards={awards} hobbies={hobbies} />
    </div>
  );
}

/* ─────────────────────────── COMPACT ─────────────────────────── */
function Compact({ entries, accent, intro, education, publications, awards, hobbies }: Props) {
  return (
    <div style={{ padding: "30px 34px", fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Header row: name left, contacts right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `2px solid ${accent}`, paddingBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {siteConfig.name}
          </h1>
          <p style={{ fontSize: 10.5, color: accent, fontWeight: 600, marginTop: 2 }}>{siteConfig.tagline}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          {contacts.map((c) => (
            <p key={c} style={{ fontSize: 9, color: FAINT, lineHeight: 1.5 }}>{c}</p>
          ))}
        </div>
      </div>

      {intro && <p style={{ fontSize: 10.5, color: SUB, lineHeight: 1.5, marginTop: 12 }}>{intro}</p>}

      <div style={{ marginTop: 14 }}>
        <Label accent={accent}>Experience</Label>
        {entries.map((e) => (
          <div key={e._id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>
                {e.title} <span style={{ color: accent, fontWeight: 600 }}>· {e.company}</span>
              </span>
              <span style={{ fontSize: 9.5, color: FAINT }}>{range(e)}</span>
            </div>
            <p style={{ fontSize: 10.5, color: SUB, marginTop: 2, lineHeight: 1.45 }}>{e.description}</p>
            {e.highlights && e.highlights.length > 0 && (
              <ul style={{ margin: "3px 0 0", paddingLeft: 14 }}>
                {e.highlights.map((h, i) => (
                  <li key={i} style={{ fontSize: 10, color: SUB, lineHeight: 1.4 }}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <ExtraSections accent={accent} education={education} publications={publications} awards={awards} hobbies={hobbies} />
    </div>
  );
}

/* ─────────────────────────── ELEGANT ─────────────────────────── */
function Elegant({ entries, accent, intro, education, publications, awards, hobbies }: Props) {
  return (
    <div style={{ padding: "44px 44px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Centered header with double hairline */}
      <div style={{ textAlign: "center" }}>
        <div style={{ height: 1, background: accent, marginBottom: 14 }} />
        <h1 style={{ fontSize: 30, fontWeight: 700, color: INK, letterSpacing: "0.02em", lineHeight: 1.05 }}>
          {siteConfig.name}
        </h1>
        <p style={{ fontSize: 11.5, color: SUB, fontStyle: "italic", marginTop: 6 }}>{siteConfig.tagline}</p>
        <p style={{ fontSize: 10, color: FAINT, marginTop: 8, letterSpacing: "0.04em" }}>{contacts.join("   •   ")}</p>
        <div style={{ height: 1, background: accent, marginTop: 14 }} />
      </div>

      {intro && (
        <p style={{ fontSize: 11.5, color: SUB, lineHeight: 1.6, marginTop: 18, textAlign: "center", fontStyle: "italic" }}>
          {intro}
        </p>
      )}

      <div style={{ marginTop: 22 }}>
        <ElegantLabel accent={accent}>Experience</ElegantLabel>
        {entries.map((e) => (
          <div key={e._id} style={{ marginBottom: 15 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{e.title}</span>
              <span style={{ fontSize: 10.5, color: FAINT, fontStyle: "italic" }}>{range(e)}</span>
            </div>
            <p style={{ fontSize: 12, color: accent, marginTop: 1, fontStyle: "italic" }}>{e.company}</p>
            <p style={{ fontSize: 11.5, color: SUB, marginTop: 5, lineHeight: 1.55 }}>{e.description}</p>
            {e.highlights && e.highlights.length > 0 && (
              <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                {e.highlights.map((h, i) => (
                  <li key={i} style={{ fontSize: 11, color: SUB, lineHeight: 1.5 }}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <ExtraSections accent={accent} education={education} publications={publications} awards={awards} hobbies={hobbies} />
    </div>
  );
}

/* Centered serif section label for the Elegant template */
function ElegantLabel({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: INK }}>
        {children}
      </span>
      <div style={{ width: 28, height: 2, background: accent, margin: "6px auto 0" }} />
    </div>
  );
}

export const ResumePreview = forwardRef<HTMLDivElement, Props>(function ResumePreview(props, ref) {
  const { template } = props;
  return (
    <div
      ref={ref}
      style={{
        width: PAGE_W,
        background: "#ffffff",
        color: INK,
        boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}
    >
      {template === "minimal" && <Minimal {...props} />}
      {template === "classic" && <Classic {...props} />}
      {template === "modern" && <Modern {...props} />}
      {template === "timeline" && <Timeline {...props} />}
      {template === "compact" && <Compact {...props} />}
      {template === "elegant" && <Elegant {...props} />}
    </div>
  );
});
