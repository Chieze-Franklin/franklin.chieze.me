import { connectDB } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";
import { getBlogs, getBlogBySlug } from "@/lib/blogs";
import { guardAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

// GET /api/blogs — public list (used by the /thoughts filter and article editor).
export async function GET() {
  try {
    return Response.json({ items: await getBlogs() });
  } catch (err) {
    return serverError("GET /api/blogs failed", err);
  }
}

// POST /api/blogs — create a blog (admin only).
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });

    await connectDB();
    const base = slugify(body.slug || title) || "blog";
    let slug = base;
    for (let i = 2; await Blog.exists({ slug }); i++) slug = `${base}-${i}`;

    const doc = await Blog.create({
      title,
      slug,
      description: body.description?.trim() || undefined,
      coverImage: body.coverImage?.trim() || undefined,
      logo: body.logo?.trim() || undefined,
      url: body.url?.trim() || undefined,
    });

    return Response.json(await getBlogBySlug(doc.slug), { status: 201 });
  } catch (err) {
    return serverError("POST /api/blogs failed", err);
  }
}
