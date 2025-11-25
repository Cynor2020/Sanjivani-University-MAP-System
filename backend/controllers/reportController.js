import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import ActivityCategory from "../models/ActivityCategory.js";
import ProgramRule from "../models/ProgramRule.js";
import AcademicYear from "../models/AcademicYear.js";
import Papa from "papaparse";

export const universitySummary = async (req, res) => {
  try {
    // Get current academic year
    const currentAcademicYear = await AcademicYear.findOne({ isActive: true });
    
    // Get total counts
    const totalStudents = await User.countDocuments({ role: "student", status: "active" });
    const totalAlumni = await User.countDocuments({ role: "student", status: "alumni" });
    const totalPendingClearance = await User.countDocuments({ role: "student", status: "pending_clearance" });
    
    // Get certificate statistics
    const totalCertificates = await Certificate.countDocuments();
    const approvedCertificates = await Certificate.countDocuments({ status: "approved" });
    const pendingCertificates = await Certificate.countDocuments({ status: "pending" });
    const rejectedCertificates = await Certificate.countDocuments({ status: "rejected" });
    
    // Get average points
    const avgPointsResult = await User.aggregate([
      {
        $match: {
          role: "student",
          status: "active"
        }
      },
      {
        $group: {
          _id: null,
          avgPoints: { $avg: "$totalPoints" }
        }
      }
    ]);
    
    const avgPoints = avgPointsResult.length > 0 ? Math.round(avgPointsResult[0].avgPoints) : 0;
    
    res.json({
      summary: {
        totalStudents,
        totalAlumni,
        totalPendingClearance,
        totalCertificates,
        approvedCertificates,
        pendingCertificates,
        rejectedCertificates,
        avgPoints,
        academicYear: currentAcademicYear?.current || null
      }
    });
  } catch (error) {
    console.error("Error fetching university summary:", error);
    res.status(500).json({ error: "Failed to fetch university summary" });
  }
};

export const departmentReport = async (req, res) => {
  try {
    const { department, academicYear } = req.query;
    
    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }
    
    // Build filter for certificates
    const certFilter = { 
      'userId.department': department 
    };
    
    if (academicYear) {
      certFilter.academicYear = academicYear;
    }
    
    // Get department statistics
    const totalStudents = await User.countDocuments({ 
      role: "student", 
      department,
      status: "active"
    });
    
    // Get certificates grouped by status
    const certificateStats = await Certificate.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $match: {
          "user.department": department,
          ...(academicYear && { academicYear: academicYear })
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalPoints: { $sum: "$pointsAllocated" }
        }
      }
    ]);
    
    // Format certificate stats
    const formattedStats = {
      approved: 0,
      pending: 0,
      rejected: 0,
      totalPoints: 0
    };
    
    certificateStats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.totalPoints += stat.totalPoints;
    });
    
    // Get top categories
    const topCategories = await Certificate.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $match: {
          "user.department": department,
          status: "approved",
          ...(academicYear && { academicYear: academicYear })
        }
      },
      {
        $group: {
          _id: "$categoryName",
          count: { $sum: 1 },
          totalPoints: { $sum: "$pointsAllocated" }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.json({
      department,
      academicYear: academicYear || null,
      stats: {
        totalStudents,
        certificates: formattedStats,
        topCategories
      }
    });
  } catch (error) {
    console.error("Error fetching department report:", error);
    res.status(500).json({ error: "Failed to fetch department report" });
  }
};

export const performanceVsStrength = async (req, res) => {
  try {
    // Get all departments with student counts and average points
    const departmentPerformance = await User.aggregate([
      {
        $match: {
          role: "student",
          status: "active"
        }
      },
      {
        $group: {
          _id: "$department",
          studentCount: { $sum: 1 },
          avgPoints: { $avg: "$totalPoints" },
          totalPoints: { $sum: "$totalPoints" }
        }
      },
      {
        $sort: { studentCount: -1 }
      }
    ]);
    
    // Format the data
    const performanceData = departmentPerformance.map(dept => ({
      department: dept._id,
      studentCount: dept.studentCount,
      avgPoints: Math.round(dept.avgPoints),
      totalPoints: dept.totalPoints,
      performanceIndex: dept.studentCount > 0 ? Math.round((dept.totalPoints / dept.studentCount) * 100) / 100 : 0
    }));
    
    res.json({ performanceData });
  } catch (error) {
    console.error("Error fetching performance vs strength data:", error);
    res.status(500).json({ error: "Failed to fetch performance vs strength data" });
  }
};

