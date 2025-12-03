import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleCheck.js";
import {
  createAdvertisement,
  getActiveAdvertisement,
  getAllAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  toggleAdvertisementStatus,
  deleteAdvertisement,
} from "../controllers/advertisementController.js";

const router = Router();

// Student: Get active advertisement
router.get("/active", requireAuth, allowRoles("student"), getActiveAdvertisement);

// Director/Super Admin: Get all advertisements
router.get("/", requireAuth, allowRoles("director", "super_admin"), getAllAdvertisements);

// Director/Super Admin: Get single advertisement
router.get("/:id", requireAuth, allowRoles("director", "super_admin"), getAdvertisementById);

// Director/Super Admin: Create advertisement
router.post("/", requireAuth, allowRoles("director", "super_admin"), createAdvertisement);

// Director/Super Admin: Update advertisement
router.put("/:id", requireAuth, allowRoles("director", "super_admin"), updateAdvertisement);

// Director/Super Admin: Toggle advertisement status
router.patch("/:id/toggle", requireAuth, allowRoles("director", "super_admin"), toggleAdvertisementStatus);

// Director/Super Admin: Delete advertisement
router.delete("/:id", requireAuth, allowRoles("director", "super_admin"), deleteAdvertisement);

export default router;
