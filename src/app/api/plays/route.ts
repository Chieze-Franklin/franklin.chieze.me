import { connectDB } from "@/lib/mongodb";
import { Play } from "@/models/Play";
import { getPlaysList, getPlayBySlug } from "@/lib/plays";
import { guardAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";
import type { WorkLink } from "@/types";

export const dynamic = "force-dynamic";

function cleanLinks(input: unknown): WorkLink[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((l) => ({ label: String(l?.label ?? "").trim(), url: String(l?.url ?? "").trim() }))
    .filter((l) => l.url);
}
const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];

// GET /api/plays?skip=0&limit=8 — public list, newest first.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = Math.max(0, Number(searchParams.get("skip")) || 0);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 8));
  try {
    return Response.json(await getPlaysList({ skip, limit }));
  } catch (err) {
    return serverError("GET /api/plays failed", err);
  }
}

// POST /api/plays — create a play item (admin only).
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
    const base = slugify(body.slug || title) || "play";
    let slug = base;
    for (let i = 2; await Play.exists({ slug }); i++) slug = `${base}-${i}`;

    const doc = await Play.create({
      title,
      summary,
      content: body.content?.trim() || undefined,
      coverImage: body.coverImage?.trim() || undefined,
      images: cleanStrings(body.images),
      date: body.date || new Date().toISOString().slice(0, 10),
      slug,
      tags: cleanStrings(body.tags),
      size: body.size || "md",
      url: body.url?.trim() || undefined,
      repoUrl: body.repoUrl?.trim() || undefined,
      links: cleanLinks(body.links),
      awards: cleanIds(body.awardIds),
      skills: cleanIds(body.skillIds),
      tools: cleanIds(body.toolIds),
    });

    return Response.json(await getPlayBySlug(doc.slug), { status: 201 });
  } catch (err) {
    return serverError("POST /api/plays failed", err);
  }
}
