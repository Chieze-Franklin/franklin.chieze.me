import { requireAdmin } from "@/lib/admin-page";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminWorks } from "@/components/admin/AdminWorks";

export default async function AdminWorksPage() {
  await requireAdmin();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
      <AdminHeader
        title="Manage Works"
        subtitle="Add, edit, and remove the work items shown on the Works page."
      />
      <AdminWorks />
    </div>
  );
}
