import mongoose from "mongoose";

const ActivityCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    points: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("ActivityCategory", ActivityCategorySchema);