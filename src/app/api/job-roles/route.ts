import { connectDB } from "@/lib/mongodb";
import { JobRole } from "@/models/JobRole";
import "@/models/Company";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { getJobRoles, getJobRoleById } from "@/lib/resume";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
const cleanIds = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

// GET /api/job-roles — public list, newest first.
export async function GET() {
  try {
    return Response.json({ items: await getJobRoles() });
  } catch (err) {
    return serverError("GET /api/job-roles failed", err);
  }
}

// POST /api/job-roles — create a role (admin only).
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const companyId = String(body.companyId ?? "").trim();
    const title = String(body.title ?? "").trim();
    if (!companyId) return Response.json({ error: "A company is required" }, { status: 400 });
    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });

    await connectDB();
    const doc = await JobRole.create({
      company: companyId,
      title,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      description: body.description?.trim() || undefined,
      skills: cleanIds(body.skillIds),
      tools: cleanIds(body.toolIds),
      highlights: cleanStrings(body.highlights),
      awards: cleanIds(body.awardIds),
    });

    return Response.json(await getJobRoleById(String(doc._id)), { status: 201 });
  } catch (err) {
    return serverError("POST /api/job-roles failed", err);
  }
}
