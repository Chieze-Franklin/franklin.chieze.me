import mongoose, { Schema, models } from "mongoose";

const HobbySchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
  },
  { timestamps: true }
);

export const Hobby = models.Hobby ?? mongoose.model("Hobby", HobbySchema);
