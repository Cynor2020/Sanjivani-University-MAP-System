import mongoose from "mongoose";

const ActivityCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    pointsByLevel: { 
      type: Map,
      of: Number,
      default: {}
    },
    categoryType: { type: String, enum: ["technical", "sports", "cultural", "social", "academic"], default: "technical" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("ActivityCategory", ActivityCategorySchema);