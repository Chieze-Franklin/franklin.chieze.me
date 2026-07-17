import mongoose, { Schema, models } from "mongoose";

// A role held at a company. Multiple roles can belong to the same company.
const JobRoleSchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
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

export const JobRole = models.JobRole ?? mongoose.model("JobRole", JobRoleSchema);
