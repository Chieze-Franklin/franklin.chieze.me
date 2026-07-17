import mongoose, { Schema } from "mongoose";

const ResumeSchema = new Schema(
  {
    company: { type: String, required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
    skills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    tools: [{ type: Schema.Types.ObjectId, ref: "Tool" }],
    highlights: [String],
    awards: [{ type: Schema.Types.ObjectId, ref: "Award" }],
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
