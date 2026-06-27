import { forwardRef } from "react";
import { siteConfig } from "@/config/site";

export type LetterTemplate = "classic" | "modern" | "minimal";

interface Props {
  body: string;
  company: string;
  role: string;
  template: LetterTemplate;
  accent?: string;
}

const PAGE_W = 480;
const INK = "#1a1a1a";
const SUB = "#4a4a4a";
const FAINT = "#8a8a8a";

const contacts = [
  siteConfig.socials.email,
  siteConfig.socials.linkedin.replace("https://", ""),
];

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function Body({ body }: { body: string }) {
  return (
    <div style={{ marginTop: 18, fontSize: 12, color: SUB, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
      {body || "Your generated cover letter will appear here."}
    </div>
  );
}

/* ─── CLASSIC: traditional block letter ───────────────────────── */
function Classic({ body, company, role }: Props) {
  return (
    <div style={{ padding: "46px 44px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>{siteConfig.name}</h1>
      <p style={{ fontSize: 10.5, color: FAINT, marginTop: 4 }}>{contacts.join("  ·  ")}</p>
      <div style={{ height: 1, background: "#e2e2e2", margin: "16px 0" }} />
      <p style={{ fontSize: 11, color: FAINT }}>{today()}</p>
      <p style={{ fontSize: 12, color: INK, marginTop: 14, fontWeight: 600 }}>{company}</p>
      <p style={{ fontSize: 11, color: SUB }}>Re: {role}</p>
      <Body body={body} />
    </div>
  );
}

/* ─── MODERN: accent header band ──────────────────────────────── */
function Modern({ body, company, role, accent }: Props & { accent: string }) {
  return (
    <div style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
      <header style={{ background: accent, color: "#fff", padding: "26px 40px" }}>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em" }}>{siteConfig.name}</h1>
        <p style={{ fontSize: 10.5, opacity: 0.9, marginTop: 6 }}>{contacts.join("   ·   ")}</p>
      </header>
      <div style={{ padding: "26px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <p style={{ fontSize: 12, color: INK, fontWeight: 700 }}>{company}</p>
            <p style={{ fontSize: 10.5, color: accent }}>Re: {role}</p>
          </div>
          <p style={{ fontSize: 10.5, color: FAINT }}>{today()}</p>
        </div>
        <Body body={body} />
      </div>
    </div>
  );
}

/* ─── MINIMAL: clean, centered ────────────────────────────────── */
function Minimal({ body, company, role, accent }: Props & { accent: string }) {
  return (
    <div style={{ padding: "46px 44px", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: accent, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {siteConfig.name}
        </h1>
        <p style={{ fontSize: 10, color: FAINT, marginTop: 5 }}>{contacts.join("   ·   ")}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 22 }}>
        <div>
          <p style={{ fontSize: 12, color: INK, fontWeight: 700 }}>{company}</p>
          <p style={{ fontSize: 10.5, color: SUB }}>Re: {role}</p>
        </div>
        <p style={{ fontSize: 10.5, color: FAINT }}>{today()}</p>
      </div>
      <Body body={body} />
    </div>
  );
}

export const CoverLetterPreview = forwardRef<HTMLDivElement, Props>(function CoverLetterPreview(props, ref) {
  const accent = props.accent ?? "#0071e3";
  return (
    <div
      ref={ref}
      style={{ width: PAGE_W, background: "#fff", color: INK, boxShadow: "0 10px 40px rgba(0,0,0,0.25)", overflow: "hidden" }}
    >
      {props.template === "classic" && <Classic {...props} />}
      {props.template === "modern" && <Modern {...props} accent={accent} />}
      {props.template === "minimal" && <Minimal {...props} accent={accent} />}
    </div>
  );
});
