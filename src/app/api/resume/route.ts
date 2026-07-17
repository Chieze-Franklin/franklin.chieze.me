import { connectDB } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { getResumeEntries, getResumeById } from "@/lib/resume";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

// GET /api/resume — public list of experience entries, newest first.
export async function GET() {
  try {
    return Response.json({ items: await getResumeEntries() });
  } catch (err) {
    return serverError("GET /api/resume failed", err);
  }
}

// POST /api/resume — create an experience entry (admin only).
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const company = String(body.company ?? "").trim();
    const title = String(body.title ?? "").trim();
    if (!company || !title) {
      return Response.json({ error: "Company and title are required" }, { status: 400 });
    }

    await connectDB();
    const doc = await Resume.create({
      company,
      title,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      description: body.description?.trim() || undefined,
      skills: cleanIds(body.skillIds),
      tools: cleanIds(body.toolIds),
      highlights: cleanStrings(body.highlights),
      awards: cleanIds(body.awardIds),
    });

    return Response.json(await getResumeById(String(doc._id)), { status: 201 });
  } catch (err) {
    return serverError("POST /api/resume failed", err);
  }
}
