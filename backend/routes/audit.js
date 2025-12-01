import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { listAuditLogs, deleteAuditLog } from "../controllers/auditController.js";

const router = Router();

router.get("/", requireAuth, allowRoles("super_admin"), listAuditLogs);
router.delete("/:id", requireAuth, allowRoles("super_admin"), deleteAuditLog);

export default router;
