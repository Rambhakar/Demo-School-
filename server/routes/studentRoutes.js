import express from "express";

import {
   getStudentProfile,
   getStudentById,
   getMyStudentInfo,
   getStudentDashboard,
} from "../controllers/studentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// STUDENT DASHBOARD
// =====================================================

router.get(
   "/dashboard",
   protect,
   authorizeRoles("student"),
   getStudentDashboard
);

// =====================================================
// STUDENT PROFILE
// =====================================================

router.get(
   "/profile",
   protect,
   authorizeRoles("student"),
   getStudentProfile
);

// =====================================================
// STUDENT BASIC INFO
// =====================================================

router.get(
   "/me",
   protect,
   authorizeRoles("student"),
   getMyStudentInfo
);

// =====================================================
// STUDENT BY ID
// =====================================================

router.get(
   "/:id",
   protect,
   authorizeRoles(
      "student",
      "teacher",
      "admin"
   ),
   getStudentById
);

export default router;