
import express from "express";

import {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission,
} from "../controllers/admissionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public admission submission
router.post("/", createAdmission);

// Admin-only routes
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAdmissions
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getAdmissionById
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateAdmissionStatus
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteAdmission
);

export default router;
