import { requireAdmin } from "@/lib/admin-page";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPlays } from "@/components/admin/AdminPlays";

export default async function AdminPlaysPage() {
  await requireAdmin();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
      <AdminHeader
        title="Manage Plays"
        subtitle="Add, edit, and remove the side projects & experiments shown on the Plays page."
      />
      <AdminPlays />
    </div>
  );
}
