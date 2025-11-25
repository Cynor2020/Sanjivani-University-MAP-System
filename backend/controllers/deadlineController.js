import UploadDeadline from "../models/UploadDeadline.js";
import AuditLog from "../models/AuditLog.js";
import AcademicYear from "../models/AcademicYear.js";

export const setDeadline = async (req, res) => {
  try {
    const { academicYear, department, deadlineAt } = req.body;
    
    // Validate required fields
    if (!academicYear || !department || !deadlineAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Validate date format
    const deadlineDate = new Date(deadlineAt);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    
    // Set or update deadline
    const deadline = await UploadDeadline.findOneAndUpdate(
      { academicYear, department },
      { 
        academicYear, 
        department, 
        deadlineAt: deadlineDate, 
        updatedBy: req.user._id,
        isActive: true
      },
      { new: true, upsert: true }
    );
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "set_deadline", 
      details: { academicYear, department, deadlineAt: deadlineDate },
      resourceId: deadline._id,
      resourceType: "UploadDeadline"
    });
    
    res.json({ deadline });
  } catch (error) {
    console.error("Error setting deadline:", error);
    res.status(500).json({ error: "Failed to set deadline" });
  }
};

export const getDeadline = async (req, res) => {
  try {
    const { academicYear, department } = req.query;
    
    // Validate required parameters
    if (!academicYear || !department) {
      return res.status(400).json({ error: "Academic year and department are required" });
    }
    
    const deadline = await UploadDeadline.findOne({ 
      academicYear, 
      department,
      isActive: true 
    });
    
    res.json({ deadline });
  } catch (error) {
    console.error("Error fetching deadline:", error);
    res.status(500).json({ error: "Failed to fetch deadline" });
  }
};

export const getAllDeadlines = async (req, res) => {
  try {
    const { academicYear, department, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    if (department) {
      filter.department = department;
    }
    
    // Get total count
    const totalCount = await UploadDeadline.countDocuments(filter);
    
    // Get deadlines with pagination
    const deadlines = await UploadDeadline.find(filter)
      .populate('updatedBy', 'name email')
      .sort({ deadlineAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      deadlines,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching deadlines:", error);
    res.status(500).json({ error: "Failed to fetch deadlines" });
  }
};

export const deleteDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and deactivate deadline
    const deadline = await UploadDeadline.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!deadline) {
      return res.status(404).json({ error: "Deadline not found" });
    }
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "delete_deadline", 
      details: { deadlineId: id },
      resourceId: id,
      resourceType: "UploadDeadline"
    });
    
    res.json({ ok: true, message: "Deadline deleted successfully" });
  } catch (error) {
    console.error("Error deleting deadline:", error);
    res.status(500).json({ error: "Failed to delete deadline" });
  }
};

export const checkDeadlineStatus = async (req, res) => {
  try {
    // Get current academic year
    const currentAcademicYear = await AcademicYear.findOne({ isActive: true });
    if (!currentAcademicYear) {
      return res.json({ status: "no_academic_year", message: "No active academic year found" });
    }
    
    // Get deadline for user's department
    const deadline = await UploadDeadline.findOne({ 
      academicYear: currentAcademicYear.current,
      department: req.user.department,
      isActive: true
    });
    
    if (!deadline) {
      return res.json({ status: "no_deadline", message: "No deadline set for your department" });
    }
    
    const now = new Date();
    const deadlineDate = new Date(deadline.deadlineAt);
    
    // Check if deadline has passed
    if (now > deadlineDate) {
      return res.json({ 
        status: "expired", 
        deadline: deadlineDate,
        daysRemaining: Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
      });
    }
    
    // Calculate days remaining
    const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    
    res.json({ 
      status: "active", 
      deadline: deadlineDate,
      daysRemaining,
      message: daysRemaining <= 3 ? `Hurry up! Only ${daysRemaining} days left to upload certificates!` : ""
    });
  } catch (error) {
    console.error("Error checking deadline status:", error);
    res.status(500).json({ error: "Failed to check deadline status" });
  }
};