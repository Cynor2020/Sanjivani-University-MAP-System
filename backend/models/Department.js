import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    years: [{ 
      type: String, 
      enum: ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"],
      required: true
    }],
    // Simplified year requirements - only max points per year
    yearRequirements: {
      type: Map,
      of: {
        points: { type: Number, default: 100 } // Renamed from maxPoints to points
      }
    },
    hod: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      default: null
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for department name
DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ isActive: 1 });

export default mongoose.model("Department", DepartmentSchema);