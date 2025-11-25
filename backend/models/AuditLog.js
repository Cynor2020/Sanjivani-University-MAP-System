import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: { type: String },
    email: { type: String },
    role: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    action: { type: String, required: true },
    details: { type: Object, default: {} },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    resourceType: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", AuditLogSchema);