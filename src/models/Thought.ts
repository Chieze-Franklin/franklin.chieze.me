import mongoose, { Schema, models } from "mongoose";

const ThoughtSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: String,
    coverImage: String,
    date: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tags: [String],
    size: { type: String, enum: ["sm", "md", "lg", "xl"], default: "md" },
    type: { type: String, enum: ["article", "blog", "vlog"], required: true },
    videoUrl: String,
    readingTime: Number,
  },
  { timestamps: true }
);

export const Thought = models.Thought ?? mongoose.model("Thought", ThoughtSchema);
