import mongoose, { Schema, models } from "mongoose";

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    coverImage: String,
    logo: String,
    url: String,
  },
  { timestamps: true }
);

export const Blog = models.Blog ?? mongoose.model("Blog", BlogSchema);
