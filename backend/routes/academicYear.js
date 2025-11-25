import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { startNewAcademicYear, getCurrentAcademicYear, getAllAcademicYears, getAcademicYearStats } from "../controllers/academicYearController.js";

const router = Router();

router.post("/start", requireAuth, allowRoles("super_admin"), startNewAcademicYear);
router.get("/current", requireAuth, getCurrentAcademicYear);
router.get("/all", requireAuth, allowRoles("super_admin"), getAllAcademicYears);
router.get("/stats", requireAuth, allowRoles("super_admin"), getAcademicYearStats);

export default router;