import User from "../models/User.js";
import AcademicYear from "../models/AcademicYear.js";
import AuditLog from "../models/AuditLog.js";
import Department from "../models/Department.js";

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
      
      if (nextYear && dept.years.includes(nextYear)) {
        // Promote to next year
        student.currentYear = nextYear;
        student.academicYear = year;
        promoted++;
      } else {
        // Graduate (reached final year)
        student.status = "alumni";
        graduated++;
      }
      
      await student.save();
    }
    
    await AuditLog.create({
      ip: getClientIP(req),
      action: `New academic year started: ${year}`,
      userId: req.user._id
    });
    
    res.json({ 
      ok: true, 
      message: `Academic year ${year} started. ${promoted} students promoted, ${graduated} graduated.`,
      promoted,
      graduated
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
