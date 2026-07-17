import { connectDB } from "@/lib/mongodb";
import News from "@/models/News";
import { getNewsList, getNewsBySlug } from "@/lib/news";
import { guardAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";

const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

// Always run dynamically — news is read from the database per request.
export const dynamic = "force-dynamic";

// GET /api/news?skip=0&limit=8 — public list, newest first.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = Math.max(0, Number(searchParams.get("skip")) || 0);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 8));

  try {
    const data = await getNewsList({ skip, limit });
    return Response.json(data);
  } catch (err) {
    return serverError("GET /api/news failed", err);
  }
}

// POST /api/news — create a news item (admin only).
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

    // Use the provided slug or derive one from the title; ensure uniqueness.
    const base = slugify(body.slug || title) || "news";
    let slug = base;
    for (let i = 2; await News.exists({ slug }); i++) slug = `${base}-${i}`;

    const doc = await News.create({
      title,
      summary,
      content: body.content?.trim() || undefined,
      coverImage: body.coverImage?.trim() || undefined,
      url: body.url?.trim() || undefined,
      date: body.date ? new Date(body.date) : new Date(),
      slug,
      tags: Array.isArray(body.tags) ? body.tags : [],
      size: body.size || "md",
      awards: cleanIds(body.awardIds),
    });

    // Return the populated shape so the client can update its list.
    return Response.json(await getNewsBySlug(doc.slug), { status: 201 });
  } catch (err) {
    return serverError("POST /api/news failed", err);
  }
}
