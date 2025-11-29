import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { setDeadline, getDeadline, getAllDeadlines, deleteDeadline, checkDeadlineStatus } from "../controllers/deadlineController.js";

const router = Router();

// HOD routes
router.post("/", requireAuth, allowRoles("hod", "director_admin"), setDeadline);
router.delete("/:id", requireAuth, allowRoles("hod", "director_admin", "super_admin"), deleteDeadline);

// Public routes for students
router.get("/", requireAuth, getDeadline);
router.get("/all", requireAuth, allowRoles("hod", "director_admin", "super_admin"), getAllDeadlines);
router.get("/status", requireAuth, allowRoles("student"), checkDeadlineStatus);

export default router;