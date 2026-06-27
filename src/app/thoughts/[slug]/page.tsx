import { notFound } from "next/navigation";
import { mockThoughts } from "@/lib/mock-data";
import Image from "next/image";
import { Clock } from "lucide-react";
import { RelatedAwards } from "@/components/awards/RelatedAwards";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockThoughts.map((t) => ({ slug: t.slug }));
}

export default async function ThoughtDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = mockThoughts.find((t) => t.slug === slug);
  if (!item) notFound();

  return (
    <article className="pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto w-full">
      {item.coverImage && (
        <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-8">
          <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
        </div>
      )}

      {item.type === "vlog" && item.videoUrl && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8">
          <iframe
            src={item.videoUrl.replace("watch?v=", "embed/")}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
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
      <div className="flex items-center gap-4 text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        <span>{new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
        {item.readingTime && (
          <span className="flex items-center gap-1">
            <Clock size={13} /> {item.readingTime} min read
          </span>
        )}
      </div>

      <div style={{ color: "var(--text-secondary)" }}>
        <p className="text-base leading-relaxed">{item.content ?? item.summary}</p>
      </div>

      <RelatedAwards type="thought" id={item._id} className="mt-10" />
    </article>
  );
}
