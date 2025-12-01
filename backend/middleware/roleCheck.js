export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error("Role check failed: No user in request");
      return res.status(401).json({ error: "Unauthorized - No user found" });
    }
    
    if (!roles.includes(req.user.role)) {
      console.error(`Role check failed: User role ${req.user.role} not in allowed roles [${roles.join(', ')}]`);
      return res.status(403).json({ error: "Forbidden - Insufficient permissions" });
    }
    
    next();
  };
};
