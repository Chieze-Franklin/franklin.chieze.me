import { connectDB } from "@/lib/mongodb";
import { Play } from "@/models/Play";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { serializeAward, serializeSkill, serializeTool } from "@/lib/taxonomy";
import type { PlayItem, WorkLink } from "@/types";

interface PlayDoc {
  _id: unknown;
  title: string;
  summary: string;
  content?: string;
  coverImage?: string;
  images?: string[];
  date: string;
  slug: string;
  tags?: string[];
  size?: PlayItem["size"];
  url?: string;
  repoUrl?: string;
  links?: WorkLink[];
  awards?: { _id: unknown; title: string; kind?: "award" | "certification" }[];
  skills?: { _id: unknown; name: string }[];
  tools?: { _id: unknown; name: string }[];
}

const POPULATE = [{ path: "awards" }, { path: "skills" }, { path: "tools" }];

export function serializePlay(doc: PlayDoc): PlayItem {
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
    url: doc.url,
    repoUrl: doc.repoUrl,
    links: (doc.links ?? []).filter((l) => l && l.url),
    awards: (doc.awards ?? []).filter(Boolean).map((a) => serializeAward(a)),
    skills: (doc.skills ?? []).filter(Boolean).map((s) => serializeSkill(s)),
    tools: (doc.tools ?? []).filter(Boolean).map((t) => serializeTool(t)),
  };
}

export async function getPlaysList({ skip = 0, limit = 8 } = {}): Promise<{
  items: PlayItem[];
  hasMore: boolean;
}> {
  await connectDB();
  const docs = await Play.find()
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate(POPULATE)
    .lean<PlayDoc[]>();

  const hasMore = docs.length > limit;
  return { items: docs.slice(0, limit).map(serializePlay), hasMore };
}

export async function getPlayBySlug(slug: string): Promise<PlayItem | null> {
  await connectDB();
  const doc = await Play.findOne({ slug }).populate(POPULATE).lean<PlayDoc | null>();
  return doc ? serializePlay(doc) : null;
}
