import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { getWorkBySlug } from "@/lib/works";
import { workStatusMeta } from "@/lib/work-status";
import { ProjectSections } from "@/components/detail/ProjectSections";
import { EntityImage } from "@/components/ui/EntityImage";

const fmtMonth = (d: string) => new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

interface Props {
  params: Promise<{ slug: string }>;
}

// Works are database-backed and change at runtime — render on demand.
export const dynamic = "force-dynamic";

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getWorkBySlug(slug);
  if (!item) notFound();

  const links = item.links ?? [];
  const status = workStatusMeta(item.status);
  const dateRange = item.startDate
    ? `${fmtMonth(item.startDate)} – ${item.endDate ? fmtMonth(item.endDate) : "Present"}`
    : "";

  return (
    <article className="pt-24 pb-20 px-4 sm:px-8 max-w-4xl mx-auto w-full">
      {/* ── App header: icon + title + primary actions ─────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
        {item.coverImage && (
          <div
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[22px]"
            style={{ border: "1px solid var(--card-border)" }}
          >
            <Image src={item.coverImage} alt={item.title} fill className="object-cover" sizes="96px" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: "var(--text-primary)" }}>
            {item.title}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            {item.summary}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ background: `${status.color}1a`, color: status.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
              {status.label}
            </span>
            {dateRange && (
              <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
                {dateRange}
              </span>
            )}
          </div>
          {item.company && (
            <div className="mt-1.5 flex items-center gap-2">
              <EntityImage image={item.company.logo} url={item.company.url} label={item.company.name} size={20} />
              <span className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
                {item.company.url ? (
                  <a href={item.company.url} target="_blank" rel="noreferrer" className="hover:opacity-70">
                    {item.company.name}
                  </a>
                ) : (
                  item.company.name
                )}
              </span>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                <ExternalLink size={15} /> Visit
              </a>
            )}
            {links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--line)" }}
              >
                {l.label || "Link"}
              </a>
            ))}
          </div>
        </div>
      </header>

      <ProjectSections
        title={item.title}
        summary={item.summary}
        content={item.content}
        images={item.images}
        tags={item.tags}
        skills={item.skills}
        tools={item.tools}
        awards={item.awards}
      />
    </article>
  );
}
