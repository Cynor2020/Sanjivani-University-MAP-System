import User from "../models/User.js";
import AcademicYear from "../models/AcademicYear.js";
import AuditLog from "../models/AuditLog.js";
import Department from "../models/Department.js";
import Certificate from "../models/Certificate.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip || 'unknown';
};

const getNextYear = (currentYear) => {
  const yearMap = {
    "First": "Second",
    "Second": "Third",
    "Third": "Fourth",
    "Fourth": "Fifth",
    "Fifth": "Sixth"
  };
  return yearMap[currentYear] || null;
};

// Function to delete a certificate and its associated file
const deleteCertificate = async (cert) => {
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
  
  // Remove certificate from database
  await Certificate.findByIdAndDelete(cert._id);
};

// Function to clean up final year students
const cleanupFinalYearStudents = async () => {
  try {
    // Find all students marked as alumni (final year students who have graduated)
    const finalYearStudents = await User.find({ 
      role: "student", 
      status: "alumni"
    });
    
    let deletedStudentsCount = 0;
    let deletedCertificatesCount = 0;
    
    // For each final year student, delete all their certificates and then the student profile
    for (const student of finalYearStudents) {
      // Find all certificates belonging to this student
      const certificates = await Certificate.find({ userId: student._id });
      
      // Delete each certificate and its associated file
      for (const cert of certificates) {
        await deleteCertificate(cert);
        deletedCertificatesCount++;
      }
      
      // Delete the student profile
      await User.findByIdAndDelete(student._id);
      deletedStudentsCount++;
    }
    
    return { deletedStudentsCount, deletedCertificatesCount };
  } catch (error) {
    console.error("Error during final year student cleanup:", error);
    throw error;
  }
};

export const startNewAcademicYear = async (req, res) => {
  try {
    const { year } = req.body;
    
    if (!year) {
      return res.status(400).json({ error: "Academic year is required" });
    }

    // End current academic year
    const currentYear = await AcademicYear.findOne({ isActive: true });
    if (currentYear) {
      currentYear.isActive = false;
      currentYear.endedAt = new Date();
      await currentYear.save();
    }
    
    // Create new academic year
    const newYear = await AcademicYear.create({
      current: year,
      startedAt: new Date(),
      isActive: true
    });
    
    // Auto-promote students
    const students = await User.find({ 
      role: "student", 
      status: { $in: ["active", "pending_clearance"] }
    }).populate('department');
    
    let promoted = 0;
    let graduated = 0;
    
    for (const student of students) {
      if (!student.currentYear || !student.department) continue;
      
      const dept = await Department.findById(student.department);
      if (!dept) continue;
      
      const nextYear = getNextYear(student.currentYear);
      
      // Check if this is the final year for this department
      const finalYear = dept.years[dept.years.length - 1];
      
      if (nextYear && dept.years.includes(nextYear)) {
        // Promote to next year
        student.currentYear = nextYear;
        student.academicYear = year; // Update the current academic year
        promoted++;
      } else if (student.currentYear === finalYear) {
        // Graduate (reached final year)
        student.status = "alumni";
        graduated++;
      }
      
      await student.save();
    }
    
    // Perform cleanup of final year students
    const cleanupResult = await cleanupFinalYearStudents();
    
    await AuditLog.create({
      ip: getClientIP(req),
      action: `New academic year started: ${year}. ${promoted} students promoted, ${graduated} graduated. ${cleanupResult.deletedStudentsCount} final year students and ${cleanupResult.deletedCertificatesCount} certificates permanently removed.`,
      userId: req.user._id
    });
    
    res.json({ 
      ok: true, 
      message: `Academic year ${year} started. ${promoted} students promoted, ${graduated} graduated. ${cleanupResult.deletedStudentsCount} final year students and ${cleanupResult.deletedCertificatesCount} certificates permanently removed.`,
      promoted,
      graduated,
      deletedStudents: cleanupResult.deletedStudentsCount,
      deletedCertificates: cleanupResult.deletedCertificatesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentAcademicYear = async (req, res) => {
  try {
    const year = await AcademicYear.findOne({ isActive: true });
    res.json({ year: year?.current || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ startedAt: -1 }).lean();
    res.json({ years });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};