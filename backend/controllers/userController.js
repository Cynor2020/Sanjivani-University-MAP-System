import User from "../models/User.js";
import bcrypt from "bcrypt";
import AuditLog from "../models/AuditLog.js";
import AcademicYear from "../models/AcademicYear.js";

export const createUser = async (req, res) => {
  try {
    const { email, name, role, department, division, program, currentYear, password, enrollmentNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    // Create user
    const user = new User({
      email,
      name,
      role,
      department,
      division,
      program,
      enrollmentNumber: role === "student" ? enrollmentNumber : undefined,
      currentYear: role === "student" ? currentYear : undefined
    });
    
    // If password is provided, hash and save it
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      user.passwordHash = hash;
    }
    
    await user.save();
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "create_user", 
      details: { createdUserId: user._id, email: user.email, role: user.role },
      resourceId: user._id,
      resourceType: "User"
    });
    
    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error("Error creating user:", error);
    // Provide more specific error messages
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    if (error.code === 11000) {
      // Check if it's a duplicate enrollment number error
      if (error.message.includes("enrollmentNumber")) {
        return res.status(400).json({ error: "Student with this enrollment number already exists" });
      }
      return res.status(400).json({ error: "User with this email already exists" });
    }
    res.status(500).json({ error: "Failed to create user: " + error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role, department, division, page = 1, limit = 20, search = "" } = req.query;
    
    // Build filter
    const filter = {};
    if (role) {
      filter.role = role;
    }
    if (department) {
      filter.department = department;
    }
    if (division) {
      filter.division = division;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { enrollmentNumber: { $regex: search, $options: "i" } }
      ];
    }
    
    // Get total count
    const totalCount = await User.countDocuments(filter);
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-passwordHash').lean();
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.passwordHash;
    delete updates.email;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "update_user", 
      details: { updatedUserId: user._id, updates },
      resourceId: user._id,
      resourceType: "User"
    });
    
    res.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "delete_user", 
      details: { deletedUserId: id, email: user.email },
      resourceId: id,
      resourceType: "User"
    });
    
    res.json({ ok: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const setPassword = async (req, res) => {
  try {
    // Get userId from URL parameter or request body
    const userId = req.params.id || req.body.userId;
    const { password } = req.body;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Validate password strength
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { passwordHash: hash },
      { new: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "set_user_password", 
      details: { targetUserId: userId },
      resourceId: userId,
      resourceType: "User"
    });
    
    res.json({ ok: true, message: "Password set successfully" });
  } catch (error) {
    console.error("Error setting password:", error);
    res.status(500).json({ error: "Failed to set password" });
  }
};

export const getStudentPasswords = async (req, res) => {
  try {
    // Only mentors and admins can view passwords
    if (!['mentor', 'hod', 'director_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    // Get students in the same division/department
    const filter = { role: "student" };
    
    if (req.user.role === "mentor" && req.user.division) {
      filter.division = req.user.division;
    } else if (req.user.role === "hod" && req.user.department) {
      filter.department = req.user.department;
    }
    
    const students = await User.find(filter)
      .select('name email enrollmentNumber division department program')
      .sort({ name: 1 })
      .lean();
    
    res.json({ students });
  } catch (error) {
    console.error("Error fetching student passwords:", error);
    res.status(500).json({ error: "Failed to fetch student passwords" });
  }
};

export const getDepartmentStats = async (req, res) => {
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }
    
    // Get current academic year
    const currentAcademicYear = await AcademicYear.findOne({ isActive: true });
    
    // Get department statistics
    const totalStudents = await User.countDocuments({ 
      role: "student", 
      department,
      status: "active"
    });
    
    const alumniCount = await User.countDocuments({ 
      role: "student", 
      department,
      status: "alumni"
    });
    
    const pendingClearanceCount = await User.countDocuments({ 
      role: "student", 
      department,
      status: "pending_clearance"
    });
    
    // Get average points
    const avgPointsResult = await User.aggregate([
      {
        $match: {
          role: "student",
          department,
          status: "active"
        }
      },
      {
        $group: {
          _id: null,
          avgPoints: { $avg: "$totalPoints" },
          maxPoints: { $max: "$totalPoints" },
          minPoints: { $min: "$totalPoints" }
        }
      }
    ]);
    
    const avgPoints = avgPointsResult.length > 0 ? Math.round(avgPointsResult[0].avgPoints) : 0;
    const maxPoints = avgPointsResult.length > 0 ? avgPointsResult[0].maxPoints : 0;
    const minPoints = avgPointsResult.length > 0 ? avgPointsResult[0].minPoints : 0;
    
    res.json({
      department,
      stats: {
        totalStudents,
        alumniCount,
        pendingClearanceCount,
        avgPoints,
        maxPoints,
        minPoints,
        academicYear: currentAcademicYear?.current || null
      }
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({ error: "Failed to fetch department stats" });
  }
};

export const getUniversityStats = async (req, res) => {
  try {
    // Get current academic year
    const currentAcademicYear = await AcademicYear.findOne({ isActive: true });
    
    // Get university-wide statistics
    const totalUsers = await User.countDocuments();
    
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const roleStats = {};
    roleCounts.forEach(item => {
      roleStats[item._id] = item.count;
    });
    
    // Get department-wise student counts
    const departmentStats = await User.aggregate([
      {
        $match: {
          role: "student",
          status: "active"
        }
      },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          avgPoints: { $avg: "$totalPoints" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get top performing students
    const topStudents = await User.find({ 
      role: "student", 
      status: "active" 
    })
      .select('name email department totalPoints')
      .sort({ totalPoints: -1 })
      .limit(10)
      .lean();
    
    res.json({
      stats: {
        totalUsers,
        roleStats,
        departmentStats,
        topStudents,
        academicYear: currentAcademicYear?.current || null
      }
    });
  } catch (error) {
    console.error("Error fetching university stats:", error);
    res.status(500).json({ error: "Failed to fetch university stats" });
  }
};