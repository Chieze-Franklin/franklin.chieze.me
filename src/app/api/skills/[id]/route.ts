import { connectDB } from "@/lib/mongodb";
import { Skill } from "@/models/Skill";
import { Work } from "@/models/Work";
import { Play } from "@/models/Play";
import { Thought } from "@/models/Thought";
import Resume from "@/models/Resume";
import { serializeSkill } from "@/lib/taxonomy";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    const body = await req.json();
    await connectDB();
    const doc = await Skill.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (body.name !== undefined) doc.name = String(body.name).trim();
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    await doc.save();
    return Response.json(serializeSkill(doc.toObject()));
  } catch (err) {
    return serverError("PATCH /api/skills/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Skill.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    // Drop the reference from anything that used it.
    await Promise.all([
      Work.updateMany({ skills: id }, { $pull: { skills: id } }),
      Play.updateMany({ skills: id }, { $pull: { skills: id } }),
      Thought.updateMany({ skills: id }, { $pull: { skills: id } }),
      Resume.updateMany({ skills: id }, { $pull: { skills: id } }),
    ]);
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/skills/[id] failed", err);
  }
}
