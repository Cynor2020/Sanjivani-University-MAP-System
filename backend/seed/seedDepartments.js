import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Department from "../models/Department.js";
dotenv.config();

await connectDB();

const departments = [
  { name: "AIDS", years: ["First", "Second", "Third", "Fourth"] },
  { name: "CSE", years: ["First", "Second", "Third", "Fourth"] },
  { name: "IT", years: ["First", "Second", "Third", "Fourth"] },
  { name: "MECH", years: ["First", "Second", "Third", "Fourth"] },
  { name: "CIVIL", years: ["First", "Second", "Third", "Fourth"] },
  { name: "E&TC", years: ["First", "Second", "Third", "Fourth"] },
  { name: "EEE", years: ["First", "Second", "Third", "Fourth"] },
  { name: "CHEM", years: ["First", "Second", "Third", "Fourth"] },
  { name: "B.Pharm", years: ["First", "Second", "Third", "Fourth"] },
  { name: "M.Pharm", years: ["First", "Second"] },
  { name: "MBA", years: ["First", "Second"] },
  { name: "M.Tech", years: ["First", "Second"] }
];

for (const dept of departments) {
  const existing = await Department.findOne({ name: dept.name });
  if (!existing) {
    await Department.create(dept);
    console.log(`✅ Created department: ${dept.name}`);
  } else {
    console.log(`ℹ️  Department already exists: ${dept.name}`);
  }
}

console.log("✅ All departments seeded successfully!");
process.exit(0);

