import { auth, currentUser } from "@clerk/nextjs/server";
import { siteConfig } from "@/config/site";

/**
 * Guard for admin-only API routes. Returns a Response to send back when the
 * caller is not the site owner, or `null` when the request is authorised.
 *
 *   const denied = await guardAdmin();
 *   if (denied) return denied;
 */
export async function guardAdmin(): Promise<Response | null> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  if (user?.emailAddresses?.[0]?.emailAddress !== siteConfig.adminEmail) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
