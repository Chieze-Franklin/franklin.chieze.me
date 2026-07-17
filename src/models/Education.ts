import mongoose, { Schema, models } from "mongoose";

const EducationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: String,
    startDate: { type: String, required: true },
    endDate: String,
    location: String,
    description: String,
  },
  { timestamps: true }
);

export const Education = models.Education ?? mongoose.model("Education", EducationSchema);
