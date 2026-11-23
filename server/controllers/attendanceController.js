
import mongoose from "mongoose";

import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Attendance from "../models/Attendance.js";

// ======================================================
// HELPERS
// ======================================================

const isValidDate = (value) => {
   if (typeof value !== "string") return false;

   if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
   }

   const date = new Date(`${value}T00:00:00.000Z`);

   return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
   );
};

const getStartOfDay = (dateString) =>
   new Date(`${dateString}T00:00:00.000Z`);

const getNextDay = (dateString) => {
   const date = getStartOfDay(dateString);
   date.setUTCDate(date.getUTCDate() + 1);
   return date;
};

const allowedStatuses = ["present", "absent", "late"];

const isAll = (value) =>
   !value || String(value).trim().toLowerCase() === "all";

const getError = (error) => ({
   success: false,
   message: "Attendance operation failed.",
   ...(process.env.NODE_ENV === "development"
      ? { error: error.message }
      : {}),
});

// ======================================================
// TEACHER ASSIGNMENT ACCESS
// Admin: All students
// Teacher: Only assigned classes and sections
// ======================================================

const getAttendanceAccess = async (req) => {
   // Admin has access to all classes.
   if (req.user?.role === "admin") {
      return {
         allowed: true,
         studentFilter: null,
      };
   }

   // Only admin and teacher can use class attendance APIs.
   if (req.user?.role !== "teacher") {
      return {
         allowed: false,
         status: 403,
         message: "You are not allowed to access class attendance.",
      };
   }

   const teacher = await Teacher.findOne({
      user: req.user._id,
      isActive: true,
   }).lean();

   if (!teacher) {
      return {
         allowed: false,
         status: 403,
         message: "Active teacher profile not found.",
      };
   }

   const assignments = (teacher.teachingAssignments || []).filter(
      (item) => item.isActive !== false
   );

   // No assignment means no student access.
   if (!assignments.length) {
      return {
         allowed: true,
         studentFilter: {
            _id: { $exists: false },
         },
      };
   }

   const assignmentConditions = assignments.map((item) => {
      const condition = {
         className: item.className,
         academicYear: item.academicYear,
      };

      const sections = (item.sections || [])
         .map((section) => String(section).trim().toUpperCase())
         .filter(Boolean);

      // Empty sections means all sections of the assigned class.
      if (sections.length) {
         condition.section = { $in: sections };
      }

      return condition;
   });

   return {
      allowed: true,
      studentFilter: {
         $or: assignmentConditions,
      },
   };
};

// ======================================================
// 1. GET CLASS / ALL STUDENTS ATTENDANCE
// GET /api/attendance/class
// ======================================================

export const getClassAttendance = async (req, res) => {
   try {
      const { className, section, date } = req.query;

      if (!date || !isValidDate(date)) {
         return res.status(400).json({
            success: false,
            message: "Valid date is required (YYYY-MM-DD).",
         });
      }

      const access = await getAttendanceAccess(req);

      if (!access.allowed) {
         return res.status(access.status).json({
            success: false,
            message: access.message,
         });
      }

      const conditions = [
         { isActive: { $ne: false } },
      ];

      if (access.studentFilter) {
         conditions.push(access.studentFilter);
      }

      if (!isAll(className)) {
         conditions.push({
            className: String(className).trim(),
         });
      }

      if (!isAll(section)) {
         conditions.push({
            section: String(section).trim().toUpperCase(),
         });
      }

      const students = await Student.find({
         $and: conditions,
      })
         .select(
            "user studentId name fatherName motherName className academicYear section rollNumber phone email isActive"
         )
         .sort({
            className: 1,
            section: 1,
            rollNumber: 1,
            name: 1,
         })
         .lean();

      const startDate = getStartOfDay(date);
      const endDate = getNextDay(date);

      const studentIds = students.map((student) => student._id);

      const attendanceRecords = studentIds.length
         ? await Attendance.find({
            student: { $in: studentIds },
            date: {
               $gte: startDate,
               $lt: endDate,
            },
         }).lean()
         : [];

      const attendanceMap = new Map();

      attendanceRecords.forEach((record) => {
         attendanceMap.set(record.student.toString(), record);
      });

      const result = students.map((student) => ({
         student,
         attendance:
            attendanceMap.get(student._id.toString()) || null,
      }));

      const present = result.filter(
         (item) => item.attendance?.status === "present"
      ).length;

      const absent = result.filter(
         (item) => item.attendance?.status === "absent"
      ).length;

      const late = result.filter(
         (item) => item.attendance?.status === "late"
      ).length;

      const total = students.length;
      const notMarked = total - present - absent - late;

      const classes = [
         ...new Set(
            students.map((student) => student.className).filter(Boolean)
         ),
      ];

      const sections = [
         ...new Set(
            students.map((student) => student.section).filter(Boolean)
         ),
      ];

      return res.status(200).json({
         success: true,
         date,
         className: className || "All",
         section: section || "All",
         classes,
         sections,
         summary: {
            total,
            present,
            absent,
            late,
            notMarked,
         },
         students: result,
      });
   } catch (error) {
      console.error("getClassAttendance:", error);
      return res.status(500).json(getError(error));
   }
};

