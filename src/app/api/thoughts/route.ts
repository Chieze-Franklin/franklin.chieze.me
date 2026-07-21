import { connectDB } from "@/lib/mongodb";
import { Thought } from "@/models/Thought";
import { getThoughtsList, getThoughtBySlug } from "@/lib/thoughts";
import { guardAdmin } from "@/lib/admin-auth";
import { isAdmin } from "@/lib/admin-page";
import { ARTICLE_STATUS_VALUES } from "@/lib/article-status";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";
import type { WorkLink } from "@/types";

export const dynamic = "force-dynamic";

const CONTENT_TYPES = ["richtext", "html", "pdf", "audio", "video"];
const CONTENT_SOURCES = ["inline", "external"];
function cleanLinks(input: unknown): WorkLink[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((l) => ({ label: String(l?.label ?? "").trim(), url: String(l?.url ?? "").trim() }))
    .filter((l) => l.url);
}
const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
const cleanNumber = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

// GET /api/thoughts?skip=0&limit=8&blog=<slug>&tag=<tag> — public list, newest first.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = Math.max(0, Number(searchParams.get("skip")) || 0);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 8));
  const blog = searchParams.get("blog")?.trim() || undefined;
  const tag = searchParams.get("tag")?.trim() || undefined;
  try {
    const admin = await isAdmin();
    return Response.json(await getThoughtsList({ skip, limit, blog, tag, admin }));
  } catch (err) {
    return serverError("GET /api/thoughts failed", err);
  }
}

// POST /api/thoughts — create a thought (admin only).
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const summary = String(body.summary ?? "").trim();
    if (!title || !summary) {
      return Response.json({ error: "Title and summary are required" }, { status: 400 });
    }

    await connectDB();
    const base = slugify(body.slug || title) || "thought";
    let slug = base;
    for (let i = 2; await Thought.exists({ slug }); i++) slug = `${base}-${i}`;

    const doc = await Thought.create({
      title,
      summary,
      content: body.content?.trim() || undefined,
      coverImage: body.coverImage?.trim() || undefined,
      images: cleanStrings(body.images),
      date: body.date || new Date().toISOString().slice(0, 10),
      slug,
      tags: cleanStrings(body.tags),
      size: body.size || "md",
      blog: body.blogId?.trim() || undefined,
      status: ARTICLE_STATUS_VALUES.includes(body.status) ? body.status : "draft",
      contentType: CONTENT_TYPES.includes(body.contentType) ? body.contentType : "richtext",
      contentSource: CONTENT_SOURCES.includes(body.contentSource) ? body.contentSource : "inline",
      url: body.url?.trim() || undefined,
      readingTime: cleanNumber(body.readingTime),
      links: cleanLinks(body.links),
      awards: cleanIds(body.awardIds),
      skills: cleanIds(body.skillIds),
      tools: cleanIds(body.toolIds),
    });

    return Response.json(await getThoughtBySlug(doc.slug), { status: 201 });
  } catch (err) {
    return serverError("POST /api/thoughts failed", err);
  }
}
