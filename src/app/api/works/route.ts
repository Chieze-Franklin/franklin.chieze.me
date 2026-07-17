import { connectDB } from "@/lib/mongodb";
import { Work } from "@/models/Work";
import { getWorksList, getWorkBySlug } from "@/lib/works";
import { guardAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/slugify";
import { serverError } from "@/lib/api-error";
import { WORK_STATUS_VALUES } from "@/lib/work-status";
import type { WorkLink } from "@/types";

export const dynamic = "force-dynamic";

// Normalise the labelled-links array from a request body.
function cleanLinks(input: unknown): WorkLink[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((l) => ({ label: String(l?.label ?? "").trim(), url: String(l?.url ?? "").trim() }))
    .filter((l) => l.url);
}

const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];

// GET /api/works?skip=0&limit=6 — public list, newest first.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = Math.max(0, Number(searchParams.get("skip")) || 0);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 6));

  try {
    const data = await getWorksList({ skip, limit });
    return Response.json(data);
  } catch (err) {
    return serverError("GET /api/works failed", err);
  }
}

// POST /api/works — create a work item (admin only).
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

    const base = slugify(body.slug || title) || "work";
    let slug = base;
    for (let i = 2; await Work.exists({ slug }); i++) slug = `${base}-${i}`;

    const doc = await Work.create({
      title,
      summary,
      content: body.content?.trim() || undefined,
      coverImage: body.coverImage?.trim() || undefined,
      images: cleanStrings(body.images),
      startDate: body.startDate || new Date().toISOString().slice(0, 10),
      endDate: body.endDate?.trim() || undefined,
      status: WORK_STATUS_VALUES.includes(body.status) ? body.status : "in_progress",
      slug,
      tags: cleanStrings(body.tags),
      size: body.size || "md",
      url: body.url?.trim() || undefined,
      links: cleanLinks(body.links),
      company: body.companyId?.trim() || undefined,
      awards: cleanIds(body.awardIds),
      skills: cleanIds(body.skillIds),
      tools: cleanIds(body.toolIds),
    });

    // Return the populated shape so the client can update its list.
    const created = await getWorkBySlug(doc.slug);
    return Response.json(created, { status: 201 });
  } catch (err) {
    return serverError("POST /api/works failed", err);
  }
}
