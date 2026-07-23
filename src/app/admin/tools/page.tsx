import { requireAdmin } from "@/lib/admin-page";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTaxonomy } from "@/components/admin/AdminTaxonomy";

export default async function AdminToolsPage() {
  await requireAdmin();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto">
      <AdminHeader title="Manage Tools" subtitle="Tools & technologies you can attach to work items." />
      <AdminTaxonomy
        endpoint="/api/tools"
        singular="Tool"
        displayKey="name"
        imageKey="image"
        urlKey="url"
        rowMaxWidth="max-w-2xl"
        removeNote="It will be removed from any items that reference it."
        fields={[
          { key: "image", label: "Image", type: "image" },
          { key: "name", label: "Name", required: true },
          { key: "url", label: "Website", type: "url" },
          { key: "description", label: "Description", type: "textarea" },
        ]}
      />
    </div>
  );
}
