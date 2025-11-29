import cloudinary from "../config/cloudinary.js";
import Certificate from "../models/Certificate.js";
import User from "../models/User.js";
import ActivityCategory from "../models/ActivityCategory.js";
import AuditLog from "../models/AuditLog.js";
import AcademicYear from "../models/AcademicYear.js";
import fs from "fs";

export const uploadCertificate = async (req, res) => {
  try {
    const { 
      title, 
      level, 
      categoryId, 
      academicYear, 
      eventName,
      eventDate,
      organizer,
      certificateNumber
    } = req.body;
    
    // Validate required fields
    if (!title || !level || !categoryId || !academicYear) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Certificate file is required" });
    }
    
    let cloudinaryPublicId = "";
    let cloudinaryUrl = "";
    
    // Try to upload to Cloudinary, fallback to local storage if not configured
    try {
      // Check if Cloudinary is configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        const uploaded = await cloudinary.uploader.upload(req.file.path, { 
          folder: "sanjivani-map/certificates" 
        });
        cloudinaryPublicId = uploaded.public_id;
        cloudinaryUrl = uploaded.secure_url;
      } else {
        // Fallback to local storage
        cloudinaryPublicId = `local_${Date.now()}_${req.file.filename}`;
        cloudinaryUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      // Fallback to local storage
      cloudinaryPublicId = `local_${Date.now()}_${req.file.filename}`;
      cloudinaryUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }
    
    // Clean up the temporary file
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
    }
    
    // Get category name for reference
    const category = await ActivityCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Activity category not found" });
    }
    
    // Create certificate record
    const cert = await Certificate.create({
      userId: req.user._id,
      academicYear,
      categoryId,
      categoryName: category.name,
      title,
      level,
      eventName,
      eventDate: eventDate ? new Date(eventDate) : null,
      organizer,
      certificateNumber,
      cloudinaryPublicId,
      cloudinaryUrl,
      uploadedBy: req.user.role
    });
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "upload_certificate", 
      details: { certificateId: cert._id, title: cert.title },
      resourceId: cert._id,
      resourceType: "Certificate"
    });
    
    res.json({ certificate: cert });
  } catch (error) {
    console.error("Error uploading certificate:", error);
    // Clean up the temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
    }
    
    // Provide more specific error messages
    if (error.message.includes("Cloudinary")) {
      return res.status(500).json({ error: "Failed to upload file to storage. Please try again." });
    }
    if (error.message.includes("file")) {
      return res.status(400).json({ error: "Invalid file format or size. Please upload a PDF, JPEG, or PNG file under 5MB." });
    }
    res.status(500).json({ error: "Failed to upload certificate: " + error.message });
  }
};

export const myCertificates = async (req, res) => {
  try {
    const { status = "", academicYear = "", page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    
    // Get total count
    const totalCount = await Certificate.countDocuments(filter);
    
    // Get certificates with pagination
    const certificates = await Certificate.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      certificates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
};

export const pendingCertificatesHOD = async (req, res) => {
  try {
    const { department = "", academicYear = "", page = 1, limit = 20 } = req.query;
    
    // Build filter for pending certificates
    const filter = { status: "pending" };
    
    // Filter by department
    if (department && req.user.department) {
      // Get students in this department
      const students = await User.find({ 
        department: req.user.department, 
        role: "student" 
      }).select('_id');
      const studentIds = students.map(s => s._id);
      filter.userId = { $in: studentIds };
    }
    
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    
    // Get total count
    const totalCount = await Certificate.countDocuments(filter);
    
    // Get pending certificates with pagination
    const certificates = await Certificate.find(filter)
      .populate('userId', 'name email enrollmentNumber division program')
      .populate('categoryId', 'name pointsByLevel')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      certificates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching pending certificates:", error);
    res.status(500).json({ error: "Failed to fetch pending certificates" });
  }
};

export const approveCertificate = async (req, res) => {
  try {
    const { certificateId, points } = req.body;
    
    // Find the certificate
    const cert = await Certificate.findById(certificateId);
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    
    // Update certificate status
    cert.status = "approved";
    cert.pointsAllocated = points;
    cert.approvedAt = new Date();
    cert.approvedBy = req.user._id;
    
    // Save the certificate
    await cert.save();
    
    // Update user's total points
    const user = await User.findById(cert.userId);
    if (user) {
      user.totalPoints = (user.totalPoints || 0) + points;
      
      // Update year-specific points
      const currentYear = await AcademicYear.findOne({ isActive: true });
      if (currentYear) {
        const yearField = `year${user.currentYear}Points`;
        user[yearField] = (user[yearField] || 0) + points;
      }
      
      await user.save();
    }
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "approve_certificate", 
      details: { certificateId, points },
      resourceId: cert._id,
      resourceType: "Certificate"
    });
    
    res.json({ ok: true, message: "Certificate approved successfully" });
  } catch (error) {
    console.error("Error approving certificate:", error);
    res.status(500).json({ error: "Failed to approve certificate" });
  }
};

