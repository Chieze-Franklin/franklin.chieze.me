import { requireAdmin } from "@/lib/admin-page";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTaxonomy } from "@/components/admin/AdminTaxonomy";

export default async function AdminBlogsPage() {
  await requireAdmin();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto">
      <AdminHeader title="Manage Blogs" subtitle="Publications that articles can belong to." />
      <AdminTaxonomy
        endpoint="/api/blogs"
        singular="Blog"
        displayKey="title"
        imageKey="logo"
        urlKey="url"
        removeNote="Its articles stay on /thoughts but are detached from the blog."
        fields={[
          { key: "logo", label: "Logo", type: "image" },
          { key: "coverImage", label: "Cover image", type: "image" },
          { key: "title", label: "Title", required: true },
          { key: "slug", label: "Slug (optional — generated from title if blank)" },
          { key: "url", label: "Website / link", type: "url" },
          { key: "description", label: "Description", type: "textarea" },
        ]}
      />
    </div>
  );
}
