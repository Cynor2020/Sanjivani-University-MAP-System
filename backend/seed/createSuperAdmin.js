import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const createSuperAdmin = async () => {
  await connectDB();
  
  try {
    const email = "superadmin@sanjivani.edu.in";
    const existing = await User.findOne({ email });
    
    if (existing) {
      console.log("ℹ️ Super Admin already exists with email:", email);
      console.log("User details:", {
        id: existing._id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        department: existing.department
      });
      
      // If the existing user has an invalid department, let's fix it
      if (existing.department && typeof existing.department === 'string') {
        console.log("🔧 Fixing invalid department reference...");
        existing.department = undefined;
        await existing.save();
        console.log("✅ Department reference fixed");
      }
    } else {
      const hash = await bcrypt.hash("SuperAdmin@123", 10);
      const superAdmin = await User.create({
        email,
        name: "Super Admin",
        role: "super_admin",
        passwordHash: hash,
        status: "active"
      });
      console.log("✅ Super Admin created:", email, "/ SuperAdmin@123");
      console.log("User ID:", superAdmin._id);
    }
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error.message);
  } finally {
    process.exit(0);
  }
};

createSuperAdmin();