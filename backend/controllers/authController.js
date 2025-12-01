import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Department from "../models/Department.js";
import AuditLog from "../models/AuditLog.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const issueCookie = (res, user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "default-secret-change-in-production", { expiresIn: "7d" });
  const isProd = process.env.NODE_ENV === "production";
  // For development, use SameSite=Lax to allow cookies
  // For production, use SameSite=None with Secure
  const attrs = isProd 
    ? "Secure; SameSite=None;" 
    : "SameSite=Lax;";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/"
  });
};

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip || 'unknown';
};

export const register = async (req, res) => {
  try {
    const { department, year, prn, name, email, mobile, whatsapp, password } = req.body;
    
    // Validate required fields
    if (!department || !year || !prn || !name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email or PRN already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ error: "Email already exists" });

    const existingPRN = await User.findOne({ prn });
    if (existingPRN) return res.status(400).json({ error: "PRN already exists" });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let profilePhoto = "";
    
    // Upload profile photo if provided
    if (req.file) {
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          const uploaded = await cloudinary.uploader.upload(req.file.path, { 
            folder: "sanjivani-map/profiles" 
          });
          profilePhoto = uploaded.secure_url;
        } else {
          profilePhoto = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
        }
        // Clean up temp file
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
      } catch (uploadError) {
        console.error("Error uploading profile photo:", uploadError);
        if (req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {}
        }
      }
    }

    // Create student
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      role: "student",
      prn,
      department,
      currentYear: year,
      mobile,
      whatsapp,
      profilePhoto,
      passwordHash,
      status: "active"
    });

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Student registered: ${name} (${prn})`,
      userId: user._id
    });

    res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({ error: error.message });
  }
};

// New dedicated function for student registration with enhanced validation
export const registerStudent = async (req, res) => {
  let tempFilePath = null;
  
  try {
    const { department, year, prn, name, email, mobile, password, confirmPassword } = req.body;
    
    // Log incoming data for debugging
    console.log("Incoming registration data:", { department, year, prn, name, email, mobile, password, confirmPassword });
    
    // Validate required fields
    if (!department || !year || !prn || !name || !email || !mobile || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Validate mobile number (exactly 10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ error: "Email already exists" });

    // Check if PRN already exists
    const existingPRN = await User.findOne({ prn });
    if (existingPRN) return res.status(400).json({ error: "PRN already exists" });

    // Verify department exists and year is valid for that department
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({ error: "Invalid department" });
    }

    if (!dept.years.includes(year)) {
      return res.status(400).json({ error: "Invalid year for selected department" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let profilePhoto = "";
    
    // Upload profile photo if provided
    if (req.file) {
      tempFilePath = req.file.path;
      try {
        // Always use Cloudinary for profile photos
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          const uploaded = await cloudinary.uploader.upload(tempFilePath, { 
            folder: "sanjivani-map/profiles" 
          });
          profilePhoto = uploaded.secure_url;
        } else {
          // Fallback to local storage if Cloudinary is not configured
          // Use backend URL since that's where the uploads are served from
          profilePhoto = `http://localhost:5000/uploads/${req.file.filename}`;
        }
      } catch (uploadError) {
        console.error("Error uploading profile photo:", uploadError);
        // Don't fail the registration if profile photo upload fails
        profilePhoto = "";
      }
    }

    // Create student
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      role: "student",
      prn,
      department,
      currentYear: year,
      mobile,
      profilePhoto,
      passwordHash,
      status: "active"
    });

    // Clean up temp file after successful user creation
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Student registered: ${name} (${prn})`,
      userId: user._id
    });

    res.status(201).json({ 
      ok: true, 
      message: "Account created successfully!",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      } 
    });
  } catch (error) {
    // Clean up temp file if exists
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    console.error("Student registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    
    if (user.status === "deleted" || user.status === "inactive") {
      return res.status(400).json({ error: "Account is inactive" });
    }
    
    if (!user.passwordHash) {
      return res.status(400).json({ 
        error: "Account not activated. Please contact administrator." 
      });
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    
    issueCookie(res, user);
    user.lastLoginAt = new Date();
    await user.save();
    
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Login: ${user.name} (${user.role})`,
      userId: user._id
    });
    
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        email: user.email,
        department: user.department,
        currentYear: user.currentYear
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Only populate department for users who have one (students, HODs, etc.)
    // Super Admins and Directors don't have departments
    if (user.department) {
      await user.populate('department', 'name years');
    }
    
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        email: user.email,
        department: user.department,
        currentYear: user.currentYear,
        prn: user.prn,
        mobile: user.mobile,
        whatsapp: user.whatsapp,
        totalPoints: user.totalPoints,
        profilePhoto: user.profilePhoto
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 0,
      path: "/"
    });
    
    if (req.user) {
      await AuditLog.create({ 
        ip: getClientIP(req), 
        action: `Logout: ${req.user.name}`,
        userId: req.user._id
      });
    }
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};