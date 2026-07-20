import { connectDB } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";
import type { Blog as BlogType } from "@/types";

interface BlogDoc {
  _id: unknown;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  logo?: string;
  url?: string;
}

export function serializeBlog(d: BlogDoc): BlogType {
  return {
    _id: String(d._id),
    title: d.title,
    slug: d.slug,
    description: d.description,
    coverImage: d.coverImage,
    logo: d.logo,
    url: d.url,
  };
}

export async function getBlogs(): Promise<BlogType[]> {
  await connectDB();
  const docs = await Blog.find().sort({ title: 1 }).lean<BlogDoc[]>();
  return docs.map(serializeBlog);
}

export async function getBlogBySlug(slug: string): Promise<BlogType | null> {
  await connectDB();
  const doc = await Blog.findOne({ slug }).lean<BlogDoc | null>();
  return doc ? serializeBlog(doc) : null;
}
