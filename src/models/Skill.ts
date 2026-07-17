import mongoose, { Schema, models } from "mongoose";

const SkillSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
  },
  { timestamps: true }
);

export const Skill = models.Skill ?? mongoose.model("Skill", SkillSchema);
