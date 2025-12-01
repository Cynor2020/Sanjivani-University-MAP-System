import cloudinary from "../config/cloudinary.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import ActivityCategory from "../models/ActivityCategory.js";
import AuditLog from "../models/AuditLog.js";
import AcademicYear from "../models/AcademicYear.js";
import UploadLock from "../models/UploadLock.js";
import fs from "fs";

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

    const { title, level, categoryId, academicYear } = req.body;
    
    if (!title || !level || !categoryId || !academicYear) {
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
        cloudinaryUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      cloudinaryPublicId = `local_${Date.now()}_${req.file.filename}`;
      cloudinaryUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }
    
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
    }
    
    const category = await ActivityCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Activity category not found" });
    }

    // Calculate points based on level
    let points = 0;
    if (level === "college") points = category.points || 0;
    else if (level === "state") points = (category.points || 0) * 1.5;
    else if (level === "national") points = (category.points || 0) * 2;
    
    const cert = await Certificate.create({
      userId: req.user._id,
      academicYear,
      categoryId,
      categoryName: category.name,
      title,
      level,
      pointsAllocated: points,
      cloudinaryPublicId,
      cloudinaryUrl,
      status: "pending"
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
    const { status = "", academicYear = "", page = 1, limit = 20 } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;
    
    const total = await Certificate.countDocuments(filter);
    const certificates = await Certificate.find(filter)
      .populate('categoryId', 'name points')
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
    const { year, academicYear, status, page = 1, limit = 20 } = req.query;
    
    // Get students in HOD's department
    const students = await User.find({ 
      role: "student", 
      department: req.user.department,
      status: { $ne: "deleted" }
    }).select('_id');

    if (students.length === 0) {
      return res.json({ certificates: [], pagination: { currentPage: 1, totalPages: 0, totalCount: 0 } });
    }

    const studentIds = students.map(s => s._id);
    const filter = { userId: { $in: studentIds }, status: status || "pending" };
    
    if (academicYear) filter.academicYear = academicYear;

    const total = await Certificate.countDocuments(filter);
    const certificates = await Certificate.find(filter)
      .populate('userId', 'name email prn currentYear')
      .populate('categoryId', 'name points')
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
      
      // Update year-specific points
      const currentYear = await AcademicYear.findOne({ isActive: true });
      if (currentYear && user.currentYear) {
        const yearMap = { "First": "year1Points", "Second": "year2Points", "Third": "year3Points", 
                         "Fourth": "year4Points", "Fifth": "year5Points", "Sixth": "year6Points" };
        const yearField = yearMap[user.currentYear];
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
