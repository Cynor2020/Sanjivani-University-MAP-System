import User from "../models/User.js";
import AcademicYear from "../models/AcademicYear.js";
import AuditLog from "../models/AuditLog.js";
import ProgramRule from "../models/ProgramRule.js";
import Department from "../models/Department.js";

// Helper functions for year conversion
const getYearName = (yearNumber) => {
  const yearMap = {
    1: "First",
    2: "Second",
    3: "Third",
    4: "Final"
  };
  return yearMap[yearNumber] || "First";
};

const getYearNumber = (yearName) => {
  const numberMap = {
    "First": 1,
    "Second": 2,
    "Third": 3,
    "Final": 4
  };
  return numberMap[yearName] || 1;
};

const getNextYear = (currentYear) => {
  const nextYearMap = {
    "First": "Second",
    "Second": "Third",
    "Third": "Final"
  };
  return nextYearMap[currentYear];
};

export const startNewAcademicYear = async (req, res) => {
  try {
    const { year } = req.body;
    
    // Get the current academic year
    let currentAcademicYear = await AcademicYear.findOne({ isActive: true });
    
    // End the current academic year
    if (currentAcademicYear) {
      currentAcademicYear.isActive = false;
      currentAcademicYear.endedAt = new Date();
      await currentAcademicYear.save();
    }
    
    // Create new academic year
    const newAcademicYear = new AcademicYear({
      current: year,
      startedAt: new Date(),
      isActive: true
    });
    await newAcademicYear.save();
    
    // Process all students
    const students = await User.find({ role: "student", status: "active" });
    let graduatedCount = 0;
    let pendingClearanceCount = 0;
    
    // Process students by department
    const departments = await Department.find({});
    
    for (const student of students) {
      // Get program rules for the student
      const programRule = await ProgramRule.findOne({ program: student.program });
      const requiredPoints = programRule ? programRule.requiredPoints : 100;
      
      // Find student's current department (based on department name and current year)
      // Now we need to check if any department with this name includes the current year
      const currentDepartment = departments.find(d => 
        d.name === student.department && 
        d.years && d.years.includes(getYearName(student.currentYear))
      );
      
      // If student has a valid department assignment
      if (currentDepartment) {
        const currentYearName = getYearName(student.currentYear);
        
        // Check if this is the final year for this department
        if (currentYearName === "Final") {
          // Graduate the student
          student.status = "alumni";
          student.graduationYear = new Date().getFullYear();
          graduatedCount++;
        } else {
          // Move student to next year in same department
          const nextYear = getNextYear(currentYearName);
          if (nextYear) {
            student.currentYear = getYearNumber(nextYear);
            // Find the next department for this student
            const nextDepartment = departments.find(d => 
              d.name === student.department && 
              d.years && d.years.includes(nextYear)
            );
            
            // If next department exists, update student's department reference
            if (nextDepartment) {
              // Student stays in same department name but moves to next year's department
              // The department field in User model refers to the department name
              // So we don't change it, but the student is now in a different year
            }
          } else {
            // Fallback increment
            student.currentYear = (student.currentYear || 1) + 1;
          }
        }
      } else {
        // Fallback to original logic if no department mapping
        // Check if student should graduate
        if (student.currentYear >= (programRule?.durationYears || 4)) {
          student.status = "alumni";
          student.graduationYear = new Date().getFullYear();
          graduatedCount++;
        } else {
          // Increment year for continuing students
          student.currentYear = (student.currentYear || 1) + 1;
        }
      }
      
      // Check if student has shortfall
      if ((student.totalPoints || 0) < requiredPoints) {
        student.status = "pending_clearance";
        student.pendingClearance = true;
        pendingClearanceCount++;
      }
      
      await student.save();
    }
    
    // Update academic year stats
    newAcademicYear.totalStudents = students.length;
    newAcademicYear.graduatedStudents = graduatedCount;
    newAcademicYear.pendingClearanceStudents = pendingClearanceCount;
    await newAcademicYear.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      username: req.user.name,
      email: req.user.email,
      role: req.user.role,
      ip: req.ip,
      action: "start_new_academic_year",
      details: { 
        previousYear: currentAcademicYear?.current,
        newYear: year,
        totalStudents: students.length,
        graduatedStudents: graduatedCount,
        pendingClearanceStudents: pendingClearanceCount
      }
    });
    
    res.json({ 
      ok: true,
      message: `Academic year updated to ${year}. ${graduatedCount} students graduated, ${pendingClearanceCount} students with pending clearance.`
    });
  } catch (error) {
    console.error("Error starting new academic year:", error);
    res.status(500).json({ error: "Failed to start new academic year" });
  }
};

export const getCurrentAcademicYear = async (req, res) => {
  const doc = await AcademicYear.findOne({ isActive: true });
  res.json({ year: doc?.current || null, id: doc?._id || null });
};

export const getAllAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ startedAt: -1 });
    res.json({ years });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch academic years" });
  }
};

export const getAcademicYearStats = async (req, res) => {
  try {
    const currentYear = await AcademicYear.findOne({ isActive: true });
    if (!currentYear) {
      return res.json({ stats: null });
    }
    
    const stats = {
      totalStudents: currentYear.totalStudents,
      graduatedStudents: currentYear.graduatedStudents,
      pendingClearanceStudents: currentYear.pendingClearanceStudents,
      startedAt: currentYear.startedAt
    };
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch academic year stats" });
  }
};