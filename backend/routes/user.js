import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  setPassword,
  getStudentPasswords,
  getDepartmentStats,
  getUniversityStats
} from "../controllers/userController.js";

const router = Router();

// User management routes
router.post("/", requireAuth, allowRoles("super_admin", "director_admin", "hod"), createUser);
router.get("/", requireAuth, allowRoles("super_admin", "director_admin", "hod"), getUsers);
router.get("/:id", requireAuth, allowRoles("super_admin", "director_admin", "hod"), getUserById);
router.put("/:id", requireAuth, allowRoles("super_admin", "director_admin", "hod"), updateUser);
router.delete("/:id", requireAuth, allowRoles("super_admin", "director_admin", "hod"), deleteUser);

// Password management
router.post("/set-password", requireAuth, allowRoles("super_admin", "director_admin", "hod"), setPassword);
router.put("/:id/password", requireAuth, allowRoles("super_admin", "director_admin", "hod"), setPassword);

// Student password access (for mentors)
router.get("/student-passwords", requireAuth, allowRoles("mentor", "hod"), getStudentPasswords);

// Statistics
router.get("/department-stats", requireAuth, allowRoles("hod", "director_admin", "super_admin"), getDepartmentStats);
router.get("/university-stats", requireAuth, allowRoles("director_admin", "super_admin"), getUniversityStats);

export default router;