import mongoose, { Schema, models } from "mongoose";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    url: String,
    logo: String,
    description: String,
  },
  { timestamps: true }
);

export const Company = models.Company ?? mongoose.model("Company", CompanySchema);
