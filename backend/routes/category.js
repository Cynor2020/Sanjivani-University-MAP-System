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

// Admin routes
router.post("/", requireAuth, allowRoles("director_admin", "super_admin"), upsertCategory);
router.delete("/:id", requireAuth, allowRoles("director_admin", "super_admin"), deleteCategory);
router.patch("/:id/toggle", requireAuth, allowRoles("director_admin", "super_admin"), toggleCategoryStatus);

export default router;