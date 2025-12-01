import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import { 
  listCategories, 
  getCategoryById, 
  createCategory, 
  getAllCategories, 
  updateCategory, 
  deleteCategory 
} from "../controllers/categoryController.js";

const router = Router();

// Public routes
router.get("/", listCategories); // Public for registration

// Super Admin routes (must be defined before :id route to avoid conflicts)
router.post("/", requireAuth, allowRoles("super_admin"), createCategory);
router.get("/all", requireAuth, allowRoles("super_admin"), getAllCategories);
router.put("/:id", requireAuth, allowRoles("super_admin"), updateCategory);
router.delete("/:id", requireAuth, allowRoles("super_admin"), deleteCategory);

// Public route for getting category by ID (must be last to avoid conflicts)
router.get("/:id", getCategoryById);

export default router;