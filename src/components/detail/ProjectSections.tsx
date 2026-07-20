import Image from "next/image";
import { AwardChips } from "@/components/detail/AwardChips";
import { Markdown } from "@/components/ui/Markdown";
import { EntityImage } from "@/components/ui/EntityImage";
import type { Award, Skill, Tool } from "@/types";

/**
 * Shared detail-page sections used by Works / Plays / Thoughts: screenshot
 * gallery, tags, About, Skills & Tools, and Recognition (awards).
 */
export function ProjectSections({
  title,
  summary,
  content,
  images = [],
  tags = [],
  skills = [],
  tools = [],
  awards = [],
  aboutLabel = "About",
  showAbout = true,
}: {
  title: string;
  summary: string;
  content?: string;
  images?: string[];
  tags?: string[];
  skills?: Skill[];
  tools?: Tool[];
  awards?: Award[];
  aboutLabel?: string;
  showAbout?: boolean;
}) {
  return (
    <>
      {/* Screenshots / gallery */}
      {images.length > 0 && (
        <div className="mb-10 -mx-4 sm:mx-0">
          <div className="flex gap-3 overflow-x-auto px-4 sm:px-0 pb-2 snap-x">
            {images.map((src, i) => (
              <div
                key={src}
                className="relative h-64 w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl"
                style={{ border: "1px solid var(--card-border)" }}
              >
                <Image src={src} alt={`${title} screenshot ${i + 1}`} fill className="object-cover" sizes="280px" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-3 py-0.5 rounded-full font-medium"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* About */}
      {showAbout && (content || summary) && (
        <section className="mb-10">
          <h2 className="eyebrow mb-3" style={{ color: "var(--text-3)" }}>
            {aboutLabel}
          </h2>
          <div className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <Markdown>{content || summary}</Markdown>
          </div>
        </section>
      )}

      {/* Skills & Tools */}
      {(skills.length > 0 || tools.length > 0) && (
        <section className="mb-10 grid gap-8 sm:grid-cols-2">
          {skills.length > 0 && (
            <div>
              <h2 className="eyebrow mb-3" style={{ color: "var(--text-3)" }}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s._id}
                    className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-[12px] font-medium"
                    style={{ background: "var(--surface-2)", color: "var(--text)" }}
                  >
                    <EntityImage image={s.image} url={s.url} label={s.name} size={18} />
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {tools.length > 0 && (
            <div>
              <h2 className="eyebrow mb-3" style={{ color: "var(--text-3)" }}>
                Tools
              </h2>
              <div className="flex flex-wrap gap-2">
                {tools.map((t) =>
                  t.url ? (
                    <a
                      key={t._id}
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-[12px] font-medium transition-opacity hover:opacity-70"
                      style={{ background: "var(--surface-2)", color: "var(--text)" }}
                    >
                      <EntityImage image={t.image} url={t.url} label={t.name} size={18} />
                      {t.name}
                    </a>
                  ) : (
                    <span
                      key={t._id}
                      className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-[12px] font-medium"
                      style={{ background: "var(--surface-2)", color: "var(--text)" }}
                    >
                      <EntityImage image={t.image} url={t.url} label={t.name} size={18} />
                      {t.name}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Recognition (awards) */}
      <AwardChips awards={awards} />
    </>
  );
}
