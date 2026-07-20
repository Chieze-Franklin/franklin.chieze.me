import { connectDB } from "@/lib/mongodb";
import { Thought } from "@/models/Thought";
import { getThoughtBySlug } from "@/lib/thoughts";
import { guardAdmin } from "@/lib/admin-auth";
import { deleteImageByUrl } from "@/lib/s3";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";
import type { WorkLink } from "@/types";

interface Ctx {
  params: Promise<{ id: string }>;
}

const CONTENT_TYPES = ["plaintext", "html", "markdown", "audio", "video"];
const CONTENT_SOURCES = ["inline", "external"];
const STATUSES = ["draft", "published", "archived"];
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

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Thought.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    if (body.title !== undefined) doc.title = String(body.title).trim();
    if (body.summary !== undefined) doc.summary = String(body.summary).trim();
    if (body.content !== undefined) doc.content = body.content?.trim() || undefined;
    if (body.date !== undefined) doc.date = body.date;
    if (body.size !== undefined) doc.size = body.size;
    if (body.blogId !== undefined) doc.blog = body.blogId?.trim() || undefined;
    if (body.status !== undefined && STATUSES.includes(body.status)) doc.status = body.status;
    if (body.contentType !== undefined && CONTENT_TYPES.includes(body.contentType)) doc.contentType = body.contentType;
    if (body.contentSource !== undefined && CONTENT_SOURCES.includes(body.contentSource)) doc.contentSource = body.contentSource;
    if (body.url !== undefined) doc.url = body.url?.trim() || undefined;
    if (body.readingTime !== undefined) doc.readingTime = cleanNumber(body.readingTime);
    if (body.tags !== undefined) doc.tags = cleanStrings(body.tags);
    if (body.links !== undefined) doc.links = cleanLinks(body.links);
    if (body.awardIds !== undefined) doc.awards = cleanIds(body.awardIds);
    if (body.skillIds !== undefined) doc.skills = cleanIds(body.skillIds);
    if (body.toolIds !== undefined) doc.tools = cleanIds(body.toolIds);

    if (body.coverImage !== undefined) {
      const next = body.coverImage?.trim() || undefined;
      if (doc.coverImage && doc.coverImage !== next) await deleteImageByUrl(doc.coverImage);
      doc.coverImage = next;
    }
    if (body.images !== undefined) {
      const next = cleanStrings(body.images);
      const removed = (doc.images ?? []).filter((u: string) => !next.includes(u));
      await Promise.all(removed.map((u: string) => deleteImageByUrl(u)));
      doc.images = next;
    }
    if (body.slug !== undefined) {
      const base = slugify(body.slug) || doc.slug;
      let slug = base;
      for (let i = 2; await Thought.exists({ slug, _id: { $ne: doc._id } }); i++) slug = `${base}-${i}`;
      doc.slug = slug;
    }

    await doc.save();
    return Response.json(await getThoughtBySlug(doc.slug));
  } catch (err) {
    return serverError("PATCH /api/thoughts/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Thought.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    const images: string[] = [...(doc.coverImage ? [doc.coverImage] : []), ...(doc.images ?? [])];
    await Promise.all(images.map((u) => deleteImageByUrl(u)));
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/thoughts/[id] failed", err);
  }
}
