import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, required: true },
    action: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: { type: String }
  },
  { timestamps: true }
);

// Index for timestamp queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ ip: 1 });

export default mongoose.model("AuditLog", AuditLogSchema);
