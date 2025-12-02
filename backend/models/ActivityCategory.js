import mongoose from "mongoose";

const ActivityCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    // Remove the single points field and add levels array
    levels: [{
      name: { type: String, required: true },
      points: { type: Number, default: 0 }
    }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for category lookup
ActivityCategorySchema.index({ name: 1, isActive: 1 });

export default mongoose.model("ActivityCategory", ActivityCategorySchema);