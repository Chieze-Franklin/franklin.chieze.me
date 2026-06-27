import mongoose, { Schema } from "mongoose";

const ResumeSchema = new Schema(
  {
    company: { type: String, required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String, required: true },
    skills: [String],
    tools: [String],
    highlights: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
