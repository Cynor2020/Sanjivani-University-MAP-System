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
    categoryType: "technical",
    pointsByLevel: {
      college: 10,
      state: 20,
      national: 30
    }
  },
  {
    name: "Hackathons",
    description: "Participation in hackathons",
    categoryType: "technical",
    pointsByLevel: {
      college: 15,
      state: 25,
      national: 35
    }
  },
  {
    name: "Coding Competitions",
    description: "Participation in coding competitions",
    categoryType: "technical",
    pointsByLevel: {
      college: 10,
      state: 20,
      national: 30
    }
  },
  {
    name: "Project Competitions",
    description: "Participation in project competitions",
    categoryType: "technical",
    pointsByLevel: {
      college: 15,
      state: 25,
      national: 35
    }
  },
  {
    name: "Technical Paper Presentation",
    description: "Presenting technical papers",
    categoryType: "technical",
    pointsByLevel: {
      college: 15,
      state: 25,
      national: 35
    }
  },
  {
    name: "Technical Paper Publication",
    description: "Publishing technical papers",
    categoryType: "technical",
    pointsByLevel: {
      college: 20,
      state: 30,
      national: 40
    }
  },
  {
    name: "Patent Filed",
    description: "Filing patents",
    categoryType: "technical",
    pointsByLevel: {
      college: 25,
      state: 35,
      national: 45
    }
  },
  {
    name: "Patent Published",
    description: "Publishing patents",
    categoryType: "technical",
    pointsByLevel: {
      college: 30,
      state: 40,
      national: 50
    }
  },
  {
    name: "MOOC Courses",
    description: "Completing MOOC courses",
    categoryType: "technical",
    pointsByLevel: {
      college: 5,
      state: 10,
      national: 15
    }
  },
  {
    name: "Certifications",
    description: "Obtaining professional certifications",
    categoryType: "technical",
    pointsByLevel: {
      college: 10,
      state: 15,
      national: 20
    }
  },

  // Sports
  {
    name: "Sports Participation",
    description: "Participation in sports events",
    categoryType: "sports",
    pointsByLevel: {
      college: 5,
      state: 10,
      national: 15
    }
  },
  {
    name: "Sports Winner",
    description: "Winning in sports events",
    categoryType: "sports",
    pointsByLevel: {
      college: 10,
      state: 20,
      national: 30
    }
  },
  {
    name: "Sports Captain",
    description: "Being captain of sports teams",
    categoryType: "sports",
    pointsByLevel: {
      college: 15,
      state: 25,
      national: 35
    }
  },

  // Cultural Activities
  {
    name: "Cultural Events Participation",
    description: "Participation in cultural events",
    categoryType: "cultural",
    pointsByLevel: {
      college: 5,
      state: 10,
      national: 15
    }
  },
  {
    name: "Cultural Events Winner",
    description: "Winning in cultural events",
    categoryType: "cultural",
    pointsByLevel: {
      college: 10,
      state: 20,
      national: 30
    }
  },
  {
    name: "Cultural Event Organization",
    description: "Organizing cultural events",
    categoryType: "cultural",
    pointsByLevel: {
      college: 15,
      state: 25,
      national: 35
    }
  },

  // Social Activities
  {
    name: "NSS/NCC Activities",
    description: "Participation in NSS/NCC activities",
    categoryType: "social",
    pointsByLevel: {
      college: 10,
      state: 15,
      national: 20
    }
  },
  {
    name: "Social Campaigns",
    description: "Participation in social campaigns",
    categoryType: "social",
    pointsByLevel: {
      college: 10,
      state: 15,
      national: 20
    }
  },
  {
    name: "Blood Donation",
    description: "Blood donation activities",
    categoryType: "social",
    pointsByLevel: {
      college: 5,
      state: 10,
      national: 15
    }
  },
  {
    name: "Community Service",
    description: "Community service activities",
    categoryType: "social",
    pointsByLevel: {
      college: 10,
      state: 15,
      national: 20
    }
  },

  // Academic Activities
  {
    name: "Seminar/Workshop Participation",
    description: "Participation in seminars/workshops",
    categoryType: "academic",
    pointsByLevel: {
      college: 5,
      state: 10,
      national: 15
    }
  },
  {
    name: "Seminar/Workshop Presentation",
    description: "Presenting in seminars/workshops",
    categoryType: "academic",
    pointsByLevel: {
      college: 10,
      state: 15,
      national: 20
    }
  },
  {
    name: "Seminar/Workshop Organization",
    description: "Organizing seminars/workshops",
    categoryType: "academic",
    pointsByLevel: {
      college: 15,
      state: 20,
      national: 25
    }
  },
  {
    name: "Guest Lecture Attendance",
    description: "Attending guest lectures",
    categoryType: "academic",
    pointsByLevel: {
      college: 5,
      state: 10,
      national: 15
    }
  },
  {
    name: "Industrial Visit",
    description: "Participating in industrial visits",
    categoryType: "academic",
    pointsByLevel: {
      college: 10,
      state: 15,
      national: 20
    }
  },
  {
    name: "Internship",
    description: "Completing internships",
    categoryType: "academic",
    pointsByLevel: {
      college: 20,
      state: 30,
      national: 40
    }
  },
  {
    name: "Industrial Training",
    description: "Completing industrial training",
    categoryType: "academic",
    pointsByLevel: {
      college: 25,
      state: 35,
      national: 45
    }
  },
  {
    name: "Research Activities",
    description: "Participating in research activities",
    categoryType: "academic",
    pointsByLevel: {
      college: 20,
      state: 30,
      national: 40
    }
  },
  {
    name: "Conference Participation",
    description: "Participating in conferences",
    categoryType: "academic",
    pointsByLevel: {
      college: 15,
      state: 25,
      national: 35
    }
  },
  {
    name: "Conference Presentation",
    description: "Presenting in conferences",
    categoryType: "academic",
    pointsByLevel: {
      college: 20,
      state: 30,
      national: 40
    }
  },
  {
    name: "Conference Publication",
    description: "Publishing in conferences",
    categoryType: "academic",
    pointsByLevel: {
      college: 25,
      state: 35,
      national: 45
    }
  },
  {
    name: "Quiz Competition",
    description: "Participating in quiz competitions",
    categoryType: "academic",
    pointsByLevel: {
      college: 10,
      state: 15,
      national: 20
    }
  },
  {
    name: "Debate Competition",
    description: "Participating in debate competitions",
    categoryType: "academic",
    pointsByLevel: {
      college: 10,
      state: 15,
      national: 20
    }
  },
  {
    name: "Group Discussion",
    description: "Participating in group discussions",
    categoryType: "academic",
    pointsByLevel: {
      college: 5,
      state: 10,
      national: 15
    }
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