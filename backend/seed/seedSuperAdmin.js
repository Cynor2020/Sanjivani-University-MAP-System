import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
dotenv.config();

await connectDB();

const email = "dean@gmail.com";
const existing = await User.findOne({ email });
if (!existing) {
  const hash = await bcrypt.hash("dean@123", 10);
  await User.create({
    email,
    name: "Dean Mam",
    role: "super_admin",
    passwordHash: hash,
    status: "active"
  });
  console.log("✅ Super admin created: dean@gmail.com / dean@123");
} else {
  console.log("ℹ️  Super admin already exists");
}

process.exit(0);
