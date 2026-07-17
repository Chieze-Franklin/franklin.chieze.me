import { connectDB } from "@/lib/mongodb";
import { Thought } from "@/models/Thought";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { serializeAward, serializeSkill, serializeTool } from "@/lib/taxonomy";
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
  type?: ThoughtItem["type"];
  url?: string;
  videoUrl?: string;
  readingTime?: number;
  links?: WorkLink[];
  awards?: { _id: unknown; title: string; kind?: "award" | "certification" }[];
  skills?: { _id: unknown; name: string }[];
  tools?: { _id: unknown; name: string }[];
}

const POPULATE = [{ path: "awards" }, { path: "skills" }, { path: "tools" }];

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
    type: doc.type ?? "article",
    url: doc.url,
    videoUrl: doc.videoUrl,
    readingTime: doc.readingTime,
    links: (doc.links ?? []).filter((l) => l && l.url),
    awards: (doc.awards ?? []).filter(Boolean).map((a) => serializeAward(a)),
    skills: (doc.skills ?? []).filter(Boolean).map((s) => serializeSkill(s)),
    tools: (doc.tools ?? []).filter(Boolean).map((t) => serializeTool(t)),
  };
}

export async function getThoughtsList({ skip = 0, limit = 8 } = {}): Promise<{
  items: ThoughtItem[];
  hasMore: boolean;
}> {
  await connectDB();
  const docs = await Thought.find()
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
