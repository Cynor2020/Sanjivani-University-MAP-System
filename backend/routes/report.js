import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { 
  departmentAnalytics,
  generateExcellenceAwards
} from "../controllers/reportController.js";

const router = Router();

// HOD: Department analytics
router.get("/department-analytics", requireAuth, allowRoles("hod"), departmentAnalytics);

// Super Admin: Excellence Awards
router.get("/excellence-awards", requireAuth, allowRoles("super_admin"), generateExcellenceAwards);

export default router;
