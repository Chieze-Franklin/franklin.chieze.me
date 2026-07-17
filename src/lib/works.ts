import { connectDB } from "@/lib/mongodb";
import { Work } from "@/models/Work";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { serializeAward, serializeSkill, serializeTool } from "@/lib/taxonomy";
import type { WorkItem, WorkLink } from "@/types";

interface WorkDoc {
  _id: unknown;
  title: string;
  summary: string;
  content?: string;
  coverImage?: string;
  images?: string[];
  date: string;
  slug: string;
  tags?: string[];
  size?: WorkItem["size"];
  url?: string;
  links?: WorkLink[];
  // Populated taxonomy documents (each has _id + its own fields).
  awards?: { _id: unknown; title: string; kind?: "award" | "certification" }[];
  skills?: { _id: unknown; name: string }[];
  tools?: { _id: unknown; name: string }[];
}

const POPULATE = [
  { path: "awards" },
  { path: "skills" },
  { path: "tools" },
];

/** Convert a (lean, populated) Work document into the plain UI shape. */
export function serializeWork(doc: WorkDoc): WorkItem {
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
    links: (doc.links ?? []).filter((l) => l && l.url),
    // filter(Boolean) drops any dangling references to deleted taxonomy docs.
    awards: (doc.awards ?? []).filter(Boolean).map((a) => serializeAward(a)),
    skills: (doc.skills ?? []).filter(Boolean).map((s) => serializeSkill(s)),
    tools: (doc.tools ?? []).filter(Boolean).map((t) => serializeTool(t)),
  };
}

/**
 * Fetch works newest-first. Fetches one extra row beyond `limit` to derive
 * `hasMore` without a separate count query.
 */
export async function getWorksList({ skip = 0, limit = 6 } = {}): Promise<{
  items: WorkItem[];
  hasMore: boolean;
}> {
  await connectDB();
  const docs = await Work.find()
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate(POPULATE)
    .lean<WorkDoc[]>();

  const hasMore = docs.length > limit;
  return { items: docs.slice(0, limit).map(serializeWork), hasMore };
}

export async function getWorkBySlug(slug: string): Promise<WorkItem | null> {
  await connectDB();
  const doc = await Work.findOne({ slug }).populate(POPULATE).lean<WorkDoc | null>();
  return doc ? serializeWork(doc) : null;
}
