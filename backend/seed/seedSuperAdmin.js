import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
dotenv.config();

await connectDB();
const email = "dean@sanjivaniuniversity.edu.in";
const existing = await User.findOne({ email });
if (!existing) {
  const hash = await bcrypt.hash("dean123", 10);
  const doc = {
    email,
    name: "Dean Mam",
    role: "super_admin",
    department: "University Administration",
    passwordHash: hash,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await User.create(doc);
  console.log("Super admin user created successfully!");
} else {
  console.log("Super admin user already exists!");
}

process.exit(0);