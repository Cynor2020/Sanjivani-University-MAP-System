import mongoose from "mongoose";

const UploadDeadlineSchema = new mongoose.Schema(
  {
    academicYear: { type: String, required: true },
    department: { type: String, required: true },
    deadlineAt: { type: Date, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    notificationSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("UploadDeadline", UploadDeadlineSchema);