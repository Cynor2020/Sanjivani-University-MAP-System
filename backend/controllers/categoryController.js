import ActivityCategory from "../models/ActivityCategory.js";
import AuditLog from "../models/AuditLog.js";

export const listCategories = async (req, res) => {
  try {
    const { isActive = true, categoryType = "", search = "", page = 1, limit = 50 } = req.query;
    
    // Build filter
    const filter = {};
    if (isActive !== "") {
      filter.isActive = isActive === "true";
    }
    if (categoryType) {
      filter.categoryType = categoryType;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    // Get total count
    const totalCount = await ActivityCategory.countDocuments(filter);
    
    // Get categories with pagination
    const categories = await ActivityCategory.find(filter)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
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
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

export const upsertCategory = async (req, res) => {
  try {
    const { id, name, description, pointsByLevel, categoryType } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    
    let category;
    
    if (id) {
      // Update existing category
      category = await ActivityCategory.findByIdAndUpdate(
        id,
        { name, description, pointsByLevel, categoryType },
        { new: true, runValidators: true }
      );
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      // Log the action
      await AuditLog.create({ 
        userId: req.user._id, 
        username: req.user.name, 
        email: req.user.email,
        role: req.user.role, 
        ip: req.ip, 
        action: "update_category", 
        details: { categoryId: id, name },
        resourceId: id,
        resourceType: "ActivityCategory"
      });
    } else {
      // Create new category
      category = new ActivityCategory({
        name,
        description,
        pointsByLevel,
        categoryType
      });
      
      await category.save();
      
      // Log the action
      await AuditLog.create({ 
        userId: req.user._id, 
        username: req.user.name, 
        email: req.user.email,
        role: req.user.role, 
        ip: req.ip, 
        action: "create_category", 
        details: { categoryId: category._id, name },
        resourceId: category._id,
        resourceType: "ActivityCategory"
      });
    }
    
    res.json({ category });
  } catch (error) {
    console.error("Error saving category:", error);
    res.status(500).json({ error: "Failed to save category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await ActivityCategory.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "delete_category", 
      details: { categoryId: id, name: category.name },
      resourceId: id,
      resourceType: "ActivityCategory"
    });
    
    res.json({ ok: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await ActivityCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Toggle active status
    category.isActive = !category.isActive;
    await category.save();
    
    // Log the action
    await AuditLog.create({ 
      userId: req.user._id, 
      username: req.user.name, 
      email: req.user.email,
      role: req.user.role, 
      ip: req.ip, 
      action: "toggle_category_status", 
      details: { categoryId: id, name: category.name, isActive: category.isActive },
      resourceId: id,
      resourceType: "ActivityCategory"
    });
    
    res.json({ 
      category,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("Error toggling category status:", error);
    res.status(500).json({ error: "Failed to toggle category status" });
  }
};