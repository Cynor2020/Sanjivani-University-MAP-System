import multer from "multer";
import path from "path";

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'), false);
  }
};

// Create multer instance
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Keep the old validation for backward compatibility
export const validateBase64File = (req, res, next) => {
  const f = req.body?.file || "";
  if (!f.startsWith("data:")) return res.status(400).json({ error: "Invalid file" });
  const meta = f.slice(5, f.indexOf(","));
  const mime = meta.split(";")[0];
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowed.includes(mime)) return res.status(400).json({ error: "Unsupported type" });
  next();
};