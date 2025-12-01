import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import ActivityCategory from "../models/ActivityCategory.js";
import AcademicYear from "../models/AcademicYear.js";

// HOD: Department Analytics
export const departmentAnalytics = async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({ error: "HOD must be assigned to a department" });
    }

    // Top 10 students
    const topStudents = await User.find({
      role: "student",
      department: req.user.department,
      status: { $ne: "deleted" }
    })
      .select('name prn email totalPoints currentYear')
      .sort({ totalPoints: -1 })
      .limit(10)
      .lean();

    // Weak students (low points)
    const weakStudents = await User.find({
      role: "student",
      department: req.user.department,
      status: { $ne: "deleted" },
      totalPoints: { $lt: 50 }
    })
      .select('name prn email totalPoints currentYear')
      .sort({ totalPoints: 1 })
      .limit(10)
      .lean();

    // Category-wise chart data
    const categoryStats = await Certificate.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.department": req.user.department,
          status: "approved"
        }
      },
      {
        $group: {
          _id: "$categoryName",
          count: { $sum: 1 },
          totalPoints: { $sum: "$pointsAllocated" }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    // Department stats
    const totalStudents = await User.countDocuments({
      role: "student",
      department: req.user.department,
      status: { $ne: "deleted" }
    });

    const avgPoints = await User.aggregate([
      {
        $match: {
          role: "student",
          department: req.user.department,
          status: { $ne: "deleted" }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$totalPoints" }
        }
      }
    ]);

    res.json({
      topStudents,
      weakStudents,
      categoryStats,
      stats: {
        totalStudents,
        avgPoints: avgPoints[0]?.avg ? Math.round(avgPoints[0].avg) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Super Admin: Excellence Awards Generator
export const generateExcellenceAwards = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      status: { $ne: "deleted" }
    })
      .select('name prn email department totalPoints')
      .sort({ totalPoints: -1 })
      .lean();

    const awards = {
      platinum: students.filter(s => s.totalPoints >= 300).map(s => ({
        ...s,
        award: "Platinum",
        amount: 10000
      })),
      gold: students.filter(s => s.totalPoints >= 250 && s.totalPoints < 300).map(s => ({
        ...s,
        award: "Gold",
        amount: 5000
      })),
      silver: students.filter(s => s.totalPoints >= 200 && s.totalPoints < 250).map(s => ({
        ...s,
        award: "Silver",
        amount: 3000
      }))
    };

    res.json({
      awards,
      summary: {
        platinum: awards.platinum.length,
        gold: awards.gold.length,
        silver: awards.silver.length,
        total: awards.platinum.length + awards.gold.length + awards.silver.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
