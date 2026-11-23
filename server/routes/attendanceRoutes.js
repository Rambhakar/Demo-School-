import express from "express";

import {
   getClassAttendance,
   markAttendance,
   getMyAttendance,
   getMyAttendanceSummary,
} from "../controllers/attendanceController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Teacher and Admin
router.get(
   "/class",
   protect,
   authorizeRoles("teacher", "admin"),
   getClassAttendance
);

router.post(
   "/",
   protect,
   authorizeRoles("teacher", "admin"),
   markAttendance
);

// Student
router.get(
   "/my",
   protect,
   authorizeRoles("student"),
   getMyAttendance
);

router.get(
   "/my/summary",
   protect,
   authorizeRoles("student"),
   getMyAttendanceSummary
);

export default router;