import mongoose from "mongoose";

const AcademicYearSchema = new mongoose.Schema(
  {
    current: { type: String, required: true, unique: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for active academic year lookup
AcademicYearSchema.index({ isActive: 1 });

export default mongoose.model("AcademicYear", AcademicYearSchema);
