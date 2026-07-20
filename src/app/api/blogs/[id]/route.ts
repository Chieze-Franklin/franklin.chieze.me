import { connectDB } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";
import { Thought } from "@/models/Thought";
import { getBlogBySlug } from "@/lib/blogs";
import { deleteImageByUrl } from "@/lib/s3";
import { guardAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Blog.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    if (body.title !== undefined) doc.title = String(body.title).trim();
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    if (body.url !== undefined) doc.url = body.url?.trim() || undefined;

    // Images: delete replaced/cleared files from S3.
    for (const key of ["coverImage", "logo"] as const) {
      if (body[key] !== undefined) {
        const next = body[key]?.trim() || undefined;
        if (doc[key] && doc[key] !== next) await deleteImageByUrl(doc[key]);
        doc[key] = next;
      }
    }

    if (body.slug !== undefined) {
      const base = slugify(body.slug) || doc.slug;
      let slug = base;
      for (let i = 2; await Blog.exists({ slug, _id: { $ne: doc._id } }); i++) slug = `${base}-${i}`;
      doc.slug = slug;
    }

    await doc.save();
    return Response.json(await getBlogBySlug(doc.slug));
  } catch (err) {
    return serverError("PATCH /api/blogs/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Blog.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    await Promise.all([
      doc.coverImage ? deleteImageByUrl(doc.coverImage) : Promise.resolve(),
      doc.logo ? deleteImageByUrl(doc.logo) : Promise.resolve(),
      // Detach articles from the deleted blog (they remain on /thoughts).
      Thought.updateMany({ blog: id }, { $unset: { blog: "" } }),
    ]);
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/blogs/[id] failed", err);
  }
}
