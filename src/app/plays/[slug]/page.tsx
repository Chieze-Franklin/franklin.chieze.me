import { notFound } from "next/navigation";
import { mockPlays } from "@/lib/mock-data";
import Image from "next/image";
import { RelatedAwards } from "@/components/awards/RelatedAwards";
import { ExternalLink } from "lucide-react";
function GithubIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockPlays.map((p) => ({ slug: p.slug }));
}

export default async function PlayDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = mockPlays.find((p) => p.slug === slug);
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

      <div className="flex gap-4 mb-8">
        {item.url && (
          <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: "var(--accent)" }}>
            <ExternalLink size={14} /> Live demo
          </a>
        )}
        {item.repoUrl && (
          <a href={item.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
            <GithubIcon /> Source code
          </a>
        )}
      </div>

      <div style={{ color: "var(--text-secondary)" }}>
        <p className="text-base leading-relaxed">{item.content ?? item.summary}</p>
      </div>

      <RelatedAwards type="play" id={item._id} className="mt-10" />
    </article>
  );
}
