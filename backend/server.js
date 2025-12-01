import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import certificateRoutes from "./routes/certificate.js";
import academicYearRoutes from "./routes/academicYear.js";
import categoryRoutes from "./routes/category.js";
import uploadLockRoutes from "./routes/uploadLock.js";
import auditRoutes from "./routes/audit.js";
import reportRoutes from "./routes/report.js";
import departmentRoutes from "./routes/department.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// CORS Middleware - MUST be before other middleware
app.use((req, res, next) => {
  const envOrigins = process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : [];
  const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", ...envOrigins];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (envOrigins.length > 0) {
    res.setHeader("Access-Control-Allow-Origin", envOrigins[0]);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  }
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
  res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "Sanjivani MAP", by: "CYNOR Team SET" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/academic-year", academicYearRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload-lock", uploadLockRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/departments", departmentRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${port}`);
  console.log(`📝 Developed by CYNOR Team SET`);
  console.log(`🔗 CORS enabled for: http://localhost:5173, http://localhost:5174`);
});
