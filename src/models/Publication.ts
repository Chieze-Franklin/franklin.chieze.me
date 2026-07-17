import mongoose, { Schema, models } from "mongoose";

const PublicationSchema = new Schema(
  {
    title: { type: String, required: true },
    venue: { type: String, required: true },
    year: { type: Number, required: true },
    authors: [String],
    type: {
      type: String,
      enum: ["journal", "conference", "preprint", "chapter", "thesis"],
      default: "conference",
    },
    url: String,
    description: String,
  },
  { timestamps: true }
);

export const Publication = models.Publication ?? mongoose.model("Publication", PublicationSchema);
