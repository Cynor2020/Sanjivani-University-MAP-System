import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import ActivityCategory from "../models/ActivityCategory.js";
dotenv.config();

await connectDB();

const categories = [
  // Technical Competitions
  {
    name: "Technical Competitions",
    description: "Participation in technical competitions",
    points: 10
  },
  {
    name: "Hackathons",
    description: "Participation in hackathons",
    points: 15
  },
  {
    name: "Coding Competitions",
    description: "Participation in coding competitions",
    points: 10
  },
  {
    name: "Project Competitions",
    description: "Participation in project competitions",
    points: 15
  },
  {
    name: "Technical Paper Presentation",
    description: "Presenting technical papers",
    points: 15
  },
  {
    name: "Technical Paper Publication",
    description: "Publishing technical papers",
    points: 20
  },
  {
    name: "Patent Filed",
    description: "Filing patents",
    points: 25
  },
  {
    name: "Patent Published",
    description: "Publishing patents",
    points: 30
  },
  {
    name: "MOOC Courses",
    description: "Completing MOOC courses",
    points: 5
  },
  {
    name: "Certifications",
    description: "Obtaining professional certifications",
    points: 10
  },

  // Sports
  {
    name: "Sports Participation",
    description: "Participation in sports events",
    points: 5
  },
  {
    name: "Sports Winner",
    description: "Winning in sports events",
    points: 10
  },
  {
    name: "Sports Captain",
    description: "Being captain of sports teams",
    points: 15
  },

  // Cultural Activities
  {
    name: "Cultural Events Participation",
    description: "Participation in cultural events",
    points: 5
  },
  {
    name: "Cultural Events Winner",
    description: "Winning in cultural events",
    points: 10
  },
  {
    name: "Cultural Event Organization",
    description: "Organizing cultural events",
    points: 15
  },

  // Social Activities
  {
    name: "NSS/NCC Activities",
    description: "Participation in NSS/NCC activities",
    points: 10
  },
  {
    name: "Social Campaigns",
    description: "Participation in social campaigns",
    points: 10
  },
  {
    name: "Blood Donation",
    description: "Blood donation activities",
    points: 5
  },
  {
    name: "Community Service",
    description: "Community service activities",
    points: 10
  },

  // Academic Activities
  {
    name: "Seminar/Workshop Participation",
    description: "Participation in seminars/workshops",
    points: 5
  },
  {
    name: "Seminar/Workshop Presentation",
    description: "Presenting in seminars/workshops",
    points: 10
  },
  {
    name: "Seminar/Workshop Organization",
    description: "Organizing seminars/workshops",
    points: 15
  },
  {
    name: "Guest Lecture Attendance",
    description: "Attending guest lectures",
    points: 5
  },
  {
    name: "Industrial Visit",
    description: "Participating in industrial visits",
    points: 10
  },
  {
    name: "Internship",
    description: "Completing internships",
    points: 20
  },
  {
    name: "Industrial Training",
    description: "Completing industrial training",
    points: 25
  },
  {
    name: "Research Activities",
    description: "Participating in research activities",
    points: 20
  },
  {
    name: "Conference Participation",
    description: "Participating in conferences",
    points: 15
  },
  {
    name: "Conference Presentation",
    description: "Presenting in conferences",
    points: 20
  },
  {
    name: "Conference Publication",
    description: "Publishing in conferences",
    points: 25
  },
  {
    name: "Quiz Competition",
    description: "Participating in quiz competitions",
    points: 10
  },
  {
    name: "Debate Competition",
    description: "Participating in debate competitions",
    points: 10
  },
  {
    name: "Group Discussion",
    description: "Participating in group discussions",
    points: 5
  }
];

for (const category of categories) {
  const existing = await ActivityCategory.findOne({ name: category.name });
  if (!existing) {
    await ActivityCategory.create(category);
    console.log(`Created category: ${category.name}`);
  }
}

console.log("All activity categories seeded successfully!");
process.exit(0);