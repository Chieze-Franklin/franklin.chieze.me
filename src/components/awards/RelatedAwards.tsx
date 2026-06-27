import { Award as AwardIcon, BadgeCheck } from "lucide-react";
import { awardsFor } from "@/lib/awards";
import type { RelatedRefType } from "@/types";

/** Compact list of awards/certifications associated with an item. */
export function RelatedAwards({
  type,
  id,
  label = "Recognition",
  className = "",
}: {
  type: RelatedRefType;
  id: string;
  label?: string;
  className?: string;
}) {
  const awards = awardsFor(type, id);
  if (awards.length === 0) return null;

  return (
    <div className={className}>
      <p className="eyebrow mb-2.5" style={{ color: "var(--text-3)" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {awards.map((a) => {
          const Icon = a.kind === "certification" ? BadgeCheck : AwardIcon;
          return (
            <span
              key={a._id}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              title={`${a.issuer} · ${new Date(a.date).getFullYear()}`}
            >
              <Icon size={13} />
              {a.title}
            </span>
          );
        })}
      </div>
    </div>
  );
}
