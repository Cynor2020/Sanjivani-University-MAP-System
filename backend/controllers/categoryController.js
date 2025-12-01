import ActivityCategory from "../models/ActivityCategory.js";
import AuditLog from "../models/AuditLog.js";

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip || 'unknown';
};

export const listCategories = async (req, res) => {
  try {
    const categories = await ActivityCategory.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ActivityCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Super Admin: Create Category
export const createCategory = async (req, res) => {
  try {
    // Check if user is authenticated and is super_admin
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden - Only Super Admin can create categories" });
    }
    
    const { name, description, points } = req.body;
    
    if (!name || points === undefined) {
      return res.status(400).json({ error: "Name and points are required" });
    }
    
    // Check if category already exists
    const existing = await ActivityCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Category with this name already exists" });
    }
    
    const category = await ActivityCategory.create({
      name,
      description,
      points: parseInt(points),
      isActive: true
    });
    
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Category created: ${name}`,
      userId: req.user._id
    });
    
    res.status(201).json({ ok: true, category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Super Admin: Get all categories (including inactive)
export const getAllCategories = async (req, res) => {
  try {
    console.log("getAllCategories called by user:", req.user);
    
    // Check if user is authenticated and is super_admin
    if (!req.user || req.user.role !== "super_admin") {
      console.log("Access denied: User is not super_admin");
      return res.status(403).json({ error: "Forbidden - Only Super Admin can view all categories" });
    }
    
    const categories = await ActivityCategory.find()
      .sort({ name: 1 })
      .lean();
      
    console.log("Found categories:", categories);
    res.json({ categories });
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({ error: error.message });
  }
};

// Super Admin: Update Category
export const updateCategory = async (req, res) => {
  try {
    // Check if user is authenticated and is super_admin
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden - Only Super Admin can update categories" });
    }
    
    const { id } = req.params;
    const { name, description, points, isActive } = req.body;
    
    const category = await ActivityCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Check if another category with the same name exists
    if (name && name !== category.name) {
      const existing = await ActivityCategory.findOne({ name });
      if (existing) {
        return res.status(400).json({ error: "Category with this name already exists" });
      }
    }
    
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (points !== undefined) category.points = parseInt(points);
    if (isActive !== undefined) category.isActive = isActive;
    
    await category.save();
    
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Category updated: ${category.name}`,
      userId: req.user._id
    });
    
    res.json({ ok: true, category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Super Admin: Delete Category (soft delete)
export const deleteCategory = async (req, res) => {
  try {
    // Check if user is authenticated and is super_admin
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden - Only Super Admin can delete categories" });
    }
    
    const { id } = req.params;
    
    const category = await ActivityCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Soft delete
    category.isActive = false;
    await category.save();
    
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Category deleted: ${category.name}`,
      userId: req.user._id
    });
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};