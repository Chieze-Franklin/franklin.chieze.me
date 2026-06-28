import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { AdminNews } from "@/components/admin/AdminNews";

export default async function AdminNewsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (email !== siteConfig.adminEmail) redirect("/");

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <a
          href="/admin"
          className="text-xs uppercase tracking-[0.3em] font-semibold mb-2 inline-block"
          style={{ color: "var(--accent)" }}
        >
          ← Admin
        </a>
        <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
          Manage News
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Add, edit, and remove the news items shown on the landing page.
        </p>
      </div>

      <AdminNews />
    </div>
  );
}
