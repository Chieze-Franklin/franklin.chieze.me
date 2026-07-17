import { connectDB } from "@/lib/mongodb";
import { Setting } from "@/models/Setting";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ key: string }>;
}

// GET /api/settings/[key] — public read of a single setting value.
export async function GET(_req: Request, { params }: Ctx) {
  const { key } = await params;
  try {
    await connectDB();
    const doc = await Setting.findOne({ key }).lean<{ value?: string } | null>();
    return Response.json({ key, value: doc?.value ?? "" });
  } catch (err) {
    return serverError("GET /api/settings/[key] failed", err);
  }
}

// PUT /api/settings/[key] — upsert a setting value (admin only).
export async function PUT(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { key } = await params;
  try {
    const body = await req.json();
    const value = String(body.value ?? "");
    await connectDB();
    await Setting.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
    return Response.json({ key, value });
  } catch (err) {
    return serverError("PUT /api/settings/[key] failed", err);
  }
}
