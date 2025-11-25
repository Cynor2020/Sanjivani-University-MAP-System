import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { listAuditLogs, deleteAuditLog, deleteAllAuditLogs, getAuditStats } from "../controllers/auditController.js";

const router = Router();

router.get("/", requireAuth, allowRoles("director_admin", "super_admin"), listAuditLogs);
router.delete("/:id", requireAuth, allowRoles("super_admin"), deleteAuditLog);
router.delete("/", requireAuth, allowRoles("super_admin"), deleteAllAuditLogs);
router.get("/stats", requireAuth, allowRoles("super_admin"), getAuditStats);

export default router;