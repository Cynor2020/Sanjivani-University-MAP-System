import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { uploadProfilePhoto } from "../middleware/multer.js";
import {
  createDirector,
  createHOD,
  getDirectors,
  getHODs,
  getDepartmentStudents,
  getAllStudents,
  getStudentPassword,
  deleteStudent,
  updateUser,
  deleteUser,
  setUserPassword,
  getUserPasswordStatus,
  updateUserPhoto
} from "../controllers/userController.js";

const router = Router();

// Super Admin: Create Directors & HODs
// IMPORTANT: Multer must come AFTER auth middleware but BEFORE controller
router.post(
  "/directors", 
  requireAuth, 
  allowRoles("super_admin"), 
  uploadProfilePhoto.single('profilePhoto'), 
  createDirector
);

router.post(
  "/hods", 
  requireAuth, 
  allowRoles("super_admin"), 
  uploadProfilePhoto.single('profilePhoto'), 
  createHOD
);

router.get("/directors", requireAuth, allowRoles("super_admin"), getDirectors);
router.get("/hods", requireAuth, allowRoles("super_admin"), getHODs);

// HOD: Department students
router.get("/department-students", requireAuth, allowRoles("hod"), getDepartmentStudents);
router.get("/student/:id/password", requireAuth, allowRoles("hod"), getStudentPassword);
router.delete("/student/:id", requireAuth, allowRoles("hod"), deleteStudent);
router.put("/student/:id", requireAuth, allowRoles("hod"), updateUser);
router.put("/student/:id/password", requireAuth, allowRoles("hod"), setUserPassword);

// Director: All students
router.get("/all-students", requireAuth, allowRoles("director"), getAllStudents);

// Update/Delete users
router.put("/:id", requireAuth, allowRoles("super_admin"), updateUser);
router.delete("/:id", requireAuth, allowRoles("super_admin"), deleteUser);

// Super Admin: Password management
router.put("/:id/password", requireAuth, allowRoles("super_admin"), setUserPassword);
router.get("/:id/password-status", requireAuth, allowRoles("super_admin"), getUserPasswordStatus);
router.put(
  "/:id/photo",
  requireAuth,
  allowRoles("super_admin"),
  uploadProfilePhoto.single('profilePhoto'),
  updateUserPhoto
);

export default router;
