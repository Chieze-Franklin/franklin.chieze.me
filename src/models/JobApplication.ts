import mongoose, { Schema, models } from "mongoose";
import { STATUSES } from "@/lib/applications";

const QuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
    wordLimit: Number,
    hint: String,
  },
  { _id: false }
);

const JobApplicationSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: String,
    companyWebsite: String,
    companyLinkedin: String,
    jobUrl: String,
    jobDescription: { type: String, default: "" },
    notes: String,
    status: { type: String, enum: STATUSES.map((s) => s.id), default: "saved" },
    coverLetter: String,
    questions: { type: [QuestionSchema], default: [] },
    /**
     * The id this application had in the browser-local tracker it was imported
     * from. Sparse-unique so re-running the import never duplicates a record.
     */
    localId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const JobApplication =
  models.JobApplication ?? mongoose.model("JobApplication", JobApplicationSchema);
