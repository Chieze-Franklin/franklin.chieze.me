import mongoose, { Schema, models } from "mongoose";

const ThoughtSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: String,
    coverImage: String,
    images: [String],
    date: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tags: [String],
    size: { type: String, enum: ["sm", "md", "lg", "xl"], default: "md" },
    type: { type: String, enum: ["article", "blog", "vlog"], required: true, default: "article" },
    url: String,
    videoUrl: String,
    readingTime: Number,
    links: [{ label: String, url: String, _id: false }],
    awards: [{ type: Schema.Types.ObjectId, ref: "Award" }],
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    tools: [{ type: Schema.Types.ObjectId, ref: "Tool" }],
  },
  { timestamps: true }
);

export const Thought = models.Thought ?? mongoose.model("Thought", ThoughtSchema);
