import mongoose from "mongoose";

const UploadLockSchema = new mongoose.Schema(
  {
    department: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Department", 
      required: true,
      unique: true
    },
    isActive: { type: Boolean, default: true }, // Toggle: Active/Inactive
    deadlineAt: { type: Date }, // Future date-time when upload gets blocked
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { timestamps: true }
);

// Index for department lookup
UploadLockSchema.index({ department: 1 });
UploadLockSchema.index({ isActive: 1, deadlineAt: 1 });

export default mongoose.model("UploadLock", UploadLockSchema);

