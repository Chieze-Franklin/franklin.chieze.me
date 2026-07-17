import mongoose, { Schema, models } from "mongoose";

const ToolSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    url: String,
  },
  { timestamps: true }
);

export const Tool = models.Tool ?? mongoose.model("Tool", ToolSchema);
