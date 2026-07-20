import { connectDB } from "@/lib/mongodb";
import { Tool } from "@/models/Tool";
import { getTools, serializeTool } from "@/lib/taxonomy";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

// GET /api/tools — public list (used by the work editor's selector).
export async function GET() {
  try {
    return Response.json({ items: await getTools() });
  } catch (err) {
    return serverError("GET /api/tools failed", err);
  }
}

// POST /api/tools — create (admin). Idempotent on name.
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });

    await connectDB();
    const existing = await Tool.findOne({ name });
    if (existing) return Response.json(serializeTool(existing.toObject()));

    const doc = await Tool.create({
      name,
      description: body.description?.trim() || undefined,
      url: body.url?.trim() || undefined,
      image: body.image?.trim() || undefined,
    });
    return Response.json(serializeTool(doc.toObject()), { status: 201 });
  } catch (err) {
    return serverError("POST /api/tools failed", err);
  }
}
