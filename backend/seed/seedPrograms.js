import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import ProgramRule from "../models/ProgramRule.js";
dotenv.config();

await connectDB();
const data = [
  { program: "B.Tech", requiredPoints: 100, durationYears: 4, minPointsPerYear: 25 },
  { program: "DSY", requiredPoints: 75, durationYears: 3, minPointsPerYear: 25 },
  { program: "MBA", requiredPoints: 60, durationYears: 2, minPointsPerYear: 30 },
  { program: "M.Tech", requiredPoints: 80, durationYears: 2, minPointsPerYear: 40 },
  { program: "B.Pharm", requiredPoints: 90, durationYears: 4, minPointsPerYear: 22 },
  { program: "M.Pharm", requiredPoints: 70, durationYears: 2, minPointsPerYear: 35 },
  { program: "BBA", requiredPoints: 80, durationYears: 3, minPointsPerYear: 26 },
  { program: "BCA", requiredPoints: 85, durationYears: 3, minPointsPerYear: 28 }
];

for (const d of data) {
  const e = await ProgramRule.findOne({ program: d.program });
  if (!e) await ProgramRule.create(d);
}

console.log("Program rules seeded successfully!");
process.exit(0);