import { connectDB } from "@/lib/mongodb";
import { Skill } from "@/models/Skill";
import { getSkills, serializeSkill } from "@/lib/taxonomy";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

// GET /api/skills — public list (used by the work editor's selector).
export async function GET() {
  try {
    return Response.json({ items: await getSkills() });
  } catch (err) {
    return serverError("GET /api/skills failed", err);
  }
}

// POST /api/skills — create (admin). If the name already exists, returns it so
// the work editor's inline "create" is idempotent.
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });

    await connectDB();
    const existing = await Skill.findOne({ name });
    if (existing) return Response.json(serializeSkill(existing.toObject()));

    const doc = await Skill.create({ name, description: body.description?.trim() || undefined });
    return Response.json(serializeSkill(doc.toObject()), { status: 201 });
  } catch (err) {
    return serverError("POST /api/skills failed", err);
  }
}
