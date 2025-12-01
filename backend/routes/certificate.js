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
  rejectCertificate
} from "../controllers/certificateController.js";

const router = Router();

// Student routes
router.get("/upload-status", requireAuth, allowRoles("student"), checkUploadStatus);
router.post("/upload", requireAuth, allowRoles("student"), upload.single('file'), uploadCertificate);
router.get("/mine", requireAuth, allowRoles("student"), myCertificates);

// HOD routes
router.get("/pending", requireAuth, allowRoles("hod"), pendingCertificates);
router.post("/:certificateId/approve", requireAuth, allowRoles("hod"), approveCertificate);
router.post("/:certificateId/reject", requireAuth, allowRoles("hod"), rejectCertificate);

export default router;
