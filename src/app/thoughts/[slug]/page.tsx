import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, ExternalLink, Eye } from "lucide-react";
import { getThoughtForReader } from "@/lib/thoughts";
import { ProjectSections } from "@/components/detail/ProjectSections";
import { ArticleContent } from "@/components/detail/ArticleContent";
import { RegisterArticle } from "@/components/ai/RegisterArticle";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function ThoughtDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getThoughtForReader(slug);
  if (!item) notFound();

  const links = item.links ?? [];
  const isMedia = item.contentType === "video" || item.contentType === "audio";
  const showCanonicalLink = !isMedia && item.contentSource === "inline" && item.url;

  return (
    <article className="pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto w-full">
      {/* Register the article so the chat widget can answer questions about it. */}
      <RegisterArticle title={item.title} summary={item.summary} content={item.content ?? item.summary} slug={item.slug} />

      {/* Media renders as the hero; otherwise show the cover image. */}
      {isMedia ? (
        <ArticleContent item={item} />
      ) : (
        item.coverImage && (
          <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-8">
            <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
          </div>
        )
      )}

      {item.blog ? (
        <Link href={`/blogs/${item.blog.slug}`} className="eyebrow transition-opacity hover:opacity-70" style={{ color: "var(--accent)" }}>
          {item.blog.title}
        </Link>
      ) : (
        <span className="eyebrow" style={{ color: "var(--accent)" }}>
          Article
        </span>
      )}

      <h1 className="mt-2 text-3xl sm:text-4xl font-black mb-3 leading-tight" style={{ color: "var(--text-primary)" }}>
        {item.title}
      </h1>

      <div className="flex items-center flex-wrap gap-4 text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        <span>
          {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        {item.readingTime ? (
          <span className="flex items-center gap-1">
            <Clock size={13} /> {item.readingTime} min read
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <Eye size={13} /> {item.views ?? 0} view{(item.views ?? 0) === 1 ? "" : "s"}
        </span>
      </div>

      {(showCanonicalLink || links.length > 0) && (
        <div className="mb-8 flex flex-wrap items-center gap-2.5">
          {showCanonicalLink && (
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

      {/* Body (text types); media already rendered above. */}
      {!isMedia && (
        <div className="mb-10">
          <ArticleContent item={item} />
        </div>
      )}

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
