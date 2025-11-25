import { Router } from "express";
import { registerStudent, login, setPassword, me, logout, impersonate } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";

const router = Router();

router.post("/register", registerStudent);
router.post("/login", login);
router.post("/set-password", setPassword);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);
router.post("/impersonate", requireAuth, allowRoles("super_admin"), impersonate);

export default router;