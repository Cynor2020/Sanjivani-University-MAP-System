import AuditLog from "../models/AuditLog.js";

export const listAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "", role = "", action = "" } = req.query;
    
    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } }
      ];
    }
    if (role) {
      filter.role = role;
    }
    if (action) {
      filter.action = action;
    }
    
    // Get total count
    const totalCount = await AuditLog.countDocuments(filter);
    
    // Get paginated logs
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

export const deleteAuditLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has permission to delete (only super admin)
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Only super admins can delete audit logs" });
    }
    
    const log = await AuditLog.findByIdAndDelete(id);
    if (!log) {
      return res.status(404).json({ error: "Audit log not found" });
    }
    
    res.json({ ok: true, message: "Audit log deleted successfully" });
  } catch (error) {
    console.error("Error deleting audit log:", error);
    res.status(500).json({ error: "Failed to delete audit log" });
  }
};

export const deleteAllAuditLogs = async (req, res) => {
  try {
    // Check if user has permission to delete (only super admin)
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Only super admins can delete audit logs" });
    }
    
    const result = await AuditLog.deleteMany({});
    
    res.json({ 
      ok: true, 
      message: `Successfully deleted ${result.deletedCount} audit logs` 
    });
  } catch (error) {
    console.error("Error deleting all audit logs:", error);
    res.status(500).json({ error: "Failed to delete audit logs" });
  }
};

export const getAuditStats = async (req, res) => {
  try {
    // Get total count
    const totalCount = await AuditLog.countDocuments();
    
    // Get recent activity counts
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await AuditLog.countDocuments({ timestamp: { $gte: oneDayAgo } });
    
    // Get top actions
    const topActions = await AuditLog.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top users
    const topUsers = await AuditLog.aggregate([
      { $group: { _id: "$username", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({ 
      stats: {
        totalCount,
        recentCount,
        topActions,
        topUsers
      }
    });
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    res.status(500).json({ error: "Failed to fetch audit stats" });
  }
};