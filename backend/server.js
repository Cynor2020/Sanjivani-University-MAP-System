import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import certificateRoutes from "./routes/certificate.js";
import academicYearRoutes from "./routes/academicYear.js";
import categoryRoutes from "./routes/category.js";
import deadlineRoutes from "./routes/deadline.js";
import auditRoutes from "./routes/audit.js";
import reportRoutes from "./routes/report.js";
import path from "path";
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware to parse JSON and handle CORS
app.use((req, res, next) => {
  // Parse allowed origins from environment variable
  const envOrigins = process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : [];
  const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", ...envOrigins];
  const origin = req.headers.origin || "*";
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (envOrigins.length > 0) {
    // Fallback to first configured origin
    res.setHeader("Access-Control-Allow-Origin", envOrigins[0]);
  } else {
    // Default fallback
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5174");
  }
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cookie parsing middleware
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const i = c.indexOf("=");
      if (i === -1) return ["", ""];
      const k = c.slice(0, i).trim();
      const v = decodeURIComponent(c.slice(i + 1));
      return [k, v];
    })
  );
  req.parsedCookies = cookies;
  next();
});

// Connect to database
connectDB();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "Sanjivani MAP", by: "CYNOR SET Team" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/academic-year", academicYearRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/reports", reportRoutes);

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
  console.log(`Backend running on port ${port}`);
});