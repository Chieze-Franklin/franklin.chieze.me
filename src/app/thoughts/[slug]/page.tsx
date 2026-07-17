import { notFound } from "next/navigation";
import Image from "next/image";
import { Clock, ExternalLink } from "lucide-react";
import { getThoughtBySlug } from "@/lib/thoughts";
import { ProjectSections } from "@/components/detail/ProjectSections";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { article: "Article", blog: "Blog post", vlog: "Vlog" };

export default async function ThoughtDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getThoughtBySlug(slug);
  if (!item) notFound();

  const links = item.links ?? [];

  return (
    <article className="pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto w-full">
      {/* Vlog embed takes priority over a static cover image */}
      {item.type === "vlog" && item.videoUrl ? (
        <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8">
          <iframe
            src={item.videoUrl.replace("watch?v=", "embed/")}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : (
        item.coverImage && (
          <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-8">
            <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
          </div>
        )
      )}

      <span className="eyebrow" style={{ color: "var(--accent)" }}>
        {TYPE_LABEL[item.type] ?? "Article"}
      </span>
      <h1
        className="mt-2 text-3xl sm:text-4xl font-black mb-3 leading-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {item.title}
      </h1>
      <div className="flex items-center flex-wrap gap-4 text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        <span>
          {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        {item.readingTime && (
          <span className="flex items-center gap-1">
            <Clock size={13} /> {item.readingTime} min read
          </span>
        )}
      </div>

      {(item.url || links.length > 0) && (
        <div className="mb-8 flex flex-wrap items-center gap-2.5">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <ExternalLink size={15} /> Read original
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
      )}

      {/* Article body */}
      <div className="mb-10" style={{ color: "var(--text-secondary)" }}>
        <p className="text-base leading-relaxed whitespace-pre-line">{item.content || item.summary}</p>
      </div>

      <ProjectSections
        title={item.title}
        summary={item.summary}
        images={item.images}
        tags={item.tags}
        skills={item.skills}
        tools={item.tools}
        awards={item.awards}
        showAbout={false}
      />
    </article>
  );
}
