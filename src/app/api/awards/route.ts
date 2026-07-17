import { connectDB } from "@/lib/mongodb";
import { Award } from "@/models/Award";
import { getAwards, serializeAward } from "@/lib/taxonomy";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

// GET /api/awards — public list (used by the work editor's selector).
export async function GET() {
  try {
    return Response.json({ items: await getAwards() });
  } catch (err) {
    return serverError("GET /api/awards failed", err);
  }
}

// POST /api/awards — create (admin). Idempotent on title.
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });

    await connectDB();
    const existing = await Award.findOne({ title });
    if (existing) return Response.json(serializeAward(existing.toObject()));

    const doc = await Award.create({
      title,
      issuer: body.issuer?.trim() || undefined,
      date: body.date?.trim() || undefined,
      kind: body.kind === "certification" ? "certification" : "award",
      description: body.description?.trim() || undefined,
      url: body.url?.trim() || undefined,
      credentialId: body.credentialId?.trim() || undefined,
    });
    return Response.json(serializeAward(doc.toObject()), { status: 201 });
  } catch (err) {
    return serverError("POST /api/awards failed", err);
  }
}
