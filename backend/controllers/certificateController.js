import cloudinary from "../config/cloudinary.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import ActivityCategory from "../models/ActivityCategory.js";
import AuditLog from "../models/AuditLog.js";
import AcademicYear from "../models/AcademicYear.js";
import UploadLock from "../models/UploadLock.js";
import fs from "fs";
import PDFDocument from 'pdfkit';
import { getYearFieldName, getRelevantYearFields } from "../utils/academicYearHelper.js";

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip || 'unknown';
};

// Check if upload is allowed
export const checkUploadStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    if (!user || user.role !== "student" || !user.department) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const lock = await UploadLock.findOne({ department: user.department._id });
    
    if (!lock || lock.isActive) {
      // Upload is active
      return res.json({ 
        allowed: true, 
        message: "Certificate upload is active" 
      });
    }

    // Upload is inactive - check deadline
    if (lock.deadlineAt && new Date() > new Date(lock.deadlineAt)) {
      return res.json({ 
        allowed: false, 
        message: "Certificate upload is currently disabled by HOD. Deadline overdue.",
        deadline: lock.deadlineAt
      });
    }

    // Deadline not reached yet
    return res.json({ 
      allowed: true, 
      message: "Certificate upload is active until deadline",
      deadline: lock.deadlineAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadCertificate = async (req, res) => {
  try {
    // Check upload status
    const user = await User.findById(req.user._id).populate('department');
    if (!user || user.role !== "student" || !user.department) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const lock = await UploadLock.findOne({ department: user.department._id });
    if (lock && !lock.isActive && lock.deadlineAt && new Date() > new Date(lock.deadlineAt)) {
      return res.status(403).json({ 
        error: "Certificate upload is currently disabled by HOD. Deadline overdue." 
      });
    }

    const { title, level, categoryId } = req.body;
    
    if (!title || !level || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "Certificate file is required" });
    }
    
    let cloudinaryPublicId = "";
    let cloudinaryUrl = "";
    
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const uploaded = await cloudinary.uploader.upload(req.file.path, { 
          folder: "sanjivani-map/certificates" 
        });
        cloudinaryPublicId = uploaded.public_id;
        cloudinaryUrl = uploaded.secure_url;
      } else {
        cloudinaryPublicId = `local_${Date.now()}_${req.file.filename}`;
        cloudinaryUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      cloudinaryPublicId = `local_${Date.now()}_${req.file.filename}`;
      cloudinaryUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    }
    
    // Clean up only if uploaded to Cloudinary; keep local files served from /uploads
    try {
      if (cloudinaryUrl && !cloudinaryPublicId.startsWith('local_')) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
    }
    
    const category = await ActivityCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Activity category not found" });
    }

    // Calculate points based on level and category levels
    let points = 0;
    if (category.levels && category.levels.length > 0) {
      // New structure: find the level in the category's levels array
      const selectedLevel = category.levels.find(l => l.name === level);
      if (selectedLevel) {
        points = selectedLevel.points || 0;
      }
    } else {
      // Old structure: fallback to the old points calculation
      if (level === "college") points = category.points || 0;
      else if (level === "state") points = (category.points || 0) * 1.5;
      else if (level === "national") points = (category.points || 0) * 2;
    }
    
    // Get current academic year for the certificate
    const currentAcademicYear = await AcademicYear.findOne({ isActive: true });
    
    const cert = await Certificate.create({
      userId: req.user._id,
      categoryId,
      categoryName: category.name,
      title,
      level,
      pointsAllocated: points,
      cloudinaryPublicId,
      cloudinaryUrl,
      status: "pending",
      academicYear: currentAcademicYear ? currentAcademicYear.current : null // Set the academic year when certificate is uploaded
    });
    
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Certificate uploaded: ${title}`,
      userId: req.user._id
    });
    
    res.json({ certificate: cert });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
    }
    res.status(500).json({ error: error.message });
  }
};

export const myCertificates = async (req, res) => {
  try {
    const { status = "", page = 1, limit = 20 } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    
    const total = await Certificate.countDocuments(filter);
    const certificates = await Certificate.find(filter)
      .populate('categoryId', 'name points levels') // Include levels field
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      certificates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HOD: Get pending certificates
export const pendingCertificates = async (req, res) => {
  try {
    const { department, year, status, sort, fromDate, toDate, page = 1, limit = 20 } = req.query;
    
    // Build student filter
    const studentFilter = { 
      role: "student", 
      status: { $ne: "deleted" }
    };
    
    // For HODs, restrict to their department; for Directors, allow department filter
    if (req.user.role === "hod") {
      studentFilter.department = req.user.department;
    } else if (req.user.role === "director" && department) {
      studentFilter.department = department;
    }
    
    // Apply year filter for student's current year
    if (year) {
      studentFilter.currentYear = year;
    }
    
    // Get students with filters
    const students = await User.find(studentFilter).select('_id');

    if (students.length === 0) {
      return res.json({ certificates: [], pagination: { currentPage: 1, totalPages: 0, totalCount: 0 } });
    }

    const studentIds = students.map(s => s._id);
    const filter = { userId: { $in: studentIds }, status: status || "pending" };
    
    // Apply date range filters
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    // Determine sort order
    let sortOrder = { createdAt: -1 }; // Default newest first
    if (sort === "oldest") {
      sortOrder = { createdAt: 1 };
    }

    const total = await Certificate.countDocuments(filter);
    const certificates = await Certificate.find(filter)
      .populate('userId', 'name email prn currentYear department')
      .populate('categoryId', 'name points levels') // Include levels field
      .sort(sortOrder)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      certificates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const cert = await Certificate.findById(certificateId)
      .populate('userId');
    
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Check if HOD's department matches student's department
    if (req.user.role === "hod") {
      const student = await User.findById(cert.userId._id);
      if (student.department.toString() !== req.user.department.toString()) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    
    cert.status = "approved";
    cert.approvedAt = new Date();
    cert.approvedBy = req.user._id;
    
    await cert.save();
    
    // Update user's total points
    const user = await User.findById(cert.userId._id || cert.userId);
    if (user) {
      user.totalPoints = (user.totalPoints || 0) + (cert.pointsAllocated || 0);
      
      // Update year-specific points based on when the certificate was uploaded
      // Use the academic year stored with the certificate, or fall back to current academic year
      const academicYearToUse = cert.academicYear || (await AcademicYear.findOne({ isActive: true }))?.current;
      
      if (academicYearToUse && user.joinYear && user.joinAcademicYear) {
        // Get the correct year field based on when the student joined and when the certificate was uploaded
        const yearField = getYearFieldName(user.joinYear, user.joinAcademicYear, academicYearToUse);
        if (yearField) {
          user[yearField] = (user[yearField] || 0) + (cert.pointsAllocated || 0);
        }
      }
      
      await user.save();
    }
    
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Certificate approved: ${cert.title}`,
      userId: req.user._id
    });
    
    res.json({ ok: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;
    
    const cert = await Certificate.findById(certificateId)
      .populate('userId');
    
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Check if HOD's department matches student's department
    if (req.user.role === "hod") {
      const student = await User.findById(cert.userId._id);
      if (student.department.toString() !== req.user.department.toString()) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    
    cert.status = "rejected";
    cert.rejectionReason = reason || "";
    cert.rejectedAt = new Date();
    cert.rejectedBy = req.user._id;
    
    // Delete file from Cloudinary
    if (cert.cloudinaryPublicId && !cert.cloudinaryPublicId.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(cert.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
      }
    }
    
    await cert.save();
    
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Certificate rejected: ${cert.title}`,
      userId: req.user._id
    });
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Director: Delete approved certificate
export const deleteApprovedCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    // Only Directors can delete approved certificates
    if (req.user.role !== "director") {
      return res.status(403).json({ error: "Forbidden - Only Directors can delete approved certificates" });
    }
    
    const cert = await Certificate.findById(certificateId)
      .populate('userId');
    
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    
    // Only allow deletion of approved certificates
    if (cert.status !== "approved") {
      return res.status(400).json({ error: "Only approved certificates can be deleted" });
    }
    
    // Store points for audit log
    const pointsToRemove = cert.pointsAllocated || 0;
    
    // Delete file from Cloudinary or local storage
    if (cert.cloudinaryPublicId) {
      if (!cert.cloudinaryPublicId.startsWith('local_')) {
        try {
          await cloudinary.uploader.destroy(cert.cloudinaryPublicId);
        } catch (cloudinaryError) {
          console.error("Error deleting from Cloudinary:", cloudinaryError);
        }
      } else {
        // Delete local file
        try {
          const filename = cert.cloudinaryPublicId.replace('local_', '');
          fs.unlinkSync(`./uploads/${filename}`);
        } catch (fileError) {
          console.error("Error deleting local file:", fileError);
        }
      }
    }
    
    // Remove certificate
    await Certificate.findByIdAndDelete(certificateId);
    
    // Update user's total points
    const user = await User.findById(cert.userId._id || cert.userId);
    if (user) {
      user.totalPoints = Math.max(0, (user.totalPoints || 0) - pointsToRemove);
      
      // Update year-specific points based on when the certificate was uploaded
      // Use the academic year stored with the certificate, or fall back to current academic year
      const academicYearToUse = cert.academicYear || (await AcademicYear.findOne({ isActive: true }))?.current;
      
      if (academicYearToUse && user.joinYear && user.joinAcademicYear) {
        // Get the correct year field based on when the student joined and when the certificate was uploaded
        const yearField = getYearFieldName(user.joinYear, user.joinAcademicYear, academicYearToUse);
        if (yearField) {
          user[yearField] = Math.max(0, (user[yearField] || 0) - pointsToRemove);
        }
      }
      
      await user.save();
    }
    
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Approved certificate deleted: ${cert.title} (${pointsToRemove} points removed from ${user?.name || 'Unknown User'})`,
      userId: req.user._id
    });
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Director: Get overall certificate statistics
export const getCertificateStats = async (req, res) => {
  try {
    // Get overall certificate stats
    const stats = await Certificate.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, approved: 0, pending: 0, rejected: 0 };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Director: Get approved certificates with filtering
export const approvedCertificates = async (req, res) => {
  try {
    const { department, category, year, sort, fromDate, toDate, search, page = 1, limit = 20 } = req.query;
    
    // Build student filter
    const studentFilter = { 
      role: "student", 
      status: { $ne: "deleted" }
    };
    
    // Allow department filter for Directors
    if (req.user.role === "director" && department) {
      studentFilter.department = department;
    }
    
    // Apply year filter for student's current year
    if (year) {
      studentFilter.currentYear = year;
    }
    
    // Apply search filter
    if (search) {
      studentFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { prn: { $regex: search, $options: "i" } }
      ];
    }
    
    // Get students with filters
    const students = await User.find(studentFilter).select('_id');

    if (students.length === 0) {
      return res.json({ certificates: [], pagination: { currentPage: 1, totalPages: 0, totalCount: 0 } });
    }

    const studentIds = students.map(s => s._id);
    const filter = { userId: { $in: studentIds }, status: "approved" };
    
    // Apply category filter
    if (category) {
      filter.categoryName = category;
    }
    
    // Apply date range filters
    if (fromDate || toDate) {
      filter.approvedAt = {};
      if (fromDate) filter.approvedAt.$gte = new Date(fromDate);
      if (toDate) filter.approvedAt.$lte = new Date(toDate);
    }

    // Determine sort order
    let sortOrder = { approvedAt: -1 }; // Default newest first
    if (sort === "oldest") {
      sortOrder = { approvedAt: 1 };
    }

    const total = await Certificate.countDocuments(filter);
    const certificates = await Certificate.find(filter)
      .populate('userId', 'name email prn currentYear department')
      .populate('categoryId', 'name points levels') // Include levels field
      .populate('approvedBy', 'name')
      .sort(sortOrder)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      certificates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user progress data
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Get user with populated department
    const user = await User.findById(userId).populate('department', 'name years yearRequirements');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Security check: Students can only view their own progress
    // HODs and Directors can view progress of students in their department
    // Super Admins can view all progress
    if (req.user.role === "student" && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: You can only view your own progress" });
    }
    
    if (req.user.role === "hod" && user.department && req.user.department) {
      if (user.department._id.toString() !== req.user.department.toString()) {
        return res.status(403).json({ error: "Forbidden: You can only view progress of students in your department" });
      }
    }
    
    // Get current academic year
    const currentAcademicYearDoc = await AcademicYear.findOne({ isActive: true });
    const currentAcademicYear = currentAcademicYearDoc ? currentAcademicYearDoc.current : null;
    
    // Calculate overall required points based on all years the student has been enrolled
    let totalRequiredPoints = 0;
    if (user.joinYear && user.joinAcademicYear && user.currentYear && user.department?.yearRequirements) {
      // Get all relevant year fields using the simpler approach that shows all years from join to current
      const yearOrderMap = {
        "First": 1,
        "Second": 2,
        "Third": 3,
        "Fourth": 4,
        "Fifth": 5,
        "Sixth": 6
      };
      
      // Get the order of the join year and current year
      const joinYearOrder = yearOrderMap[user.joinYear];
      const currentYearOrder = yearOrderMap[user.currentYear];
      
      // Calculate total required points for all years from join to current
      if (joinYearOrder && currentYearOrder) {
        for (let order = joinYearOrder; order <= currentYearOrder; order++) {
          // Map order to year name
          const yearNameMap = {
            1: "First",
            2: "Second",
            3: "Third",
            4: "Fourth",
            5: "Fifth",
            6: "Sixth"
          };
          
          const yearName = yearNameMap[order];
          if (yearName) {
            // Get points requirement for this year from department settings
            const yearRequirement = user.department.yearRequirements.get(yearName) || { points: 100 };
            totalRequiredPoints += yearRequirement.points || 100;
          }
        }
      }
    }
    
    // If we couldn't calculate based on department settings, use default
    if (totalRequiredPoints === 0) {
      totalRequiredPoints = 200; // Default required points
    }
    
    // Calculate overall percentage
    const percentage = totalRequiredPoints > 0 ? Math.round((user.totalPoints / totalRequiredPoints) * 100) : 0;
    
    // Year-wise progress data - Show all years from join year to current year
    const yearWise = [];
    
    // Determine which years to show based on join year and current year
    // Only show years that are relevant to the student's academic journey
    if (user.joinYear && user.joinAcademicYear && user.currentYear && currentAcademicYear) {
      // Get all relevant year fields using the simpler approach that shows all years from join to current
      const yearOrderMap = {
        "First": 1,
        "Second": 2,
        "Third": 3,
        "Fourth": 4,
        "Fifth": 5,
        "Sixth": 6
      };
      
      const yearFieldMap = {
        1: { fieldName: "year1Points", displayName: "First" },
        2: { fieldName: "year2Points", displayName: "Second" },
        3: { fieldName: "year3Points", displayName: "Third" },
        4: { fieldName: "year4Points", displayName: "Fourth" },
        5: { fieldName: "year5Points", displayName: "Fifth" },
        6: { fieldName: "year6Points", displayName: "Sixth" }
      };
      
      // Get the order of the join year and current year
      const joinYearOrder = yearOrderMap[user.joinYear];
      const currentYearOrder = yearOrderMap[user.currentYear];
      
      // Generate array of relevant years from join year to current year
      if (joinYearOrder && currentYearOrder) {
        for (let order = joinYearOrder; order <= currentYearOrder; order++) {
          if (yearFieldMap[order]) {
            const yearInfo = yearFieldMap[order];
            const points = user[yearInfo.fieldName] || 0;
            
            // Get points requirement for this year from department settings
            const yearRequirement = user.department?.yearRequirements?.get(yearInfo.displayName) || { points: 100 };
            const requiredPoints = yearRequirement.points || 100;
            
            // Calculate percentage based on required points
            const yearPercentage = requiredPoints > 0 ? Math.round((points / requiredPoints) * 100) : 0;
            
            // Determine status based on points
            let status = "Pending";
            if (points >= requiredPoints) {
              status = "Completed";
            } else if (points > 0) {
              status = "In Progress";
            }
            
            yearWise.push({
              year: yearInfo.displayName,
              points,
              requiredPoints,
              percentage: yearPercentage,
              status
            });
          }
        }
      }
    }
    
    // Current year data (same as the year we're showing)
    let currentYearPoints = 0;
    let currentYearRequired = 100;
    let currentYearPercentage = 0;
    
    if (user.currentYear) {
      // Map current year to its field name
      const yearFieldMap = {
        "First": "year1Points",
        "Second": "year2Points",
        "Third": "year3Points",
        "Fourth": "year4Points",
        "Fifth": "year5Points",
        "Sixth": "year6Points"
      };
      
      const currentYearField = yearFieldMap[user.currentYear];
      if (currentYearField) {
        currentYearPoints = user[currentYearField] || 0;
        
        // Get requirements for current year
        const currentYearReq = user.department?.yearRequirements?.get(user.currentYear) || { points: 100 };
        currentYearRequired = currentYearReq.points || 100;
        currentYearPercentage = currentYearRequired > 0 ? Math.round((currentYearPoints / currentYearRequired) * 100) : 0;
      }
    }
    
    res.json({
      progress: {
        totalPoints: user.totalPoints || 0,
        requiredPoints: totalRequiredPoints, // Use calculated required points
        percentage,
        yearWise,
        currentYearPoints,
        currentYearRequired,
        currentYearPercentage
      }
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ error: error.message });
  }
};



export const generateSkillCardPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data
    const user = await User.findById(userId)
      .populate('department', 'name years yearRequirements');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get all approved certificates for this user
    const certificates = await Certificate.find({
      userId: userId,
      status: "approved"
    }).sort({ academicYear: 1, createdAt: 1 });
    
    // Group certificates by department year based on academic year progression
    // We'll map academic years to department years based on when the student joined
    const certificatesByYear = {};
    
    // Create a mapping from academic year to department year
    // This is a simplified approach - in reality, this would depend on when the student joined
    const academicToDeptYearMap = {};
    const baseYears = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
    
    // For simplicity, we'll assume certificates are grouped by their academicYear field
    // and map them to department years sequentially
    const uniqueAcademicYears = [...new Set(certificates.map(cert => cert.academicYear).filter(Boolean))];
    uniqueAcademicYears.sort();
    
    uniqueAcademicYears.forEach((academicYear, index) => {
      const deptYear = baseYears[index] || `Year ${index + 1}`;
      academicToDeptYearMap[academicYear] = `${deptYear} Year`;
    });
    
    certificates.forEach(cert => {
      // Use mapped department year or fallback to academic year
      const academicYear = cert.academicYear || 'Unknown Academic Year';
      const deptYear = academicToDeptYearMap[academicYear] || academicYear;
      
      if (!certificatesByYear[deptYear]) {
        certificatesByYear[deptYear] = [];
      }
      certificatesByYear[deptYear].push(cert);
    });
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Create a buffer to store PDF data
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=skill-card-${user.prn || user.enrollmentNumber || 'transcript'}.pdf`);
      res.send(pdfBuffer);
    });
    
    // Add university header without logo to avoid file path issues
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('SANJIVANI UNIVERSITY', 50, 45, { align: 'center' })
       .fontSize(16)
       .text('Kopargaon, Dist: Ahilyanagar, Maharashtra-423601', 50, 75, { align: 'center' })
       .moveDown();
    
    // Draw a line separator
    doc.moveTo(50, 100)
       .lineTo(550, 100)
       .stroke();
    
    // Title
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('STUDENT SKILL CARD', { align: 'center' })
       .moveDown();
    
    // Student information (only name and PRN)
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Name: ${user.name}`)
       .text(`PRN: ${user.prn || user.enrollmentNumber || 'N/A'}`)
       .text(`Department: ${user.department?.name || 'N/A'}`)
       .moveDown();
    
    // Overall statistics
    const totalPoints = user.totalPoints || 0;
    const requiredPoints = user.department?.yearRequirements ? 
      Array.from(user.department.yearRequirements.values()).reduce((sum, req) => sum + (req.points || 0), 0) : 200;
    const percentage = requiredPoints > 0 ? Math.round((totalPoints / requiredPoints) * 100) : 0;
    
    doc.font('Helvetica-Bold')
       .text('OVERALL SUMMARY', { underline: true })
       .font('Helvetica')
       .text(`Total Points Earned: ${totalPoints}`)
       .text(`Total Points Required: ${requiredPoints}`)
       .text(`Completion Percentage: ${percentage}%`)
       .moveDown();
    
    // Department year breakdown
    doc.font('Helvetica-Bold')
       .text('DEPARTMENT YEAR BREAKDOWN', { underline: true })
       .moveDown();
    
    // Get all department years
    const deptYears = Object.keys(certificatesByYear);
    
    if (deptYears.length === 0) {
      doc.font('Helvetica')
         .text('No approved certificates found.')
         .moveDown();
    } else {
      deptYears.forEach(deptYear => {
        const yearCertificates = certificatesByYear[deptYear];
        const yearPoints = yearCertificates.reduce((sum, cert) => sum + (cert.pointsAllocated || 0), 0);
        
        // Consistent left alignment for department year headings
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .text(`${deptYear}`, 50, doc.y)
           .moveDown();
        
        // Table headers (without date column)
        const tableTop = doc.y;
        const rowHeight = 20;
        const col1Width = 200;
        const col2Width = 120;
        const col3Width = 130;
        
        // Draw table headers
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .text('Activity', 50, tableTop)
           .text('Level', 50 + col1Width, tableTop)
           .text('Points', 50 + col1Width + col2Width, tableTop);
        
        // Draw header line
        doc.moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();
        
        // Draw certificates for this department year
        let yPos = tableTop + 20;
        yearCertificates.forEach(cert => {
          doc.font('Helvetica')
             .fontSize(10)
             .text(cert.title, 50, yPos, { width: col1Width, ellipsis: true })
             .text(cert.level, 50 + col1Width, yPos, { width: col2Width })
             .text(cert.pointsAllocated.toString(), 50 + col1Width + col2Width, yPos, { width: col3Width });
          
          yPos += rowHeight;
          
          // Add a new page if needed
          if (yPos > 750) {
            doc.addPage();
            yPos = 50;
          }
        });
        
        // Add spacing after each year section
        doc.moveDown();
      });
    }
    
    // Final summary
    doc.addPage()
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('FINAL SUMMARY', { align: 'center', underline: true })
       .moveDown(2)
       .fontSize(12)
       .font('Helvetica')
       .text(`Total Points Earned: ${totalPoints}`)
       .text(`Total Points Required: ${requiredPoints}`)
       .text(`Overall Completion: ${percentage}%`)
       .moveDown(2)
       .text('This Skill Card is officially certified by Sanjivani University.', { align: 'center' })
       .text('It represents the verified activities and achievements of the student.', { align: 'center' });
    
    // Footer
    doc.fontSize(10)
       .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 800)
       .text('Sanjivani University - Official Document', 400, 800);
    
    doc.end();
  } catch (error) {
    console.error("Error generating skill card PDF:", error);
    res.status(500).json({ error: error.message });
  }
};
