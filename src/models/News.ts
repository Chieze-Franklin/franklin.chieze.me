import mongoose, { Schema } from "mongoose";

const NewsSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String },
    coverImage: { type: String },
    url: { type: String },
    date: { type: Date, required: true },
    slug: { type: String, required: true, unique: true },
    tags: [String],
    size: { type: String, enum: ["sm", "md", "lg", "xl"], default: "md" },
    awards: [{ type: Schema.Types.ObjectId, ref: "Award" }],
  },
  { timestamps: true }
);

export default mongoose.models.News || mongoose.model("News", NewsSchema);
