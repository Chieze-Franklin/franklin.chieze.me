import { Award as AwardIcon, BadgeCheck } from "lucide-react";
import { EntityImage } from "@/components/ui/EntityImage";
import { entityImageSrc } from "@/lib/entity-image";
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
          const hasImage = !!entityImageSrc({ image: a.image, url: a.url });
          const meta = [a.issuer, a.date ? new Date(a.date).getFullYear() : null].filter(Boolean).join(" · ");
          const chip = (
            <span
              className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-[12px] font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              title={meta || undefined}
            >
              {hasImage ? (
                <EntityImage image={a.image} url={a.url} label={a.title} size={16} rounded="rounded-full" />
              ) : (
                <Icon size={13} />
              )}
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
