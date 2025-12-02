import AuditLog from "../models/AuditLog.js";

export const listAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, q = "", action = "", ip = "", userId = "", role = "", from = "", to = "" } = req.query;

    const match = {};
    if (q) {
      const rx = new RegExp(q, 'i');
      match.$or = [{ action: rx }, { details: rx }];
    }
    if (action) match.action = new RegExp(action, 'i');
    if (ip) match.ip = new RegExp(ip, 'i');
    if (userId) match.userId = userId;
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const pipeline = [
      { $match: match },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    // If user is Director, exclude Super Admin logs
    if (req.user.role === "director") {
      pipeline.push({ $match: { $or: [
        { 'user.role': { $ne: 'super_admin' } },
        { 'user.role': { $exists: false } }
      ] } });
    }

    if (role) {
      pipeline.push({ $match: { 'user.role': role } });
    }

    pipeline.push(
      { $sort: { timestamp: -1 } },
      { $facet: {
          logs: [
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            { $project: {
              _id: 1,
              timestamp: 1,
              ip: 1,
              action: 1,
              details: 1,
              user: { _id: '$user._id', name: '$user.name', email: '$user.email', role: '$user.role' }
            } }
          ],
          totalCount: [ { $count: 'count' } ]
        } }
    );

    const agg = await AuditLog.aggregate(pipeline);
    const logs = agg[0]?.logs || [];
    const total = agg[0]?.totalCount?.[0]?.count || 0;
    const totalPages = Math.ceil(total / limitNum) || 0;

    res.json({
      logs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount: total,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages
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
