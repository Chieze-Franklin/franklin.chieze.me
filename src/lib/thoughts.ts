import { connectDB } from "@/lib/mongodb";
import { Thought } from "@/models/Thought";
import { Blog } from "@/models/Blog";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { serializeAward, serializeSkill, serializeTool } from "@/lib/taxonomy";
import { serializeBlog } from "@/lib/blogs";
import type { ThoughtItem, WorkLink } from "@/types";

interface ThoughtDoc {
  _id: unknown;
  title: string;
  summary: string;
  content?: string;
  coverImage?: string;
  images?: string[];
  date: string;
  slug: string;
  tags?: string[];
  size?: ThoughtItem["size"];
  blog?: { _id: unknown; title: string; slug: string; description?: string; coverImage?: string; logo?: string; url?: string } | null;
  contentType?: ThoughtItem["contentType"];
  contentSource?: ThoughtItem["contentSource"];
  url?: string;
  readingTime?: number;
  views?: number;
  links?: WorkLink[];
  awards?: { _id: unknown; title: string; kind?: "award" | "certification" }[];
  skills?: { _id: unknown; name: string }[];
  tools?: { _id: unknown; name: string }[];
  // Legacy fields (pre-blog migration) used as fallbacks.
  type?: string;
  videoUrl?: string;
}

const POPULATE = [{ path: "blog" }, { path: "awards" }, { path: "skills" }, { path: "tools" }];

export function serializeThought(doc: ThoughtDoc): ThoughtItem {
  return {
    _id: String(doc._id),
    title: doc.title,
    summary: doc.summary,
    content: doc.content,
    coverImage: doc.coverImage,
    images: doc.images ?? [],
    date: doc.date,
    slug: doc.slug,
    tags: doc.tags ?? [],
    size: doc.size ?? "md",
    blog: doc.blog ? serializeBlog(doc.blog) : undefined,
    contentType: doc.contentType ?? (doc.type === "vlog" ? "video" : "markdown"),
    contentSource: doc.contentSource ?? "inline",
    url: doc.url ?? doc.videoUrl,
    readingTime: doc.readingTime,
    views: doc.views ?? 0,
    links: (doc.links ?? []).filter((l) => l && l.url),
    awards: (doc.awards ?? []).filter(Boolean).map((a) => serializeAward(a)),
    skills: (doc.skills ?? []).filter(Boolean).map((s) => serializeSkill(s)),
    tools: (doc.tools ?? []).filter(Boolean).map((t) => serializeTool(t)),
  };
}

/**
 * Fetch articles newest-first, optionally filtered by blog slug and/or tag.
 */
export async function getThoughtsList({
  skip = 0,
  limit = 8,
  blog,
  tag,
}: { skip?: number; limit?: number; blog?: string; tag?: string } = {}): Promise<{
  items: ThoughtItem[];
  hasMore: boolean;
}> {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (blog) {
    const b = await Blog.findOne({ slug: blog }).select("_id").lean<{ _id: unknown } | null>();
    // Unknown blog → return nothing rather than everything.
    query.blog = b?._id ?? null;
  }
  if (tag) query.tags = tag;

  const docs = await Thought.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate(POPULATE)
    .lean<ThoughtDoc[]>();

  const hasMore = docs.length > limit;
  return { items: docs.slice(0, limit).map(serializeThought), hasMore };
}

export async function getThoughtBySlug(slug: string): Promise<ThoughtItem | null> {
  await connectDB();
  const doc = await Thought.findOne({ slug }).populate(POPULATE).lean<ThoughtDoc | null>();
  return doc ? serializeThought(doc) : null;
}

/** Fetch an article for a reader, incrementing its view count in the same query. */
export async function getThoughtForReader(slug: string): Promise<ThoughtItem | null> {
  await connectDB();
  const doc = await Thought.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true })
    .populate(POPULATE)
    .lean<ThoughtDoc | null>();
  return doc ? serializeThought(doc) : null;
}
