import express from "express";

import {
   getTeacherProfile,
   updateTeacherProfile,
   getTeacherStudents,
   getTeacherStudentById,
   getTeacherDashboard,
} from "../controllers/teacherController.js";

import {
   protect,
} from "../middleware/authMiddleware.js";

import {
   authorizeRoles,
} from "../middleware/roleMiddleware.js";

const router =
   express.Router();

/*
=========================================================
PROFILE
=========================================================
*/

router.get(
   "/profile",
   protect,
   authorizeRoles("teacher"),
   getTeacherProfile
);

router.put(
   "/profile",
   protect,
   authorizeRoles("teacher"),
   updateTeacherProfile
);

/*
=========================================================
DASHBOARD
=========================================================
*/

router.get(
   "/dashboard",
   protect,
   authorizeRoles("teacher"),
   getTeacherDashboard
);

/*
=========================================================
STUDENTS
=========================================================
*/

router.get(
   "/students",
   protect,
   authorizeRoles("teacher"),
   getTeacherStudents
);

router.get(
   "/students/:id",
   protect,
   authorizeRoles("teacher"),
   getTeacherStudentById
);

export default router;