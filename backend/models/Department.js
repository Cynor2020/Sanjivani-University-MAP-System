import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    years: [{ 
      type: String, 
      enum: ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"],
      required: true
    }],
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
