import mongoose, { Schema, models } from "mongoose";

// Simple key/value store for editable singleton content (e.g. the résumé intro).
const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Setting = models.Setting ?? mongoose.model("Setting", SettingSchema);
