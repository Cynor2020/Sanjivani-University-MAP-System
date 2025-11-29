import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const test = async () => {
  await connectDB();
  
  // Check super admins
  const superAdmins = await User.find({ role: "super_admin" });
  console.log("Super Admins:", superAdmins);
  
  // Check directors
  const directors = await User.find({ role: "director_admin" });
  console.log("Directors:", directors);
  
  process.exit(0);
};

test();