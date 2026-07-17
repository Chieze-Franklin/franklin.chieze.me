import mongoose, { Schema, models } from "mongoose";

const WorkSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: String,
    coverImage: String,
    date: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    images: [String],
    tags: [String],
    size: { type: String, enum: ["sm", "md", "lg", "xl"], default: "md" },
    url: String,
    links: [{ label: String, url: String, _id: false }],
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    awards: [{ type: Schema.Types.ObjectId, ref: "Award" }],
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    tools: [{ type: Schema.Types.ObjectId, ref: "Tool" }],
  },
  { timestamps: true }
);

export const Work = models.Work ?? mongoose.model("Work", WorkSchema);
