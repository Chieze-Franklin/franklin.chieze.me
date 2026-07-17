import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import "@/models/Award";
import { serializeAward } from "@/lib/taxonomy";
import type { NewsItem } from "@/types";

interface NewsDoc {
  _id: unknown;
  title: string;
  summary: string;
  content?: string;
  coverImage?: string;
  url?: string;
  date: Date;
  slug: string;
  tags?: string[];
  size?: NewsItem["size"];
  awards?: { _id: unknown; title: string; kind?: "award" | "certification" }[];
}

const POPULATE = [{ path: "awards" }];

/** Convert a (lean, populated) Mongo document into the plain shape the UI expects. */
export function serializeNews(doc: NewsDoc): NewsItem {
  return {
    _id: String(doc._id),
    title: doc.title,
    summary: doc.summary,
    content: doc.content,
    coverImage: doc.coverImage,
    url: doc.url,
    date: new Date(doc.date).toISOString(),
    slug: doc.slug,
    tags: doc.tags ?? [],
    size: doc.size ?? "md",
    awards: (doc.awards ?? []).filter(Boolean).map((a) => serializeAward(a)),
  };
}

/**
 * Fetch news ordered newest-first. Returns one extra row beyond `limit` to
 * derive `hasMore` without a separate count query.
 */
export async function getNewsList({ skip = 0, limit = 8 } = {}): Promise<{
  items: NewsItem[];
  hasMore: boolean;
}> {
  await connectDB();
  const docs = await News.find()
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate(POPULATE)
    .lean<NewsDoc[]>();

  const hasMore = docs.length > limit;
  return { items: docs.slice(0, limit).map(serializeNews), hasMore };
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  await connectDB();
  const doc = await News.findOne({ slug }).populate(POPULATE).lean<NewsDoc | null>();
  return doc ? serializeNews(doc) : null;
}
