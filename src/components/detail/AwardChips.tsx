import { Award as AwardIcon, BadgeCheck } from "lucide-react";
import type { Award } from "@/types";

/** Recognition chips (awards/certifications) shared across detail pages. */
export function AwardChips({ awards, label = "Recognition", className = "" }: {
  awards: Award[];
  label?: string;
  className?: string;
}) {
  if (awards.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="eyebrow mb-2.5" style={{ color: "var(--text-3)" }}>
        {label}
      </h2>
      <div className="flex flex-wrap gap-2">
        {awards.map((a) => {
          const Icon = a.kind === "certification" ? BadgeCheck : AwardIcon;
          const meta = [a.issuer, a.date ? new Date(a.date).getFullYear() : null].filter(Boolean).join(" · ");
          const chip = (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              title={meta || undefined}
            >
              <Icon size={13} />
              {a.title}
            </span>
          );
          return a.url ? (
            <a key={a._id} href={a.url} target="_blank" rel="noreferrer" className="transition-opacity hover:opacity-70">
              {chip}
            </a>
          ) : (
            <div key={a._id}>{chip}</div>
          );
        })}
      </div>
    </section>
  );
}
