import mongoose, { Schema, models } from "mongoose";

const AwardSchema = new Schema(
  {
    title: { type: String, required: true },
    issuer: String,
    date: String,
    kind: { type: String, enum: ["award", "certification"], default: "award" },
    description: String,
    url: String,
    image: String,
    credentialId: String,
  },
  { timestamps: true }
);

export const Award = models.Award ?? mongoose.model("Award", AwardSchema);
