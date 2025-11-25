import mongoose from "mongoose";

const ProgramRuleSchema = new mongoose.Schema(
  {
    program: { type: String, required: true },
    requiredPoints: { type: Number, required: true },
    durationYears: { type: Number, default: 4 },
    minPointsPerYear: { type: Number, default: 20 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("ProgramRule", ProgramRuleSchema);