export const topWeakBranches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get departments sorted by average points (ascending for weak branches)
    const weakBranches = await User.aggregate([
      {
        $match: {
          role: "student",
          status: "active"
        }
      },
      {
        $group: {
          _id: "$department",
          studentCount: { $sum: 1 },
          avgPoints: { $avg: "$totalPoints" },
          totalPoints: { $sum: "$totalPoints" }
        }
      },
      {
        $sort: { avgPoints: 1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    // Get departments sorted by average points (descending for top branches)
    const topBranches = await User.aggregate([
      {
        $match: {
          role: "student",
          status: "active"
        }
      },
      {
        $group: {
          _id: "$department",
          studentCount: { $sum: 1 },
          avgPoints: { $avg: "$totalPoints" },
          totalPoints: { $sum: "$totalPoints" }
        }
      },
      {
        $sort: { avgPoints: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.json({
      topBranches: topBranches.map(branch => ({
        department: branch._id,
        studentCount: branch.studentCount,
        avgPoints: Math.round(branch.avgPoints),
        totalPoints: branch.totalPoints
      })),
      weakBranches: weakBranches.map(branch => ({
        department: branch._id,
        studentCount: branch.studentCount,
        avgPoints: Math.round(branch.avgPoints),
        totalPoints: branch.totalPoints
      }))
    });
  } catch (error) {
    console.error("Error fetching top/weak branches data:", error);
    res.status(500).json({ error: "Failed to fetch top/weak branches data" });
  }
};

export const studentLeaderboard = async (req, res) => {
  try {
    const { department, limit = 100 } = req.query;
    
    // Build filter
    const filter = { 
      role: "student", 
      status: "active" 
    };
    
    if (department) {
      filter.department = department;
    }
    
    // Get top students by points
    const topStudents = await User.find(filter)
      .select('name email enrollmentNumber department division totalPoints program currentYear')
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({ students: topStudents });
  } catch (error) {
    console.error("Error fetching student leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch student leaderboard" });
  }
};

export const exportDepartmentCSV = async (req, res) => {
  try {
    const { department, academicYear } = req.query;
    
    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }
    
    // Build filter for certificates
    const certFilter = { 
      'userId.department': department 
    };
    
    if (academicYear) {
      certFilter.academicYear = academicYear;
    }
    
    // Get students in department
    const students = await User.find({ 
      role: "student", 
      department,
      status: "active"
    }).lean();
    
    // Get certificates for department
    const certificates = await Certificate.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $match: {
          "user.department": department,
          ...(academicYear && { academicYear: academicYear })
        }
      }
    ]);
    
    // Prepare data for CSV
    const csvData = students.map(student => {
      // Count student's certificates
      const studentCerts = certificates.filter(cert => 
        cert.userId.toString() === student._id.toString()
      );
      
      const approvedCerts = studentCerts.filter(c => c.status === "approved");
      const pendingCerts = studentCerts.filter(c => c.status === "pending");
      const rejectedCerts = studentCerts.filter(c => c.status === "rejected");
      
      return {
        "Enrollment Number": student.enrollmentNumber || "",
        "Name": student.name,
        "Email": student.email,
        "Program": student.program,
        "Current Year": student.currentYear,
        "Total Points": student.totalPoints,
        "Approved Certificates": approvedCerts.length,
        "Pending Certificates": pendingCerts.length,
        "Rejected Certificates": rejectedCerts.length
      };
    });
    
    // Generate CSV
    const csv = Papa.unparse(csvData);
    
    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.attachment(`department_${department}_report.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("Error exporting department CSV:", error);
    res.status(500).json({ error: "Failed to export department CSV" });
  }
};

export const exportUniversityCSV = async (req, res) => {
  try {
    // Get all students
    const students = await User.find({ 
      role: "student"
    }).lean();
    
    // Get all certificates
    const certificates = await Certificate.find().populate('userId', 'department');
    
    // Prepare data for CSV
    const csvData = students.map(student => {
      // Count student's certificates
      const studentCerts = certificates.filter(cert => 
        cert.userId && cert.userId._id.toString() === student._id.toString()
      );
      
      const approvedCerts = studentCerts.filter(c => c.status === "approved");
      const pendingCerts = studentCerts.filter(c => c.status === "pending");
      const rejectedCerts = studentCerts.filter(c => c.status === "rejected");
      
      return {
        "Enrollment Number": student.enrollmentNumber || "",
        "Name": student.name,
        "Email": student.email,
        "Department": student.department,
        "Program": student.program,
        "Current Year": student.currentYear,
        "Status": student.status,
        "Total Points": student.totalPoints,
        "Approved Certificates": approvedCerts.length,
        "Pending Certificates": pendingCerts.length,
        "Rejected Certificates": rejectedCerts.length
      };
    });
    
    // Generate CSV
    const csv = Papa.unparse(csvData);
    
    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.attachment('university_report.csv');
    return res.send(csv);
  } catch (error) {
    console.error("Error exporting university CSV:", error);
    res.status(500).json({ error: "Failed to export university CSV" });
  }
};

export const generateExcellenceAwards = async (req, res) => {
  try {
    const { awardType } = req.query; // silver, gold, platinum
    
    // Define thresholds
    const thresholds = {
      silver: 50,
      gold: 75,
      platinum: 90
    };
    
    const threshold = thresholds[awardType] || thresholds.gold;
    
    // Get eligible students
    const eligibleStudents = await User.find({ 
      role: "student",
      status: "active",
      totalPoints: { $gte: threshold }
    })
    .select('name email enrollmentNumber department program totalPoints')
    .sort({ totalPoints: -1 })
    .lean();
    
    // Calculate awards and amounts
    const awardedStudents = eligibleStudents.map(student => {
      let award = "";
      let amount = 0;
      
      if (student.totalPoints >= 90) {
        award = "Platinum";
        amount = 10000;
      } else if (student.totalPoints >= 75) {
        award = "Gold";
        amount = 5000;
      } else if (student.totalPoints >= 50) {
        award = "Silver";
        amount = 2000;
      }
      
      return {
        ...student,
        award,
        amount
      };
    });
    
    res.json({ 
      awardedStudents,
      awardType,
      threshold,
      totalAwarded: awardedStudents.length
    });
  } catch (error) {
    console.error("Error generating excellence awards:", error);
    res.status(500).json({ error: "Failed to generate excellence awards" });
  }
};