import Department from "../models/Department.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip || 'unknown';
};

export const createDepartment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - Please login first" });
    }
    
    // Check if user is super_admin
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden - Only Super Admin can create departments" });
    }
    
    const { name, years } = req.body;
    
    if (!name || !years || !Array.isArray(years) || years.length === 0) {
      return res.status(400).json({ error: "Name and years are required" });
    }

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Department already exists" });
    }
    
    const department = await Department.create({ name, years });
    
    await AuditLog.create({
      ip: getClientIP(req),
      action: `Department created: ${name}`,
      userId: req.user._id
    });
    
    res.json({ department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('hod', 'name email')
      .sort({ name: 1 })
      .lean();
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, years, isActive } = req.body;
    
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    
    if (name && name !== department.name) {
      const existing = await Department.findOne({ name });
      if (existing) {
        return res.status(400).json({ error: "Department name already exists" });
      }
      department.name = name;
    }
    
    if (years) department.years = years;
    if (isActive !== undefined) department.isActive = isActive;
    
    await department.save();
    
    await AuditLog.create({
      ip: getClientIP(req),
      action: `Department updated: ${department.name}`,
      userId: req.user._id
    });
    
    res.json({ department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    
    // Check if department has students
    const studentCount = await User.countDocuments({ department: id, role: "student" });
    if (studentCount > 0) {
      return res.status(400).json({ error: "Cannot delete department with students" });
    }
    
    department.isActive = false;
    await department.save();
    
    await AuditLog.create({
      ip: getClientIP(req),
      action: `Department deleted: ${department.name}`,
      userId: req.user._id
    });
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
