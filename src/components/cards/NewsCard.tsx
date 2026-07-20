import Link from "next/link";
import Image from "next/image";
import type { NewsItem } from "@/types";

const sizeMap: Record<string, { img: string; titleSize: string }> = {
  xl: { img: "h-64", titleSize: "text-2xl" },
  lg: { img: "h-52", titleSize: "text-xl" },
  md: { img: "h-40", titleSize: "text-lg" },
  sm: { img: "h-28", titleSize: "text-base" },
};

export function NewsCard({
  item,
  basePath = "news",
  priority = false,
  openExternal = true,
}: {
  item: NewsItem;
  basePath?: string;
  priority?: boolean;
  /** When true (default) a card with `url` opens it in a new tab; when false it
   *  always routes to the internal detail page (used by Works). */
  openExternal?: boolean;
}) {
  const { img, titleSize } = sizeMap[item.size ?? "md"];

  const linkProps =
    openExternal && item.url
      ? { href: item.url, target: "_blank" as const, rel: "noreferrer" }
      : { href: `/${basePath}/${item.slug}` };

  return (
    <Link {...linkProps} className="group block">
      <article className="card overflow-hidden">
        {item.coverImage && (
          <div className={`relative w-full ${img} overflow-hidden`}>
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          </div>
        )}

        <div className="p-5">
          {item.tags && item.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3
            className={`${titleSize} headline`}
            style={{ color: "var(--text)" }}
          >
            {item.title}
          </h3>

          <p
            className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            {item.summary}
          </p>

          <p className="mt-4 text-[12px]" style={{ color: "var(--text-3)" }}>
            {new Date(item.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {item.views ? ` · ${item.views} view${item.views === 1 ? "" : "s"}` : ""}
          </p>
        </div>
      </article>
    </Link>
  );
}
