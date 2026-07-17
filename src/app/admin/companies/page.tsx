import { requireAdmin } from "@/lib/admin-page";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTaxonomy } from "@/components/admin/AdminTaxonomy";

export default async function AdminCompaniesPage() {
  await requireAdmin();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto">
      <AdminHeader title="Manage Companies" subtitle="Companies you've worked with or founded." />
      <AdminTaxonomy
        endpoint="/api/companies"
        singular="Company"
        displayKey="name"
        imageKey="logo"
        removeNote="Its job roles will also be deleted, and it will be unset on any works that reference it."
        fields={[
          { key: "name", label: "Name", required: true },
          { key: "url", label: "Website", type: "url" },
          { key: "logo", label: "Logo", type: "image" },
          { key: "description", label: "Description", type: "textarea" },
        ]}
      />
    </div>
  );
}