export const rejectCertificate = async (req, res) => {
  try {
    const { certificateId, reason } = req.body;
    
    // Find the certificate
    const cert = await Certificate.findById(certificateId);
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    
    // Update certificate status
    cert.status = "rejected";
    cert.rejectionReason = reason;
    cert.rejectedAt = new Date();
    cert.rejectedBy = req.user._id;
    
    // Delete the file from Cloudinary/local storage
    if (cert.cloudinaryPublicId) {
      // If it's a Cloudinary file, delete it
      if (!cert.cloudinaryPublicId.startsWith('local_')) {
        try {
          await cloudinary.uploader.destroy(cert.cloudinaryPublicId);
        } catch (cloudinaryError) {
          console.error("Error deleting file from Cloudinary:", cloudinaryError);
        }
      } else {
        // If it's a local file, delete it from the uploads directory
        try {
          const fileName = cert.cloudinaryPublicId.replace('local_', '');
          const filePath = `./uploads/${fileName}`;
          fs.unlinkSync(filePath);
        } catch (fileError) {
          console.error("Error deleting local file:", fileError);
        }
      }
    }
    
    // Save the certificate
    await cert.save();
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "reject_certificate", 
      details: { certificateId, reason },
      resourceId: cert._id,
      resourceType: "Certificate"
    });
    
    res.json({ ok: true, message: "Certificate rejected successfully" });
  } catch (error) {
    console.error("Error rejecting certificate:", error);
    res.status(500).json({ error: "Failed to reject certificate" });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const certificate = await Certificate.findById(id)
      .populate('userId', 'name email enrollmentNumber division program')
      .populate('categoryId', 'name description pointsByLevel')
      .lean();
    
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    
    res.json({ certificate });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ error: "Failed to fetch certificate" });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the certificate
    const cert = await Certificate.findById(id);
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    
    // Check if user owns this certificate or has appropriate permissions
    if (req.user.role !== "super_admin" && 
        req.user.role !== "director_admin" && 
        req.user.role !== "hod" && 
        cert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    // Delete from Cloudinary
    if (cert.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(cert.cloudinaryPublicId);
    }
    
    // Delete from database
    await Certificate.findByIdAndDelete(id);
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "delete_certificate", 
      details: { certificateId: id },
      resourceId: id,
      resourceType: "Certificate"
    });
    
    res.json({ ok: true, message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({ error: "Failed to delete certificate" });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get program rules
    const programRule = await ProgramRule.findOne({ program: user.program });
    const requiredPoints = programRule ? programRule.requiredPoints : 100;
    const durationYears = programRule ? programRule.durationYears : 4;
    
    // Calculate progress
    const progress = {
      totalPoints: user.totalPoints || 0,
      requiredPoints,
      percentage: Math.min(100, Math.round(((user.totalPoints || 0) / requiredPoints) * 100)),
      yearWise: []
    };
    
    // Add year-wise progress
    for (let i = 1; i <= durationYears; i++) {
      const yearPoints = user[`year${i}Points`] || 0;
      const minPoints = programRule ? programRule.minPointsPerYear : 25;
      progress.yearWise.push({
        year: i,
        points: yearPoints,
        minRequired: minPoints,
        percentage: Math.min(100, Math.round((yearPoints / minPoints) * 100))
      });
    }
    
    res.json({ progress });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ error: "Failed to fetch user progress" });
  }
};