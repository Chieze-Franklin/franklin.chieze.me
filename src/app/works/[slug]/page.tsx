import { notFound } from "next/navigation";
import { mockWorks } from "@/lib/mock-data";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { RelatedAwards } from "@/components/awards/RelatedAwards";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockWorks.map((w) => ({ slug: w.slug }));
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = mockWorks.find((w) => w.slug === slug);
  if (!item) notFound();

  return (
    <article className="pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto w-full">
      {item.coverImage && (
        <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-8">
          <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
        </div>
      )}

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[11px] px-3 py-0.5 rounded-full font-medium" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight" style={{ color: "var(--text-primary)" }}>
        {item.title}
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      {item.url && (
        <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-opacity hover:opacity-70" style={{ color: "var(--accent)" }}>
          <ExternalLink size={14} /> View project
        </a>
      )}

      <div style={{ color: "var(--text-secondary)" }}>
        <p className="text-base leading-relaxed">{item.content ?? item.summary}</p>
      </div>

      <RelatedAwards type="work" id={item._id} className="mt-10" />
    </article>
  );
}
