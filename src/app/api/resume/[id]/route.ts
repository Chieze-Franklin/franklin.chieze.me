import { connectDB } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { getResumeById } from "@/lib/resume";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

interface Ctx {
  params: Promise<{ id: string }>;
}

const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Resume.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    if (body.company !== undefined) doc.company = String(body.company).trim();
    if (body.title !== undefined) doc.title = String(body.title).trim();
    if (body.startDate !== undefined) doc.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) doc.endDate = body.endDate ? new Date(body.endDate) : undefined;
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    if (body.skillIds !== undefined) doc.skills = cleanIds(body.skillIds);
    if (body.toolIds !== undefined) doc.tools = cleanIds(body.toolIds);
    if (body.highlights !== undefined) doc.highlights = cleanStrings(body.highlights);
    if (body.awardIds !== undefined) doc.awards = cleanIds(body.awardIds);

    await doc.save();
    return Response.json(await getResumeById(String(doc._id)));
  } catch (err) {
    return serverError("PATCH /api/resume/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Resume.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/resume/[id] failed", err);
  }
}
