import { Router } from "express";
import { register, registerStudent, login, me, logout, updateMyPassword, updateMyPhoto } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadProfilePhoto } from "../middleware/multer.js";

const router = Router();

router.post("/register", uploadProfilePhoto.single('profilePhoto'), register); // Public route
router.post("/register-student", uploadProfilePhoto.single('profilePhoto'), registerStudent); // Public route for student registration
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);
router.put("/me/password", requireAuth, updateMyPassword);
router.put("/me/photo", requireAuth, uploadProfilePhoto.single('profilePhoto'), updateMyPhoto);

export default router;
