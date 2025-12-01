import UploadLock from "../models/UploadLock.js";
import AuditLog from "../models/AuditLog.js";

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip || 'unknown';
};

// HOD: Toggle upload status
export const toggleUploadStatus = async (req, res) => {
  try {
    const { isActive, deadlineAt } = req.body;
    
    if (!req.user.department) {
      return res.status(400).json({ error: "HOD must be assigned to a department" });
    }

    let lock = await UploadLock.findOne({ department: req.user.department });
    
    if (!lock) {
      lock = await UploadLock.create({
        department: req.user.department,
        isActive: isActive !== undefined ? isActive : true,
        deadlineAt: deadlineAt ? new Date(deadlineAt) : null,
        updatedBy: req.user._id
      });
    } else {
      lock.isActive = isActive !== undefined ? isActive : !lock.isActive;
      if (deadlineAt) {
        lock.deadlineAt = new Date(deadlineAt);
      }
      lock.updatedBy = req.user._id;
      await lock.save();
    }
    
    await AuditLog.create({
      ip: getClientIP(req),
      action: `Upload status toggled: ${lock.isActive ? 'Active' : 'Inactive'}`,
      userId: req.user._id
    });
    
    res.json({ lock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get upload status for HOD's department
export const getUploadStatus = async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(400).json({ error: "HOD must be assigned to a department" });
    }

    const lock = await UploadLock.findOne({ department: req.user.department });
    
    if (!lock) {
      return res.json({ 
        isActive: true, 
        deadlineAt: null,
        message: "Upload is active (no restrictions set)" 
      });
    }
    
    res.json({ 
      isActive: lock.isActive,
      deadlineAt: lock.deadlineAt,
      message: lock.isActive 
        ? "Upload is active" 
        : lock.deadlineAt && new Date() > new Date(lock.deadlineAt)
          ? "Certificate upload is currently disabled by HOD. Deadline overdue."
          : `Upload will be disabled after ${new Date(lock.deadlineAt).toLocaleString()}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

