import { Router } from "express";
import { register, registerStudent, login, me, getMyDepartmentYears, logout, updateMyPassword, updateMyPhoto, updateMyProfile, getMyStats } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadProfilePhoto } from "../middleware/multer.js";

const router = Router();

router.post("/register", uploadProfilePhoto.single('profilePhoto'), register); // Public route
router.post("/register-student", uploadProfilePhoto.single('profilePhoto'), registerStudent); // Public route for student registration
router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/me/department-years", requireAuth, getMyDepartmentYears);
router.get("/me/stats", requireAuth, getMyStats); // New endpoint for student stats
router.post("/logout", requireAuth, logout);
router.put("/me/password", requireAuth, updateMyPassword);
router.put("/me/photo", requireAuth, uploadProfilePhoto.single('profilePhoto'), updateMyPhoto);
router.put("/me/profile", requireAuth, updateMyProfile);

export default router;