
import express from "express";

import {
   createStudent,
   createTeacher,
   getStudents,
   getTeachers,
   updateStudent,
   updateTeacher,
   deleteStudent,
   deleteTeacher,
   resetUserPassword,
   toggleUserStatus,
   assignTeacherClasses,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// =====================================================
// ADMIN PROTECTION
// =====================================================

router.use(protect);
router.use(authorizeRoles("admin"));

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get("/dashboard", (req, res) => {
   res.status(200).json({
      success: true,
      message: "Admin dashboard API working",
      admin: req.user,
   });
});

// =====================================================
// STUDENTS
// =====================================================

router.post("/students", createStudent);

router.get("/students", getStudents);

router.put("/students/:id", updateStudent);

router.delete("/students/:id", deleteStudent);

// =====================================================
// TEACHERS
// =====================================================

router.post("/teachers", createTeacher);

router.get("/teachers", getTeachers);

router.put("/teachers/:id", updateTeacher);

// ASSIGN CLASSES / SECTIONS / ACADEMIC YEAR
router.put(
   "/teachers/:id/assignments",
   assignTeacherClasses
);

router.delete("/teachers/:id", deleteTeacher);

// =====================================================
// PASSWORD RESET
// =====================================================

router.patch(
   "/users/:userId/password",
   resetUserPassword
);

// =====================================================
// ACTIVATE / DEACTIVATE USER
// =====================================================

router.patch(
   "/users/:userId/status",
   toggleUserStatus
);

export default router;
