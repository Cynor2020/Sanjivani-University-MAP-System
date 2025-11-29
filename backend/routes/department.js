import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  assignHOD
} from "../controllers/departmentController.js";

const router = Router();

// Department management routes (super admin only)
router.post("/", requireAuth, allowRoles("super_admin"), createDepartment);
router.get("/", requireAuth, allowRoles("super_admin"), getDepartments);
router.get("/:id", requireAuth, allowRoles("super_admin"), getDepartmentById);
router.put("/:id", requireAuth, allowRoles("super_admin"), updateDepartment);
router.delete("/:id", requireAuth, allowRoles("super_admin"), deleteDepartment);
router.patch("/:id/assign-hod", requireAuth, allowRoles("super_admin"), assignHOD);

export default router;