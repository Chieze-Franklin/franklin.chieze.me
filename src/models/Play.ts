import mongoose, { Schema, models } from "mongoose";

const PlaySchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: String,
    coverImage: String,
    date: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tags: [String],
    size: { type: String, enum: ["sm", "md", "lg", "xl"], default: "md" },
    url: String,
    repoUrl: String,
  },
  { timestamps: true }
);

export const Play = models.Play ?? mongoose.model("Play", PlaySchema);
