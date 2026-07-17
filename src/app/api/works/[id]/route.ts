import { connectDB } from "@/lib/mongodb";
import { Work } from "@/models/Work";
import { getWorkBySlug } from "@/lib/works";
import { guardAdmin } from "@/lib/admin-auth";
import { deleteImageByUrl } from "@/lib/s3";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";
import type { WorkLink } from "@/types";

interface Ctx {
  params: Promise<{ id: string }>;
}

function cleanLinks(input: unknown): WorkLink[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((l) => ({ label: String(l?.label ?? "").trim(), url: String(l?.url ?? "").trim() }))
    .filter((l) => l.url);
}
const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];

// PATCH /api/works/[id] — update (admin). Deletes removed images from S3.
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;

  try {
    await connectDB();
    const doc = await Work.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    if (body.title !== undefined) doc.title = String(body.title).trim();
    if (body.summary !== undefined) doc.summary = String(body.summary).trim();
    if (body.content !== undefined) doc.content = body.content?.trim() || undefined;
    if (body.date !== undefined) doc.date = body.date;
    if (body.size !== undefined) doc.size = body.size;
    if (body.url !== undefined) doc.url = body.url?.trim() || undefined;
    if (body.tags !== undefined) doc.tags = cleanStrings(body.tags);
    if (body.links !== undefined) doc.links = cleanLinks(body.links);
    if (body.companyId !== undefined) doc.company = body.companyId?.trim() || undefined;
    if (body.awardIds !== undefined) doc.awards = cleanIds(body.awardIds);
    if (body.skillIds !== undefined) doc.skills = cleanIds(body.skillIds);
    if (body.toolIds !== undefined) doc.tools = cleanIds(body.toolIds);

    // Cover image replaced/cleared → delete the old object from S3.
    if (body.coverImage !== undefined) {
      const next = body.coverImage?.trim() || undefined;
      if (doc.coverImage && doc.coverImage !== next) await deleteImageByUrl(doc.coverImage);
      doc.coverImage = next;
    }

    // Gallery images: delete any that were removed.
    if (body.images !== undefined) {
      const next = cleanStrings(body.images);
      const removed = (doc.images ?? []).filter((u: string) => !next.includes(u));
      await Promise.all(removed.map((u: string) => deleteImageByUrl(u)));
      doc.images = next;
    }

    if (body.slug !== undefined) {
      const base = slugify(body.slug) || doc.slug;
      let slug = base;
      for (let i = 2; await Work.exists({ slug, _id: { $ne: doc._id } }); i++) slug = `${base}-${i}`;
      doc.slug = slug;
    }

    await doc.save();
    const updated = await getWorkBySlug(doc.slug);
    return Response.json(updated);
  } catch (err) {
    return serverError("PATCH /api/works/[id] failed", err);
  }
}

// DELETE /api/works/[id] — remove a work and all its images (admin only).
export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;

  try {
    await connectDB();
    const doc = await Work.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    const images: string[] = [...(doc.coverImage ? [doc.coverImage] : []), ...(doc.images ?? [])];
    await Promise.all(images.map((u) => deleteImageByUrl(u)));
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/works/[id] failed", err);
  }
}
