import mongoose from "mongoose";

const roles = ["super_admin", "director_admin", "hod", "mentor", "student"];

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: roles, required: true },
    passwordHash: { type: String },
    division: { type: String },
    department: { type: String },
    program: { type: String },
    currentYear: { type: Number },
    status: { type: String, default: "active" },
    totalPoints: { type: Number, default: 0 },
    pendingClearance: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    enrollmentNumber: { 
      type: String, 
      required: function() { return this.role === "student"; },
      unique: function() { return this.role === "student"; } // Make unique for students
    },
    phoneNumber: { type: String },
    address: { type: String },
    dateOfBirth: { type: Date },
    admissionYear: { type: Number },
    graduationYear: { type: Number },
    // For tracking academic progression
    year1Points: { type: Number, default: 0 },
    year2Points: { type: Number, default: 0 },
    year3Points: { type: Number, default: 0 },
    year4Points: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);