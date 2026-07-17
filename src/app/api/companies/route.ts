import { connectDB } from "@/lib/mongodb";
import { Company } from "@/models/Company";
import { getCompanies, serializeCompany } from "@/lib/taxonomy";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

// GET /api/companies — public list (used by the work/job-role selectors).
export async function GET() {
  try {
    return Response.json({ items: await getCompanies() });
  } catch (err) {
    return serverError("GET /api/companies failed", err);
  }
}

// POST /api/companies — create (admin). Idempotent on name.
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });

    await connectDB();
    const existing = await Company.findOne({ name });
    if (existing) return Response.json(serializeCompany(existing.toObject()));

    const doc = await Company.create({
      name,
      url: body.url?.trim() || undefined,
      logo: body.logo?.trim() || undefined,
      description: body.description?.trim() || undefined,
    });
    return Response.json(serializeCompany(doc.toObject()), { status: 201 });
  } catch (err) {
    return serverError("POST /api/companies failed", err);
  }
}
