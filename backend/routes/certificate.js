import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { upload } from "../middleware/multer.js";
import { 
  checkUploadStatus,
  uploadCertificate, 
  myCertificates, 
  pendingCertificates,
  approveCertificate, 
  rejectCertificate,
  getCertificateStats,
  approvedCertificates,
  deleteApprovedCertificate,
  getUserProgress
} from "../controllers/certificateController.js";

const router = Router();

// Student routes
router.get("/upload-status", requireAuth, allowRoles("student"), checkUploadStatus);
router.post("/upload", requireAuth, allowRoles("student"), upload.single('file'), uploadCertificate);
router.get("/mine", requireAuth, allowRoles("student"), myCertificates);

// Progress route - accessible to students and higher roles
router.get("/progress/:userId", requireAuth, getUserProgress);

// HOD routes
router.get("/pending", requireAuth, allowRoles("hod"), pendingCertificates);
router.post("/:certificateId/approve", requireAuth, allowRoles("hod"), approveCertificate);
router.post("/:certificateId/reject", requireAuth, allowRoles("hod"), rejectCertificate);

// Director routes
router.get("/stats", requireAuth, allowRoles("director"), getCertificateStats);
router.get("/approved", requireAuth, allowRoles("director"), approvedCertificates);
router.delete("/:certificateId", requireAuth, allowRoles("director"), deleteApprovedCertificate);

// Update pending certificates route to allow Directors
router.get("/pending", requireAuth, allowRoles("hod", "director"), pendingCertificates);

export default router;