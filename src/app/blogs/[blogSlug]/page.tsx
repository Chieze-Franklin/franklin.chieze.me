import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { getBlogBySlug } from "@/lib/blogs";
import { getThoughtsList } from "@/lib/thoughts";
import { BlogArticles } from "@/components/blog/BlogArticles";

interface Props {
  params: Promise<{ blogSlug: string }>;
}

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: Props) {
  const { blogSlug } = await params;
  const blog = await getBlogBySlug(blogSlug);
  if (!blog) notFound();

  const { items } = await getThoughtsList({ blog: blogSlug, limit: 100 });

  return (
    <div className="pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {blog.coverImage && (
        <div className="relative h-48 sm:h-60 w-full overflow-hidden rounded-3xl mb-8" style={{ border: "1px solid var(--card-border)" }}>
          <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 1200px" priority />
        </div>
      )}

      <header className="mb-10 flex items-start gap-4">
        {blog.logo && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl" style={{ border: "1px solid var(--card-border)" }}>
            <Image src={blog.logo} alt="" fill className="object-contain" sizes="64px" />
          </div>
        )}
        <div className="min-w-0">
          <p className="eyebrow mb-1" style={{ color: "var(--accent)" }}>
            Blog
          </p>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: "var(--text-primary)" }}>
            {blog.title}
          </h1>
          {blog.description && (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {blog.description}
            </p>
          )}
          {blog.url && (
            <a
              href={blog.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              Visit blog <ExternalLink size={14} />
            </a>
          )}
        </div>
      </header>

      <BlogArticles items={items} />
    </div>
  );
}
