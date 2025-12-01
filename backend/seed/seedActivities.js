import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import ActivityCategory from "../models/ActivityCategory.js";
dotenv.config();

await connectDB();

// 38 Activities with exact points as per requirements
const activities = [
  // Technical Competitions (10 points base)
  { name: "Technical Competition - College Level", points: 10, level: "college", program: "All" },
  { name: "Technical Competition - State Level", points: 15, level: "state", program: "All" },
  { name: "Technical Competition - National Level", points: 20, level: "national", program: "All" },
  
  // Hackathons (15 points base)
  { name: "Hackathon - College Level", points: 15, level: "college", program: "All" },
  { name: "Hackathon - State Level", points: 22, level: "state", program: "All" },
  { name: "Hackathon - National Level", points: 30, level: "national", program: "All" },
  
  // Coding Competitions (10 points base)
  { name: "Coding Competition - College Level", points: 10, level: "college", program: "All" },
  { name: "Coding Competition - State Level", points: 15, level: "state", program: "All" },
  { name: "Coding Competition - National Level", points: 20, level: "national", program: "All" },
  
  // Project Competitions (15 points base)
  { name: "Project Competition - College Level", points: 15, level: "college", program: "All" },
  { name: "Project Competition - State Level", points: 22, level: "state", program: "All" },
  { name: "Project Competition - National Level", points: 30, level: "national", program: "All" },
  
  // Paper Presentation (15 points base)
  { name: "Paper Presentation - College Level", points: 15, level: "college", program: "All" },
  { name: "Paper Presentation - State Level", points: 22, level: "state", program: "All" },
  { name: "Paper Presentation - National Level", points: 30, level: "national", program: "All" },
  
  // Paper Publication (20 points base)
  { name: "Paper Publication - College Level", points: 20, level: "college", program: "All" },
  { name: "Paper Publication - State Level", points: 30, level: "state", program: "All" },
  { name: "Paper Publication - National Level", points: 40, level: "national", program: "All" },
  
  // Patents (25-30 points)
  { name: "Patent Filed", points: 25, level: "college", program: "All" },
  { name: "Patent Published", points: 30, level: "state", program: "All" },
  
  // MOOC & Certifications (5-10 points)
  { name: "MOOC Course Completion", points: 5, level: "college", program: "All" },
  { name: "Professional Certification", points: 10, level: "college", program: "All" },
  
  // Sports (5-15 points)
  { name: "Sports Participation - College Level", points: 5, level: "college", program: "All" },
  { name: "Sports Winner - College Level", points: 10, level: "college", program: "All" },
  { name: "Sports Winner - State Level", points: 15, level: "state", program: "All" },
  { name: "Sports Winner - National Level", points: 20, level: "national", program: "All" },
  { name: "Sports Captain", points: 15, level: "college", program: "All" },
  
  // Cultural Activities (5-15 points)
  { name: "Cultural Event Participation", points: 5, level: "college", program: "All" },
  { name: "Cultural Event Winner - College Level", points: 10, level: "college", program: "All" },
  { name: "Cultural Event Winner - State Level", points: 15, level: "state", program: "All" },
  { name: "Cultural Event Organization", points: 15, level: "college", program: "All" },
  
  // Social Activities (5-10 points)
  { name: "NSS/NCC Activities", points: 10, level: "college", program: "All" },
  { name: "Social Campaign Participation", points: 10, level: "college", program: "All" },
  { name: "Blood Donation", points: 5, level: "college", program: "All" },
  { name: "Community Service", points: 10, level: "college", program: "All" },
  
  // Academic Activities (5-25 points)
  { name: "Seminar/Workshop Participation", points: 5, level: "college", program: "All" },
  { name: "Seminar/Workshop Presentation", points: 10, level: "college", program: "All" },
  { name: "Seminar/Workshop Organization", points: 15, level: "college", program: "All" },
  { name: "Guest Lecture Attendance", points: 5, level: "college", program: "All" },
  { name: "Industrial Visit", points: 10, level: "college", program: "All" },
  { name: "Internship Completion", points: 20, level: "college", program: "All" },
  { name: "Industrial Training", points: 25, level: "college", program: "All" },
  { name: "Research Activities", points: 20, level: "college", program: "All" },
  { name: "Conference Participation", points: 15, level: "college", program: "All" },
  { name: "Conference Presentation", points: 20, level: "college", program: "All" },
  { name: "Conference Publication", points: 25, level: "college", program: "All" },
  { name: "Quiz Competition", points: 10, level: "college", program: "All" },
  { name: "Debate Competition", points: 10, level: "college", program: "All" },
  { name: "Group Discussion", points: 5, level: "college", program: "All" }
];

for (const activity of activities) {
  const existing = await ActivityCategory.findOne({ name: activity.name });
  if (!existing) {
    await ActivityCategory.create({
      name: activity.name,
      description: activity.name,
      points: activity.points,
      level: activity.level,
      program: activity.program,
      isActive: true
    });
    console.log(`✅ Created activity: ${activity.name} (${activity.points} points)`);
  } else {
    console.log(`ℹ️  Activity already exists: ${activity.name}`);
  }
}

console.log(`✅ All ${activities.length} activities seeded successfully!`);
process.exit(0);
