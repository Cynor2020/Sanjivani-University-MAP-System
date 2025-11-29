import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { 
  listCategories, 
  getCategoryById, 
  upsertCategory, 
  deleteCategory, 
  toggleCategoryStatus 
} from "../controllers/categoryController.js";

const router = Router();

// Public routes
router.get("/", requireAuth, listCategories);
router.get("/:id", requireAuth, getCategoryById);

// Admin routes - Super Admin only
router.post("/", requireAuth, allowRoles("super_admin"), upsertCategory);
router.delete("/:id", requireAuth, allowRoles("super_admin"), deleteCategory);
router.patch("/:id/toggle", requireAuth, allowRoles("super_admin"), toggleCategoryStatus);

export default router;