// ======================================================
// 2. MARK / UPDATE BULK ATTENDANCE
// POST /api/attendance
// ======================================================

export const markAttendance = async (req, res) => {
   try {
      const {
         date,
         attendance,
         className,
         section,
      } = req.body;

      if (!date || !isValidDate(date)) {
         return res.status(400).json({
            success: false,
            message: "Valid attendance date is required (YYYY-MM-DD).",
         });
      }

      if (!Array.isArray(attendance) || !attendance.length) {
         return res.status(400).json({
            success: false,
            message: "Attendance data is required.",
         });
      }

      if (!req.user?._id) {
         return res.status(401).json({
            success: false,
            message: "Authenticated user not found.",
         });
      }

      if (
         (className && !section) ||
         (!className && section)
      ) {
         return res.status(400).json({
            success: false,
            message: "Class and section must be supplied together.",
         });
      }

      const access = await getAttendanceAccess(req);

      if (!access.allowed) {
         return res.status(access.status).json({
            success: false,
            message: access.message,
         });
      }

      // Validate and remove duplicate entries.
      const uniqueAttendance = new Map();

      for (const item of attendance) {
         if (!item?.studentId) {
            return res.status(400).json({
               success: false,
               message: "Every attendance entry needs a studentId.",
            });
         }

         const studentId = String(item.studentId).trim();

         if (!allowedStatuses.includes(item.status)) {
            return res.status(400).json({
               success: false,
               message: `Invalid attendance status for student ${studentId}.`,
            });
         }

         if (
            item.remarks !== undefined &&
            typeof item.remarks !== "string"
         ) {
            return res.status(400).json({
               success: false,
               message: "Remarks must be text.",
            });
         }

         uniqueAttendance.set(studentId, {
            studentId,
            status: item.status,
            remarks: (item.remarks || "").trim(),
         });
      }

      const entries = [...uniqueAttendance.values()];
      const requestedIds = entries.map((item) => item.studentId);

      const mongoIds = requestedIds.filter((id) =>
         mongoose.Types.ObjectId.isValid(id)
      );

      const normalStudentIds = requestedIds.filter(
         (id) => !mongoose.Types.ObjectId.isValid(id)
      );

      const orConditions = [];

      if (mongoIds.length) {
         orConditions.push({
            _id: { $in: mongoIds },
         });
      }

      if (normalStudentIds.length) {
         orConditions.push({
            studentId: { $in: normalStudentIds },
         });
      }

      if (!orConditions.length) {
         return res.status(400).json({
            success: false,
            message: "No valid student IDs were provided.",
         });
      }

      const studentConditions = [
         { isActive: { $ne: false } },
         { $or: orConditions },
      ];

      // Apply teacher assignment restrictions.
      if (access.studentFilter) {
         studentConditions.push(access.studentFilter);
      }

      // Optional selected class and section.
      if (!isAll(className)) {
         studentConditions.push({
            className: String(className).trim(),
         });
      }

      if (!isAll(section)) {
         studentConditions.push({
            section: String(section).trim().toUpperCase(),
         });
      }

      const students = await Student.find({
         $and: studentConditions,
      })
         .select("_id studentId className academicYear section")
         .lean();

      const studentMap = new Map();

      students.forEach((student) => {
         studentMap.set(student._id.toString(), student);

         if (student.studentId) {
            studentMap.set(String(student.studentId), student);
         }
      });

      const unresolved = requestedIds.filter(
         (id) => !studentMap.has(id)
      );

      // Reject the complete request if even one student is unauthorized.
      if (unresolved.length) {
         return res.status(403).json({
            success: false,
            message:
               "Some students were not found, are inactive, or are not assigned to you, or do not match the selected class and section.",
            invalidStudents: unresolved,
         });
      }

      const selectedDate = getStartOfDay(date);
      const savedRecords = [];

      for (const item of entries) {
         const student = studentMap.get(item.studentId);

         const record = await Attendance.findOneAndUpdate(
            {
               student: student._id,
               date: selectedDate,
            },
            {
               $set: {
                  status: item.status,
                  remarks: item.remarks,
                  markedBy: req.user._id,
               },
               $setOnInsert: {
                  student: student._id,
                  date: selectedDate,
               },
            },
            {
               new: true,
               upsert: true,
               runValidators: true,
               setDefaultsOnInsert: true,
            }
         );

         savedRecords.push(record);
      }

      return res.status(200).json({
         success: true,
         message: "Attendance successfully saved.",
         count: savedRecords.length,
         attendance: savedRecords,
      });
   } catch (error) {
      console.error("markAttendance:", error);

      if (error.code === 11000) {
         return res.status(409).json({
            success: false,
            message:
               "Attendance was updated by another request. Please refresh and try again.",
         });
      }

      return res.status(500).json(getError(error));
   }
};

