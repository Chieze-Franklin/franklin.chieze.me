import mongoose, { Schema, models } from "mongoose";

const WorkSchema = new Schema(
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
  },
  { timestamps: true }
);

export const Work = models.Work ?? mongoose.model("Work", WorkSchema);
