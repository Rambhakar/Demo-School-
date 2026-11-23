
import express from "express";

import {
   createSubject,
   getAllSubjects,
   getTeachersForSubject,
   updateSubject,
   deleteSubject,
   assignSubjectsToStudent,
   getMySubjects,
   getStudentSubjects,
} from "../controllers/subjectController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// ADMIN
// =====================================================

// Get all subjects
router.get(
   "/",
   protect,
   authorizeRoles("admin"),
   getAllSubjects
);

// Get teachers
router.get(
   "/teachers",
   protect,
   authorizeRoles("admin"),
   getTeachersForSubject
);

// Create subject
router.post(
   "/",
   protect,
   authorizeRoles("admin"),
   createSubject
);

// IMPORTANT: Static routes must come before /:id

// Assign subjects to student
router.put(
   "/assign",
   protect,
   authorizeRoles("admin"),
   assignSubjectsToStudent
);

// Get one student's subjects
router.get(
   "/student/:studentId",
   protect,
   authorizeRoles("admin"),
   getStudentSubjects
);

// Update subject
router.put(
   "/:id",
   protect,
   authorizeRoles("admin"),
   updateSubject
);

// Delete subject
router.delete(
   "/:id",
   protect,
   authorizeRoles("admin"),
   deleteSubject
);

// =====================================================
// STUDENT
// =====================================================

// Get logged-in student's subjects
router.get(
   "/my",
   protect,
   authorizeRoles("student"),
   getMySubjects
);

export default router;
