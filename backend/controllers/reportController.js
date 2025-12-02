import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import ActivityCategory from "../models/ActivityCategory.js";
import AcademicYear from "../models/AcademicYear.js";
import mongoose from "mongoose";

// HOD: Department Analytics
export const departmentAnalytics = async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({ error: "HOD must be assigned to a department" });
    }

    // Get query parameters for filtering
    const { category, limit = 'none', fromDate, toDate, departmentYear } = req.query;
    
    // Build filter for students
    const studentFilter = {
      role: "student",
      department: req.user.department,
      status: { $ne: "deleted" }
    };
    
    // Apply department year filter if provided
    if (departmentYear) {
      studentFilter.currentYear = departmentYear;
    }
    
    // Build filter for certificates
    const certificateFilter = {
      "user.department": req.user.department,
      status: "approved"
    };
    
    // Apply category filter if provided
    if (category) {
      certificateFilter.categoryName = category;
    }
    
    // Apply date range filters if provided
    if (fromDate || toDate) {
      certificateFilter.createdAt = {};
      if (fromDate) certificateFilter.createdAt.$gte = new Date(fromDate);
      if (toDate) certificateFilter.createdAt.$lte = new Date(toDate);
    }

    // Top students with filters
    let topStudentsQuery = User.find(studentFilter)
      .select('name prn email totalPoints currentYear academicYear mobile')
      .sort({ totalPoints: -1 });
    
    // Apply limit if not 'none'
    if (limit !== 'none') {
      topStudentsQuery = topStudentsQuery.limit(parseInt(limit));
    }
    
    const topStudents = await topStudentsQuery.lean();

    // Weak students (low points) with filters
    let weakStudentsQuery = User.find({
      ...studentFilter,
      totalPoints: { $lt: 50 }
    })
      .select('name prn email totalPoints currentYear academicYear mobile')
      .sort({ totalPoints: 1 });
    
    // Apply limit if not 'none'
    if (limit !== 'none') {
      weakStudentsQuery = weakStudentsQuery.limit(parseInt(limit));
    }
    
    const weakStudents = await weakStudentsQuery.lean();

    // Category-wise chart data with filters
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
        $match: certificateFilter
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

    // Department stats with filters
    const totalStudents = await User.countDocuments(studentFilter);

    const avgPoints = await User.aggregate([
      {
        $match: studentFilter
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

// Super Admin: Get latest approved certificates
export const getLatestApprovedCertificates = async (req, res) => {
  try {
    // Get the latest 5 approved certificates with populated user and category data
    const certificates = await Certificate.find({ status: "approved" })
      .populate('userId', 'name prn department')
      .populate('categoryId', 'name')
      .populate('approvedBy', 'name')
      .sort({ approvedAt: -1 })
      .limit(5)
      .lean();
    
    // Format the response
    const formattedCertificates = certificates.map(cert => ({
      id: cert._id,
      title: cert.title,
      studentName: cert.userId?.name || 'Unknown Student',
      studentPRN: cert.userId?.prn || 'N/A',
      department: cert.userId?.department || 'Unknown Department',
      categoryName: cert.categoryId?.name || 'Unknown Category',
      points: cert.pointsAllocated || 0,
      approvedBy: cert.approvedBy?.name || 'Unknown Approver',
      approvedAt: cert.approvedAt,
      cloudinaryUrl: cert.cloudinaryUrl
    }));
    
    res.json({ certificates: formattedCertificates });
  } catch (error) {
    console.error("Error fetching latest approved certificates:", error);
    res.status(500).json({ error: error.message });
  }
};

// HOD: Export Department Analytics to Excel
export const exportDepartmentAnalytics = async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({ error: "HOD must be assigned to a department" });
    }

    // Get query parameters for filtering
    const { category, fromDate, toDate, departmentYear } = req.query;
    
    // Build filter for students
    const studentFilter = {
      role: "student",
      department: req.user.department,
      status: { $ne: "deleted" }
    };
    
    // Apply department year filter if provided
    if (departmentYear) {
      studentFilter.currentYear = departmentYear;
    }
    
    // Build filter for certificates
    const certificateFilter = {
      "user.department": req.user.department,
      status: "approved"
    };
    
    // Apply category filter if provided
    if (category) {
      certificateFilter.categoryName = category;
    }
    
    // Apply date range filters if provided
    if (fromDate || toDate) {
      certificateFilter.createdAt = {};
      if (fromDate) certificateFilter.createdAt.$gte = new Date(fromDate);
      if (toDate) certificateFilter.createdAt.$lte = new Date(toDate);
    }

    // Get all students with certificates in the filtered criteria
    const studentsWithCertificates = await Certificate.aggregate([
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
        $match: certificateFilter
      },
      {
        $lookup: {
          from: "activitycategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$userId",
          student: { $first: "$user" },
          certificates: {
            $push: {
              title: "$title",
              categoryName: "$categoryName",
              points: "$pointsAllocated",
              createdAt: "$createdAt"
            }
          },
          totalPoints: { $sum: "$pointsAllocated" }
        }
      },
      {
        $project: {
          _id: 1,
          student: 1,
          certificates: 1,
          totalPoints: 1
        }
      }
    ]);

    // Format data for CSV export
    const csvRows = [];
    csvRows.push(['Student Name', 'PRN', 'Mobile Number', 'Activity', 'Points', 'Department', 'Year']);
    
    // Get department name
    const departmentName = req.user.department.name || "Unknown Department";
    
    for (const record of studentsWithCertificates) {
      const student = record.student;
      for (const cert of record.certificates) {
        csvRows.push([
          student.name,
          student.prn || '',
          student.mobile || '',
          cert.title,
          cert.points,
          departmentName,
          student.currentYear || ''
        ]);
      }
    }

    // Convert to CSV string
    const csvString = csvRows.map(row => row.join(',')).join('\n');
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('department_analytics_export.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HOD: Department Report
export const departmentReport = async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({ error: "HOD must be assigned to a department" });
    }

    // Get query parameters for filtering
    const { year } = req.query;
    
    // Build filter for students
    const studentFilter = {
      role: "student",
      department: req.user.department,
      status: { $ne: "deleted" }
    };
    
    // Apply department year filter if provided
    if (year) {
      studentFilter.currentYear = year;
    }

    // Get students with certificates count
    const studentsWithCertificates = await User.aggregate([
      { $match: studentFilter },
      {
        $lookup: {
          from: "certificates",
          localField: "_id",
          foreignField: "userId",
          as: "certificates"
        }
      },
      {
        $project: {
          name: 1,
          prn: 1,
          email: 1,
          division: 1,
          program: 1,
          currentYear: 1,
          totalPoints: 1,
          certificateCount: { $size: "$certificates" }
        }
      },
      { $sort: { name: 1 } }
    ]);

    // Get certificate statistics
    const certificateStats = await Certificate.aggregate([
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
          "user.currentYear": year || { $exists: true },
          status: { $in: ["approved", "pending", "rejected"] }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format certificate stats
    const formattedStats = {
      approved: 0,
      pending: 0,
      rejected: 0
    };
    
    certificateStats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    // Calculate average points per student
    const avgPointsResult = await User.aggregate([
      { $match: studentFilter },
      {
        $group: {
          _id: null,
          avg: { $avg: "$totalPoints" }
        }
      }
    ]);
    
    const avgPoints = avgPointsResult[0]?.avg ? Math.round(avgPointsResult[0].avg) : 0;

    res.json({
      students: studentsWithCertificates,
      stats: {
        totalStudents: studentsWithCertificates.length,
        certificates: formattedStats,
        avgPoints: avgPoints
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HOD: Export Department Report to CSV
export const exportDepartmentReport = async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({ error: "HOD must be assigned to a department" });
    }

    // Get query parameters for filtering
    const { year } = req.query;
    
    // Build filter for students
    const studentFilter = {
      role: "student",
      department: req.user.department,
      status: { $ne: "deleted" }
    };
    
    // Apply department year filter if provided
    if (year) {
      studentFilter.currentYear = year;
    }

    // Get students with certificates count
    const students = await User.find(studentFilter)
      .select('name prn email division program currentYear totalPoints')
      .sort({ name: 1 })
      .lean();

    // Format data for CSV export
    const csvRows = [];
    csvRows.push(['Name', 'PRN', 'Email', 'Division', 'Program', 'Year', 'Total Points']);
    
    for (const student of students) {
      csvRows.push([
        student.name,
        student.prn || '',
        student.email || '',
        student.division || '',
        student.program || '',
        student.currentYear || '',
        student.totalPoints || 0
      ]);
    }

    // Convert to CSV string
    const csvString = csvRows.map(row => row.join(',')).join('\n');
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('department_report.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Super Admin: Detailed Analytics
export const detailedAnalytics = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { department, departmentYear, category, search, highestPoints, lowestPoints } = req.query;
    
    // Build filter for students
    const studentFilter = {
      role: "student",
      status: { $ne: "deleted" }
    };
    
    // Apply department filter if provided
    if (department) {
      studentFilter.department = department;
    }
    
    // Apply department year filter if provided
    if (departmentYear) {
      studentFilter.currentYear = departmentYear;
    }
    
    // Apply points filters
    if (highestPoints) {
      studentFilter.totalPoints = { $gte: parseInt(highestPoints) };
    }
    
    if (lowestPoints) {
      studentFilter.totalPoints = {
        ...studentFilter.totalPoints,
        $lte: parseInt(lowestPoints)
      };
    }
    
    // Apply search filter if provided
    if (search) {
      studentFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { prn: { $regex: search, $options: "i" } }
      ];
    }
    
    // Build filter for certificates
    const certificateFilter = {
      status: "approved"
    };
    
    // Apply category filter if provided
    if (category) {
      certificateFilter.categoryName = category;
    }
    
    // Apply student filter to certificate filter
    if (department || departmentYear || search || highestPoints || lowestPoints) {
      const students = await User.find(studentFilter).select('_id');
      certificateFilter["user._id"] = { $in: students.map(s => s._id) };
    }
    
    // Top students with filters
    let topStudentsQuery = User.find(studentFilter)
      .populate('department', 'name')
      .select('name prn email totalPoints currentYear department mobile')
      .sort({ totalPoints: -1 });
    
    const topStudents = await topStudentsQuery.lean();
    
    // Weak students (low points) with filters
    let weakStudentsQuery = User.find({
      ...studentFilter,
      totalPoints: { $lt: 50 }
    })
      .populate('department', 'name')
      .select('name prn email totalPoints currentYear department mobile')
      .sort({ totalPoints: 1 });
    
    const weakStudents = await weakStudentsQuery.lean();
    
    // Category-wise chart data with filters
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
        $match: certificateFilter
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
    
    // Department stats with filters
    const totalStudents = await User.countDocuments(studentFilter);
    
    const avgPoints = await User.aggregate([
      {
        $match: studentFilter
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

// Super Admin: Export Detailed Analytics to CSV
export const exportDetailedAnalytics = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { department, departmentYear, category, search, highestPoints, lowestPoints } = req.query;
    
    // Build filter for students
    const studentFilter = {
      role: "student",
      status: { $ne: "deleted" }
    };
    
    // Apply department filter if provided
    if (department) {
      studentFilter.department = department;
    }
    
    // Apply department year filter if provided
    if (departmentYear) {
      studentFilter.currentYear = departmentYear;
    }
    
    // Apply points filters
    if (highestPoints) {
      studentFilter.totalPoints = { $gte: parseInt(highestPoints) };
    }
    
    if (lowestPoints) {
      studentFilter.totalPoints = {
        ...studentFilter.totalPoints,
        $lte: parseInt(lowestPoints)
      };
    }
    
    // Apply search filter if provided
    if (search) {
      studentFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { prn: { $regex: search, $options: "i" } }
      ];
    }
    
    // Build filter for certificates
    const certificateFilter = {
      status: "approved"
    };
    
    // Apply category filter if provided
    if (category) {
      certificateFilter.categoryName = category;
    }
    
    // Apply student filter to certificate filter
    if (department || departmentYear || search || highestPoints || lowestPoints) {
      const students = await User.find(studentFilter).select('_id');
      certificateFilter["user._id"] = { $in: students.map(s => s._id) };
    }
    
    // Get all students with certificates in the filtered criteria
    const studentsWithCertificates = await Certificate.aggregate([
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
        $match: certificateFilter
      },
      {
        $lookup: {
          from: "activitycategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$userId",
          student: { $first: "$user" },
          certificates: {
            $push: {
              title: "$title",
              categoryName: "$categoryName",
              points: "$pointsAllocated",
              createdAt: "$createdAt"
            }
          },
          totalPoints: { $sum: "$pointsAllocated" }
        }
      },
      {
        $project: {
          _id: 1,
          student: 1,
          certificates: 1,
          totalPoints: 1
        }
      }
    ]);
    
    // Format data for CSV export
    const csvRows = [];
    csvRows.push(['Student Name', 'PRN', 'Mobile Number', 'Activity', 'Points', 'Department', 'Year']);
    
    for (const record of studentsWithCertificates) {
      const student = record.student;
      const departmentName = student.department?.name || "Unknown Department";
      
      for (const cert of record.certificates) {
        csvRows.push([
          student.name,
          student.prn || '',
          student.mobile || '',
          cert.title,
          cert.points,
          departmentName,
          student.currentYear || ''
        ]);
      }
    }
    
    // Convert to CSV string
    const csvString = csvRows.map(row => row.join(',')).join('\n');
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('detailed_analytics_export.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};