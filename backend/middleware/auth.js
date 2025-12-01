import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.token;
    
    // If no cookie, try Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "").trim();
    }
    
    if (!token) {
      console.error("Auth failed: No token found. Cookies:", req.cookies);
      return res.status(401).json({ error: "Unauthorized - No token provided. Please login again." });
    }
    
    const jwtSecret = process.env.JWT_SECRET || "default-secret-change-in-production";
    let payload;
    
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message);
      return res.status(401).json({ error: "Unauthorized - Invalid or expired token. Please login again." });
    }
    
    if (!payload || !payload.id) {
      return res.status(401).json({ error: "Unauthorized - Invalid token payload" });
    }
    
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }
    
    if (user.status === "deleted" || user.status === "inactive") {
      return res.status(401).json({ error: "Unauthorized - Account inactive" });
    }
    
    req.user = user;
    next();
  } catch (e) {
    console.error("Auth middleware error:", e.message);
    return res.status(401).json({ error: "Unauthorized - " + e.message });
  }
};