import mongoose from "mongoose";

const roles = ["super_admin", "director", "hod", "student"];

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: roles, required: true },
    passwordHash: { type: String },
    
    // Student fields
    prn: { type: String, sparse: true }, // PRN for students
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    currentYear: { type: String, enum: ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"] },
    academicYear: { type: String }, // Current academic year
    
    // Common fields
    mobile: { type: String },
    whatsapp: { type: String },
    address: { type: String },
    profilePhoto: { type: String }, // Cloudinary URL
    designation: { type: String }, // For directors/HODs
    
    // Status and points
    status: { type: String, default: "active", enum: ["active", "inactive", "deleted"] },
    totalPoints: { type: Number, default: 0 },
    
    // Academic progression
    year1Points: { type: Number, default: 0 },
    year2Points: { type: Number, default: 0 },
    year3Points: { type: Number, default: 0 },
    year4Points: { type: Number, default: 0 },
    year5Points: { type: Number, default: 0 },
    year6Points: { type: Number, default: 0 },
    
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

// Indexes for performance
UserSchema.index({ department: 1, currentYear: 1, academicYear: 1, status: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ prn: 1 }, { sparse: true });
UserSchema.index({ email: 1 });

export default mongoose.model("User", UserSchema);