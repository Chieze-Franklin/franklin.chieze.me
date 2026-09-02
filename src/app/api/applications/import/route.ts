import { getApplications, importApplications } from "@/lib/job-applications";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/** One-time migration of the browser-local tracker into the database. */
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const incoming = Array.isArray(body.applications) ? body.applications : [];
    if (incoming.length === 0) {
      return Response.json({ error: "Nothing to import" }, { status: 400 });
    }

    const { imported, skipped } = await importApplications(incoming);
    return Response.json({ imported, skipped, items: await getApplications() });
  } catch (err) {
    return serverError("POST /api/applications/import failed", err);
  }
}
