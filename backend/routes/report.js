import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { 
  departmentAnalytics,
  exportDepartmentAnalytics,
  departmentReport,
  exportDepartmentReport,
  detailedAnalytics,
  exportDetailedAnalytics,
  getLatestApprovedCertificates
} from "../controllers/reportController.js";

const router = Router();

// HOD: Department analytics
router.get("/department-analytics", requireAuth, allowRoles("hod"), departmentAnalytics);

// HOD: Export department analytics to Excel
router.get("/department-analytics/export", requireAuth, allowRoles("hod"), exportDepartmentAnalytics);

// HOD: Department report
router.get("/department", requireAuth, allowRoles("hod"), departmentReport);

// HOD: Export department report to CSV
router.get("/department/export", requireAuth, allowRoles("hod"), exportDepartmentReport);



// Super Admin: Detailed Analytics
router.get("/detailed-analytics", requireAuth, allowRoles("super_admin"), detailedAnalytics);

// Super Admin: Get latest approved certificates
router.get("/latest-approved", requireAuth, allowRoles("super_admin"), getLatestApprovedCertificates);

// Super Admin: Export Detailed Analytics to CSV
router.get("/detailed-analytics/export", requireAuth, allowRoles("super_admin"), exportDetailedAnalytics);

export default router;