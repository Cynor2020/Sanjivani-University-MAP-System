import AuditLog from "../models/AuditLog.js";

export const listAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    res.json({ 
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAuditLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    await AuditLog.findByIdAndDelete(id);
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
