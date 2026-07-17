import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import { getNewsBySlug } from "@/lib/news";
import { guardAdmin } from "@/lib/admin-auth";
import { deleteImageByUrl } from "@/lib/s3";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";

interface Ctx {
  params: Promise<{ id: string }>;
}

const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

// PATCH /api/news/[id] — update a news item (admin only).
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    await connectDB();
    const existing = await News.findById(id);
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    if (body.title !== undefined) existing.title = String(body.title).trim();
    if (body.summary !== undefined) existing.summary = String(body.summary).trim();
    if (body.content !== undefined) existing.content = body.content?.trim() || undefined;
    if (body.url !== undefined) existing.url = body.url?.trim() || undefined;
    if (body.date !== undefined) existing.date = new Date(body.date);
    if (body.tags !== undefined) existing.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.size !== undefined) existing.size = body.size;
    if (body.awardIds !== undefined) existing.awards = cleanIds(body.awardIds);

    // If the cover image is being replaced or cleared, delete the old one from S3.
    if (body.coverImage !== undefined) {
      const next = body.coverImage?.trim() || undefined;
      if (existing.coverImage && existing.coverImage !== next) {
        await deleteImageByUrl(existing.coverImage);
      }
      existing.coverImage = next;
    }

    // Allow renaming the slug, keeping it unique.
    if (body.slug !== undefined) {
      const base = slugify(body.slug) || existing.slug;
      let slug = base;
      for (let i = 2; await News.exists({ slug, _id: { $ne: existing._id } }); i++) {
        slug = `${base}-${i}`;
      }
      existing.slug = slug;
    }

    await existing.save();
    return Response.json(await getNewsBySlug(existing.slug));
  } catch (err) {
    return serverError("PATCH /api/news/[id] failed", err);
  }
}

// DELETE /api/news/[id] — remove a news item and its cover image (admin only).
export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    await connectDB();
    const doc = await News.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    if (doc.coverImage) await deleteImageByUrl(doc.coverImage);
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/news/[id] failed", err);
  }
}
