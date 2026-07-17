import { requireAdmin } from "@/lib/admin-page";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTaxonomy } from "@/components/admin/AdminTaxonomy";

export default async function AdminAwardsPage() {
  await requireAdmin();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto">
      <AdminHeader title="Manage Awards" subtitle="Awards & certifications you can attach to work items." />
      <AdminTaxonomy
        endpoint="/api/awards"
        singular="Award"
        displayKey="title"
        removeNote="It will be removed from any items that reference it."
        fields={[
          { key: "title", label: "Title", required: true },
          { key: "issuer", label: "Issuer" },
          {
            key: "kind",
            label: "Kind",
            type: "select",
            options: [
              { value: "award", label: "Award" },
              { value: "certification", label: "Certification" },
            ],
          },
          { key: "date", label: "Date", type: "date" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "url", label: "Link", type: "url" },
          { key: "credentialId", label: "Credential ID" },
        ]}
      />
    </div>
  );
}
