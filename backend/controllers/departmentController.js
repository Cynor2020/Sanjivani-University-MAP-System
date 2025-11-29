import Department from "../models/Department.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

export const createDepartment = async (req, res) => {
  try {
    const { name, years } = req.body;
    
    // Check if department already exists
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Department with this name already exists" });
    }
    
    const department = new Department({ name, years });
    await department.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      username: req.user.name,
      email: req.user.email,
      role: req.user.role,
      ip: req.ip,
      action: "create_department",
      details: { departmentId: department._id, name: department.name, years: department.years },
      resourceId: department._id,
      resourceType: "Department"
    });
    
    res.status(201).json({ department });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ error: "Failed to create department" });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('hod', 'name email');
    res.json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).populate('hod', 'name email');
    
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    
    res.json({ department });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ error: "Failed to fetch department" });
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
    
    // Check if name is being changed and if it conflicts with another department
    if (name && name !== department.name) {
      const existing = await Department.findOne({ name });
      if (existing) {
        return res.status(400).json({ error: "Department with this name already exists" });
      }
      department.name = name;
    }
    
    if (years) department.years = years;
    if (isActive !== undefined) department.isActive = isActive;
    
    await department.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      username: req.user.name,
      email: req.user.email,
      role: req.user.role,
      ip: req.ip,
      action: "update_department",
      details: { departmentId: department._id, name: department.name, years: department.years },
      resourceId: department._id,
      resourceType: "Department"
    });
    
    res.json({ department });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Failed to update department" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    
    // Check if department has any users assigned
    const userCount = await User.countDocuments({ department: department.name });
    if (userCount > 0) {
      return res.status(400).json({ error: "Cannot delete department with assigned users" });
    }
    
    await department.remove();
    
    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      username: req.user.name,
      email: req.user.email,
      role: req.user.role,
      ip: req.ip,
      action: "delete_department",
      details: { departmentId: id, name: department.name },
      resourceId: id,
      resourceType: "Department"
    });
    
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Failed to delete department" });
  }
};

export const assignHOD = async (req, res) => {
  try {
    const { id } = req.params;
    const { hodId } = req.body;
    
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    
    // Verify that the user exists and is an HOD
    const hod = await User.findById(hodId);
    if (!hod) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (hod.role !== "hod") {
      return res.status(400).json({ error: "User must be an HOD" });
    }
    
    // Assign HOD to department
    department.hod = hodId;
    await department.save();
    
    // Update user's department field
    hod.department = department.name;
    await hod.save();
    
    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      username: req.user.name,
      email: req.user.email,
      role: req.user.role,
      ip: req.ip,
      action: "assign_hod_to_department",
      details: { departmentId: department._id, hodId: hodId, departmentName: department.name, hodName: hod.name },
      resourceId: department._id,
      resourceType: "Department"
    });
    
    res.json({ department: await Department.findById(id).populate('hod', 'name email') });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign HOD" });
  }
};