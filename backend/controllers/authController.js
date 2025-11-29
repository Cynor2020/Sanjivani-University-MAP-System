import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

const issueCookie = (res, user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  const isProd = process.env.NODE_ENV === "production";
  const attrs = isProd ? "Secure; SameSite=None;" : "SameSite=None;";
  res.setHeader(
    "Set-Cookie",
    `token=${token}; HttpOnly; ${attrs} Path=/; Max-Age=${7 * 24 * 3600}`
  );
};

export const registerStudent = async (req, res) => {
  const { email, name, program, department, division, currentYear } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: "User exists" });
  const user = await User.create({ email, name, role: "student", program, department, division, currentYear });
  await AuditLog.create({ userId: user._id, username: user.name, role: user.role, ip: req.ip, action: "register", details: { email } });
  res.json({ ok: true });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  
  // Check if user has a password set
  if (!user.passwordHash) {
    return res.status(400).json({ 
      error: "Account not activated. Please contact administrator to set your password." 
    });
  }
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Invalid credentials" });
  issueCookie(res, user);
  user.lastLoginAt = new Date();
  await user.save();
  await AuditLog.create({ userId: user._id, username: user.name, role: user.role, ip: req.ip, action: "login" });
  res.json({ user: { id: user._id, name: user.name, role: user.role, email: user.email } });
};

export const setPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Not found" });
  const hash = await bcrypt.hash(password, 10);
  user.passwordHash = hash;
  await user.save();
  await AuditLog.create({ userId: user._id, username: user.name, role: user.role, ip: req.ip, action: "set_password" });
  res.json({ ok: true });
};

export const me = async (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id, name: u.name, role: u.role, email: u.email, department: u.department, division: u.division } });
};

export const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  const attrs = isProd ? "Secure; SameSite=None;" : "SameSite=None;";
  res.setHeader("Set-Cookie", `token=; HttpOnly; ${attrs} Path=/; Max-Age=0`);
  res.json({ ok: true });
};

export const impersonate = async (req, res) => {
  const target = await User.findById(req.body.userId);
  if (!target) return res.status(404).json({ error: "Not found" });
  issueCookie(res, target);
  await AuditLog.create({ userId: req.user._id, username: req.user.name, role: req.user.role, ip: req.ip, action: "impersonate", details: { target: target.email } });
  res.json({ ok: true });
};