import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { toggleUploadStatus, getUploadStatus } from "../controllers/uploadLockController.js";

const router = Router();

router.post("/toggle", requireAuth, allowRoles("hod"), toggleUploadStatus);
router.get("/status", requireAuth, allowRoles("hod"), getUploadStatus);

export default router;

