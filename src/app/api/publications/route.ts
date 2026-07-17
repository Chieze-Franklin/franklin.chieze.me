import { connectDB } from "@/lib/mongodb";
import { Publication } from "@/models/Publication";
import { getPublications, serializePublication } from "@/lib/resume";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

const PUB_TYPES = ["journal", "conference", "preprint", "chapter", "thesis"];
const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
const cleanYear = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : new Date().getFullYear();
};

export async function GET() {
  try {
    return Response.json({ items: await getPublications() });
  } catch (err) {
    return serverError("GET /api/publications failed", err);
  }
}

export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const venue = String(body.venue ?? "").trim();
    if (!title || !venue) {
      return Response.json({ error: "Title and venue are required" }, { status: 400 });
    }
    await connectDB();
    const doc = await Publication.create({
      title,
      venue,
      year: cleanYear(body.year),
      authors: cleanStrings(body.authors),
      type: PUB_TYPES.includes(body.type) ? body.type : "conference",
      url: body.url?.trim() || undefined,
      description: body.description?.trim() || undefined,
    });
    return Response.json(serializePublication(doc.toObject()), { status: 201 });
  } catch (err) {
    return serverError("POST /api/publications failed", err);
  }
}
