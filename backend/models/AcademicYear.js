import mongoose from "mongoose";

const AcademicYearSchema = new mongoose.Schema(
  {
    current: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    totalStudents: { type: Number, default: 0 },
    graduatedStudents: { type: Number, default: 0 },
    pendingClearanceStudents: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("AcademicYear", AcademicYearSchema);