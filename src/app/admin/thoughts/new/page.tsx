import { requireAdmin } from "@/lib/admin-page";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default async function NewThoughtPage() {
  await requireAdmin();
  return (
    <div className="max-w-6xl mx-auto">
      <ArticleEditor />
    </div>
  );
}