// ======================================================
// 3. GET MY ATTENDANCE
// GET /api/attendance/my
// ======================================================

export const getMyAttendance = async (req, res) => {
   try {
      const student = await Student.findOne({
         user: req.user._id,
         isActive: { $ne: false },
      }).lean();

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student profile nahi mila.",
         });
      }

      const { month, year } = req.query;

      const query = {
         student: student._id,
      };

      if (month !== undefined || year !== undefined) {
         const numericMonth = Number(month);
         const numericYear = Number(year);

         if (
            !Number.isInteger(numericMonth) ||
            numericMonth < 1 ||
            numericMonth > 12 ||
            !Number.isInteger(numericYear) ||
            numericYear < 2000 ||
            numericYear > 2100
         ) {
            return res.status(400).json({
               success: false,
               message: "Valid month and year are required.",
            });
         }

         query.date = {
            $gte: new Date(
               Date.UTC(numericYear, numericMonth - 1, 1)
            ),
            $lt: new Date(
               Date.UTC(numericYear, numericMonth, 1)
            ),
         };
      }

      const records = await Attendance.find(query)
         .sort({ date: -1 })
         .lean();

      const total = records.length;

      const present = records.filter(
         (record) => record.status === "present"
      ).length;

      const absent = records.filter(
         (record) => record.status === "absent"
      ).length;

      const late = records.filter(
         (record) => record.status === "late"
      ).length;

      const percentage =
         total > 0
            ? Number((((present + late) / total) * 100).toFixed(2))
            : 0;

      return res.status(200).json({
         success: true,
         student: {
            _id: student._id,
            studentId: student.studentId,
            name: student.name,
            className: student.className,
            section: student.section,
            rollNumber: student.rollNumber,
         },
         summary: {
            total,
            present,
            absent,
            late,
            percentage,
         },
         attendance: records,
      });
   } catch (error) {
      console.error("getMyAttendance:", error);
      return res.status(500).json(getError(error));
   }
};

// ======================================================
// 4. GET MY ATTENDANCE SUMMARY
// GET /api/attendance/my/summary
// ======================================================

export const getMyAttendanceSummary = async (req, res) => {
   try {
      const student = await Student.findOne({
         user: req.user._id,
         isActive: { $ne: false },
      }).lean();

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student profile nahi mila.",
         });
      }

      const records = await Attendance.find({
         student: student._id,
      })
         .sort({ date: -1 })
         .lean();

      const total = records.length;

      const present = records.filter(
         (record) => record.status === "present"
      ).length;

      const absent = records.filter(
         (record) => record.status === "absent"
      ).length;

      const late = records.filter(
         (record) => record.status === "late"
      ).length;

      const percentage =
         total > 0
            ? Number((((present + late) / total) * 100).toFixed(2))
            : 0;

      return res.status(200).json({
         success: true,
         student: {
            _id: student._id,
            studentId: student.studentId,
            name: student.name,
            className: student.className,
            section: student.section,
            rollNumber: student.rollNumber,
         },
         summary: {
            total,
            present,
            absent,
            late,
            percentage,
         },
      });
   } catch (error) {
      console.error("getMyAttendanceSummary:", error);
      return res.status(500).json(getError(error));
   }
};
