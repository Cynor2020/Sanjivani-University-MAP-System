import User from "../models/User.js";
import bcrypt from "bcrypt";
import AuditLog from "../models/AuditLog.js";
import Department from "../models/Department.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip || 'unknown';
};

// Super Admin: Create Director
export const createDirector = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - Please login first" });
    }
    
    // Check if user is super_admin
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden - Only Super Admin can create directors" });
    }
    
    const { name, email, password, mobile, whatsapp, address, designation } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: "Email already exists" });

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
          // Clean up temp file only if uploaded to Cloudinary
          if (req.file.path) {
            fs.unlinkSync(req.file.path);
          }
        } else {
          profilePhoto = `http://localhost:5000/uploads/${req.file.filename}`;
          // Do not delete local file when using local storage
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

    const director = await User.create({
      email: email.toLowerCase(),
      name,
      role: "director",
      mobile,
      whatsapp,
      address,
      profilePhoto,
      designation,
      passwordHash,
      status: "active"
    });

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Director created: ${name}`,
      userId: req.user._id
    });

    res.json({ ok: true, user: director });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({ error: error.message });
  }
};

// Super Admin: Create HOD
export const createHOD = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - Please login first" });
    }
    
    // Check if user is super_admin
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden - Only Super Admin can create HODs" });
    }
    
    const { name, email, password, mobile, whatsapp, address, designation, department } = req.body;
    
    console.log("Creating HOD with data:", { name, email, mobile, department }); // Debug log
    
    if (!name || !email || !password || !department) {
      return res.status(400).json({ error: "Name, email, password, and department are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log("Email already exists:", email); // Debug log
      return res.status(400).json({ error: "Email already exists" });
    }

    const dept = await Department.findById(department);
    if (!dept) {
      console.log("Department not found:", department); // Debug log
      return res.status(404).json({ error: "Department not found" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let profilePhoto = "";
    
    // Upload profile photo if provided
    if (req.file) {
      try {
        // Check if Cloudinary is properly configured
        if (process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET &&
            process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloudinary-cloud-name' &&
            process.env.CLOUDINARY_API_KEY !== 'your-cloudinary-api-key' &&
            process.env.CLOUDINARY_API_SECRET !== 'your-cloudinary-api-secret') {
          const uploaded = await cloudinary.uploader.upload(req.file.path, { 
            folder: "sanjivani-map/profiles" 
          });
          profilePhoto = uploaded.secure_url;
          // Clean up temp file only if uploaded to Cloudinary
          if (req.file.path) {
            fs.unlinkSync(req.file.path);
          }
        } else {
          // Fallback to local storage if Cloudinary is not properly configured
          profilePhoto = `http://localhost:5000/uploads/${req.file.filename}`;
          // Do not delete local file when using local storage
        }
      } catch (uploadError) {
        console.error("Error uploading profile photo:", uploadError);
        // Don't fail the HOD creation if profile photo upload fails
        profilePhoto = "";
        // Clean up temp file even if upload fails
        if (req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {}
        }
      }
    }

    const hod = await User.create({
      email: email.toLowerCase(),
      name,
      role: "hod",
      mobile,
      whatsapp,
      address,
      profilePhoto,
      designation,
      department,
      passwordHash,
      status: "active"
    });
    
    console.log("HOD created successfully:", hod._id, hod.name); // Debug log

    // Assign HOD to department
    dept.hod = hod._id;
    await dept.save();

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `HOD created: ${name} for ${dept.name}`,
      userId: req.user._id
    });

    res.json({ ok: true, user: hod });
  } catch (error) {
    console.error("Error creating HOD:", error); // Error log
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({ error: error.message });
  }
};

// Get Directors
export const getDirectors = async (req, res) => {
  try {
    const directors = await User.find({ role: "director", status: { $ne: "deleted" } })
      .select('-passwordHash')
      .sort({ name: 1 })
      .lean();
    res.json({ directors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get HODs
export const getHODs = async (req, res) => {
  try {
    const rawHods = await User.find({ role: "hod", status: { $ne: "deleted" } })
      .select('-passwordHash')
      .sort({ name: 1 })
      .lean();

    const hods = [];
    for (const h of rawHods) {
      let deptInfo = null;
      if (h.department && mongoose.Types.ObjectId.isValid(h.department)) {
        const d = await Department.findById(h.department).select('name').lean();
        if (d) {
          deptInfo = { _id: d._id, name: d.name };
        }
      }
      hods.push({ ...h, department: deptInfo });
    }

    res.json({ hods });
  } catch (error) {
    console.error("Error fetching HODs:", error);
    res.status(500).json({ error: error.message });
  }
};

// HOD: Get department students
export const getDepartmentStudents = async (req, res) => {
  try {
    const { year, academicYear, status, search, page = 1, limit = 50 } = req.query;
    
    const filter = { 
      role: "student", 
      department: req.user.department,
      status: { $ne: "deleted" }
    };

    if (year) filter.currentYear = year;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { prn: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const total = await User.countDocuments(filter);
    const students = await User.find(filter)
      .populate('department', 'name')
      .select('-passwordHash')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json({ 
      students,
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

// HOD: Get student password (plain text - stored in passwordHash but we'll show it)
export const getStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if HOD's department matches student's department
    if (req.user.role === "hod" && student.department.toString() !== req.user.department.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Note: In production, passwords should be hashed. This is for viewing only.
    // We return a message that password is set, but actual password cannot be retrieved from hash.
    res.json({ 
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        prn: student.prn,
        hasPassword: !!student.passwordHash
      },
      message: "Password is set. Cannot retrieve plain text password for security reasons."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HOD: Delete/Remove student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if HOD's department matches student's department
    if (req.user.role === "hod" && student.department.toString() !== req.user.department.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Soft delete
    student.status = "deleted";
    await student.save();

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Student removed: ${student.name} (${student.prn})`,
      userId: req.user._id
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    delete updates.passwordHash;
    delete updates.email;
    delete updates.role;

    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .select('-passwordHash');

    if (!user) return res.status(404).json({ error: "User not found" });

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `User updated: ${user.name}`,
      userId: req.user._id
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = "deleted";
    await user.save();

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `User deleted: ${user.name}`,
      userId: req.user._id
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Super Admin: Set user password
export const setUserPassword = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();
    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Password set by Super Admin: ${user.name}`,
      userId: req.user._id
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Super Admin: Get password status (no plaintext)
export const getUserPasswordStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    const user = await User.findById(id).select('passwordHash name role');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ hasPassword: !!user.passwordHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Super Admin: Update user profile photo
export const updateUserPhoto = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let profilePhoto = user.profilePhoto || "";

    if (req.file) {
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
          // Keep local file
        }
      } catch (uploadError) {
        // Fallback to local if Cloudinary failed
        profilePhoto = `http://localhost:5000/uploads/${req.file.filename}`;
        // Do not delete local file
      }
    } else {
      return res.status(400).json({ error: "No photo provided" });
    }

    user.profilePhoto = profilePhoto;
    await user.save();

    await AuditLog.create({ 
      ip: getClientIP(req), 
      action: `Profile photo updated: ${user.name}`,
      userId: req.user._id
    });

    const safeUser = await User.findById(id).select('-passwordHash').lean();
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
