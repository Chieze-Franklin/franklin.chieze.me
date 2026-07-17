import Link from "next/link";
import { Award as AwardIcon, BadgeCheck, ExternalLink } from "lucide-react";
import type { Award, RelatedRefType } from "@/types";

const refPath: Record<RelatedRefType, string> = {
  work: "/works",
  play: "/plays",
  thought: "/thoughts",
  news: "/news",
  experience: "/cv",
};

export function AwardCard({ award }: { award: Award }) {
  const isCert = award.kind === "certification";
  const Icon = isCert ? BadgeCheck : AwardIcon;

  return (
    <article className="card p-5">
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Icon size={17} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="headline text-base" style={{ color: "var(--text)" }}>
              {award.title}
            </h3>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
            >
              {isCert ? "Cert" : "Award"}
            </span>
          </div>

          {(award.issuer || award.date) && (
            <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-2)" }}>
              {[
                award.issuer,
                award.date
                  ? new Date(award.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          {award.description && (
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-2)" }}>
              {award.description}
            </p>
          )}

          {award.credentialId && (
            <p className="mt-2 text-[11px]" style={{ color: "var(--text-3)" }}>
              Credential ID: {award.credentialId}
            </p>
          )}

          {/* Related items */}
          {award.related && award.related.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {award.related.map((r) => (
                <Link
                  key={`${r.type}-${r.id}`}
                  href={refPath[r.type]}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                  style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
                >
                  {r.label}
                </Link>
              ))}
            </div>
          )}

          {award.url && (
            <a
              href={award.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              View credential <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
