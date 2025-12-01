import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    academicYear: { type: String, required: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityCategory", required: true },
    categoryName: { type: String, required: true },
    title: { type: String, required: true },
    level: { type: String, enum: ["college", "state", "national"], required: true },
    pointsAllocated: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    cloudinaryPublicId: { type: String },
    cloudinaryUrl: { type: String },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Indexes for performance
CertificateSchema.index({ userId: 1, status: 1 });
CertificateSchema.index({ status: 1 });
CertificateSchema.index({ department: 1, status: 1 });

export default mongoose.model("Certificate", CertificateSchema);
