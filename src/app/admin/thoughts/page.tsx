import { requireAdmin } from "@/lib/admin-page";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminThoughts } from "@/components/admin/AdminThoughts";

export default async function AdminThoughtsPage() {
  await requireAdmin();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
      <AdminHeader
        title="Manage Thoughts"
        subtitle="Add, edit, and remove the articles, posts & vlogs shown on the Thoughts page."
      />
      <AdminThoughts />
    </div>
  );
}
