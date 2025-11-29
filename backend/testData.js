import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Department from "./models/Department.js";
import User from "./models/User.js";

dotenv.config();

const test = async () => {
  await connectDB();
  
  // Check departments
  const departments = await Department.find({});
  console.log("Departments:", departments);
  
  // Check HODs
  const hods = await User.find({ role: "hod" });
  console.log("HODs:", hods);
  
  process.exit(0);
};

test();