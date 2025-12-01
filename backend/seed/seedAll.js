import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import ActivityCategory from "../models/ActivityCategory.js";
import AcademicYear from "../models/AcademicYear.js";
import bcrypt from "bcrypt";

dotenv.config();

await connectDB();

console.log("🌱 Starting seed process...\n");

// 1. Seed Super Admin
console.log("1. Seeding Super Admin...");
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
  console.log("   ✅ Super admin created: dean@gmail.com / dean@123");
} else {
  console.log("   ℹ️  Super admin already exists");
}

// 2. Seed Departments
console.log("\n2. Seeding Departments...");
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
    console.log(`   ✅ Created: ${dept.name}`);
  }
}

// 3. Seed Activities (38 activities)
console.log("\n3. Seeding Activities...");
const activities = [
  { name: "Technical Competition - College Level", points: 10, level: "college" },
  { name: "Technical Competition - State Level", points: 15, level: "state" },
  { name: "Technical Competition - National Level", points: 20, level: "national" },
  { name: "Hackathon - College Level", points: 15, level: "college" },
  { name: "Hackathon - State Level", points: 22, level: "state" },
  { name: "Hackathon - National Level", points: 30, level: "national" },
  { name: "Coding Competition - College Level", points: 10, level: "college" },
  { name: "Coding Competition - State Level", points: 15, level: "state" },
  { name: "Coding Competition - National Level", points: 20, level: "national" },
  { name: "Project Competition - College Level", points: 15, level: "college" },
  { name: "Project Competition - State Level", points: 22, level: "state" },
  { name: "Project Competition - National Level", points: 30, level: "national" },
  { name: "Paper Presentation - College Level", points: 15, level: "college" },
  { name: "Paper Presentation - State Level", points: 22, level: "state" },
  { name: "Paper Presentation - National Level", points: 30, level: "national" },
  { name: "Paper Publication - College Level", points: 20, level: "college" },
  { name: "Paper Publication - State Level", points: 30, level: "state" },
  { name: "Paper Publication - National Level", points: 40, level: "national" },
  { name: "Patent Filed", points: 25, level: "college" },
  { name: "Patent Published", points: 30, level: "state" },
  { name: "MOOC Course Completion", points: 5, level: "college" },
  { name: "Professional Certification", points: 10, level: "college" },
  { name: "Sports Participation - College Level", points: 5, level: "college" },
  { name: "Sports Winner - College Level", points: 10, level: "college" },
  { name: "Sports Winner - State Level", points: 15, level: "state" },
  { name: "Sports Winner - National Level", points: 20, level: "national" },
  { name: "Sports Captain", points: 15, level: "college" },
  { name: "Cultural Event Participation", points: 5, level: "college" },
  { name: "Cultural Event Winner - College Level", points: 10, level: "college" },
  { name: "Cultural Event Winner - State Level", points: 15, level: "state" },
  { name: "Cultural Event Organization", points: 15, level: "college" },
  { name: "NSS/NCC Activities", points: 10, level: "college" },
  { name: "Social Campaign Participation", points: 10, level: "college" },
  { name: "Blood Donation", points: 5, level: "college" },
  { name: "Community Service", points: 10, level: "college" },
  { name: "Seminar/Workshop Participation", points: 5, level: "college" },
  { name: "Seminar/Workshop Presentation", points: 10, level: "college" },
  { name: "Seminar/Workshop Organization", points: 15, level: "college" },
  { name: "Guest Lecture Attendance", points: 5, level: "college" },
  { name: "Industrial Visit", points: 10, level: "college" },
  { name: "Internship Completion", points: 20, level: "college" },
  { name: "Industrial Training", points: 25, level: "college" },
  { name: "Research Activities", points: 20, level: "college" },
  { name: "Conference Participation", points: 15, level: "college" },
  { name: "Conference Presentation", points: 20, level: "college" },
  { name: "Conference Publication", points: 25, level: "college" },
  { name: "Quiz Competition", points: 10, level: "college" },
  { name: "Debate Competition", points: 10, level: "college" },
  { name: "Group Discussion", points: 5, level: "college" }
];

let activityCount = 0;
for (const activity of activities) {
  const existing = await ActivityCategory.findOne({ name: activity.name });
  if (!existing) {
    await ActivityCategory.create({
      name: activity.name,
      description: activity.name,
      points: activity.points,
      level: activity.level,
      isActive: true
    });
    activityCount++;
  }
}
console.log(`   ✅ Created ${activityCount} new activities (${activities.length} total)`);

// 4. Seed Academic Year
console.log("\n4. Seeding Academic Year...");
const currentYear = await AcademicYear.findOne({ isActive: true });
if (!currentYear) {
  const currentDate = new Date();
  const year = `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`;
  await AcademicYear.create({
    current: year,
    startedAt: currentDate,
    isActive: true
  });
  console.log(`   ✅ Created academic year: ${year}`);
} else {
  console.log(`   ℹ️  Academic year already exists: ${currentYear.current}`);
}

console.log("\n✅ All seed data created successfully!");
console.log("\n📝 Login credentials:");
console.log("   Email: dean@gmail.com");
console.log("   Password: dean@123");
console.log("\n🚀 Ready to use!");

process.exit(0);

