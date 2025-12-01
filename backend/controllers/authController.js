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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Check if user account is active
    if (user.status === "deleted" || user.status === "inactive") {
      return res.status(401).json({ error: "Account is inactive. Please contact administrator." });
    }
    
    // Check if user has set a password
    if (!user.passwordHash) {
      return res.status(401).json({ 
        error: "Account not activated. Please set your password first." 
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();
    
    // Issue JWT token
    issueCookie(res, user);
    
    // Log the login
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Login: ${user.name} (${user.email})`,
      userId: user._id
    });
    
    // Return user data (excluding password hash)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      currentYear: user.currentYear,
      prn: user.prn,
      mobile: user.mobile,
      whatsapp: user.whatsapp,
      totalPoints: user.totalPoints,
      profilePhoto: user.profilePhoto
    };
    
    res.json({ user: userData });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
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
          profilePhoto = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
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

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Student registered: ${name} (${prn})`,
      userId: user._id
    });

    // Clean up temp file
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error("Error deleting temp file:", e);
      }
    }

    res.json({ ok: true });
  } catch (error) {
    // Clean up temp file on error
    if (tempFilePath) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error("Error deleting temp file:", e);
      }
    }
    res.status(500).json({ error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    // Populate the department with both name and years
    const user = await User.findById(req.user._id)
      .populate('department', 'name years');
    
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

// New endpoint to get department years for HOD
export const getMyDepartmentYears = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name years');
      
    if (!user.department) {
      return res.status(400).json({ error: "User is not assigned to a department" });
    }
    
    res.json({ 
      department: {
        id: user.department._id,
        name: user.department.name,
        years: user.department.years
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

export const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new password required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const ok = await bcrypt.compare(currentPassword, user.passwordHash || "");
    if (!ok) return res.status(400).json({ error: "Current password is incorrect" });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    await AuditLog.create({ 
      userId: req.user._id,
      ip: req.ip,
      action: "update_password",
      details: `User updated own password: ${user.email}`
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMyPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo provided" });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let profilePhoto = user.profilePhoto || "";
    try {
      const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloudinary-cloud-name' &&
        process.env.CLOUDINARY_API_KEY !== 'your-cloudinary-api-key' &&
        process.env.CLOUDINARY_API_SECRET !== 'your-cloudinary-api-secret';
      if (hasCloudinary) {
        const uploaded = await cloudinary.uploader.upload(req.file.path, { folder: "sanjivani-map/profiles" });
        profilePhoto = uploaded.secure_url;
        if (req.file.path) {
          fs.unlinkSync(req.file.path);
        }
      } else {
        profilePhoto = `http://localhost:5000/uploads/${req.file.filename}`;
      }
    } catch (e) {
      profilePhoto = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    user.profilePhoto = profilePhoto;
    await user.save();
    await AuditLog.create({ 
      userId: req.user._id,
      ip: req.ip,
      action: "update_profile_photo",
      details: `User updated own photo: ${user.email}`
    });
    const safeUser = await User.findById(req.user._id).select('-passwordHash').lean();
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile details (name, email, mobile)
export const updateMyProfile = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    
    // Validate input
    if (!name || !email || !mobile) {
      return res.status(400).json({ error: "Name, email, and mobile are required" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    // Validate mobile format (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ error: "Mobile number must be 10 digits" });
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: req.user._id } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name,
        email: email.toLowerCase(),
        mobile
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    await AuditLog.create({ 
      userId: req.user._id,
      ip: req.ip,
      action: "update_profile_details",
      details: `User updated profile details: ${user.email}`
    });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New endpoint to get student-specific stats
export const getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with populated department
    const user = await User.findById(userId).populate('department', 'name');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get certificate stats for the student
    const certificateStats = await User.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "certificates",
          localField: "_id",
          foreignField: "userId",
          as: "certificates"
        }
      },
      { $unwind: { path: "$certificates", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          totalCertificates: { $sum: { $cond: [{ $ifNull: ["$certificates", false] }, 1, 0] } },
          approvedCertificates: { 
            $sum: { 
              $cond: [{ $and: [{ $ifNull: ["$certificates", false] }, { $eq: ["$certificates.status", "approved"] }] }, 1, 0] 
            } 
          },
          pendingCertificates: { 
            $sum: { 
              $cond: [{ $and: [{ $ifNull: ["$certificates", false] }, { $eq: ["$certificates.status", "pending"] }] }, 1, 0] 
            } 
          },
          rejectedCertificates: { 
            $sum: { 
              $cond: [{ $and: [{ $ifNull: ["$certificates", false] }, { $eq: ["$certificates.status", "rejected"] }] }, 1, 0] 
            } 
          },
          totalPoints: { $first: "$totalPoints" }
        }
      }
    ]);
    
    const stats = certificateStats[0] || {
      totalCertificates: 0,
      approvedCertificates: 0,
      pendingCertificates: 0,
      rejectedCertificates: 0,
      totalPoints: user.totalPoints || 0
    };
    
    res.json({ stats });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    res.status(500).json({ error: error.message });
  }
}