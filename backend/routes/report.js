import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { 
  universitySummary, 
  departmentReport, 
  performanceVsStrength, 
  topWeakBranches, 
  studentLeaderboard,
  exportDepartmentCSV,
  exportUniversityCSV,
  generateExcellenceAwards
} from "../controllers/reportController.js";

const router = Router();

// Summary reports
router.get("/university", requireAuth, allowRoles("director_admin", "super_admin"), universitySummary);
router.get("/performance-vs-strength", requireAuth, allowRoles("director_admin", "super_admin"), performanceVsStrength);
router.get("/top-weak-branches", requireAuth, allowRoles("director_admin", "super_admin"), topWeakBranches);

// Department reports
router.get("/department", requireAuth, allowRoles("hod", "director_admin", "super_admin"), departmentReport);
router.get("/department/export", requireAuth, allowRoles("hod", "director_admin", "super_admin"), exportDepartmentCSV);

// Student reports
router.get("/leaderboard", requireAuth, allowRoles("hod", "director_admin", "super_admin"), studentLeaderboard);

// University reports
router.get("/university/export", requireAuth, allowRoles("director_admin", "super_admin"), exportUniversityCSV);

// Excellence awards
router.get("/excellence-awards", requireAuth, allowRoles("super_admin"), generateExcellenceAwards);

export default router;