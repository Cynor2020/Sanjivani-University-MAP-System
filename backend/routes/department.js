import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment
} from "../controllers/departmentController.js";

const router = Router();

// Public route for registration
router.get("/", getDepartments);

// Protected routes - Super Admin only
router.post("/", requireAuth, allowRoles("super_admin"), createDepartment);
router.put("/:id", requireAuth, allowRoles("super_admin"), updateDepartment);
router.delete("/:id", requireAuth, allowRoles("super_admin"), deleteDepartment);

export default router;
