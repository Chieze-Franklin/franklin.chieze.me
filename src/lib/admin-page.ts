import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

/**
 * Guard for admin pages (server components). Redirects non-admins away and
 * returns the signed-in admin's email.
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (email !== siteConfig.adminEmail) redirect("/");
  return email as string;
}

/** Whether the current viewer is the site admin (no redirect). */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return user?.emailAddresses?.[0]?.emailAddress === siteConfig.adminEmail;
}
