import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { upload } from "../middleware/multer.js";
import { 
  uploadCertificate, 
  myCertificates, 
  pendingCertificatesMentor, 
  pendingCertificatesHOD,
  approveCertificate, 
  rejectCertificate,
  getCertificateById,
  deleteCertificate,
  getUserProgress
} from "../controllers/certificateController.js";

const router = Router();

// Student routes
router.post("/upload", requireAuth, allowRoles("student"), upload.single('file'), uploadCertificate);
router.get("/mine", requireAuth, allowRoles("student"), myCertificates);
router.delete("/:id", requireAuth, allowRoles("student", "super_admin", "director_admin", "hod"), deleteCertificate);

// Mentor routes
router.get("/pending/mentor", requireAuth, allowRoles("mentor"), pendingCertificatesMentor);
router.post("/approve", requireAuth, allowRoles("mentor", "hod"), approveCertificate);
router.post("/reject", requireAuth, allowRoles("mentor", "hod"), rejectCertificate);

// HOD routes
router.get("/pending/hod", requireAuth, allowRoles("hod"), pendingCertificatesHOD);

// Admin routes
router.get("/:id", requireAuth, allowRoles("student", "mentor", "hod", "director_admin", "super_admin"), getCertificateById);

// Progress tracking
router.get("/progress/:userId", requireAuth, allowRoles("student", "mentor", "hod", "director_admin", "super_admin"), getUserProgress);

export default router;