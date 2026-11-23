
import express from "express";

import {
   getTeacherResults,
   saveBulkResults,
   getStudentResults,
} from "../controllers/resultController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin and teacher can view results
router.get(
   "/",
   protect,
   authorizeRoles("admin", "teacher"),
   getTeacherResults
);

// Admin and teacher can save results
router.post(
   "/bulk",
   protect,
   authorizeRoles("admin", "teacher"),
   saveBulkResults
);

// Admin, teacher and student can view student results
router.get(
   "/student/:studentId",
   protect,
   authorizeRoles("admin", "teacher", "student"),
   getStudentResults
);

export default router;
