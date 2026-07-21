import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-page";
import { getThoughtById } from "@/lib/thoughts";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default async function EditThoughtPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const item = await getThoughtById(id);
  if (!item) notFound();
  return (
    <div className="max-w-6xl mx-auto">
      <ArticleEditor item={item} />
    </div>
  );
}
