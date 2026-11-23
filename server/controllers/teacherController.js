
import mongoose from "mongoose";

import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// ======================================================
// COMMON HELPERS
// ======================================================

const getLoggedInTeacher = async (req) => {
   return Teacher.findOne({
      user: req.user._id,
      isActive: true,
   });
};

// Build a secure filter from the teacher's active assignments.
const getAssignedStudentFilter = (teacher) => {
   const assignments = (teacher?.teachingAssignments || []).filter(
      (item) => item.isActive !== false
   );

   // No assignments means no student access.
   if (!assignments.length) {
      return { _id: { $exists: false } };
   }

   return {
      $or: assignments.map((item) => {
         const condition = {
            className: item.className,
            academicYear: item.academicYear,
         };

         const sections = (item.sections || [])
            .map((section) => String(section).trim().toUpperCase())
            .filter(Boolean);

         // Empty sections means all sections of this class.
         if (sections.length) {
            condition.section = { $in: sections };
         }

         return condition;
      }),
   };
};

// ======================================================
// GET TEACHER PROFILE
// GET /api/teacher/profile
// ======================================================

const getTeacherProfile = async (req, res) => {
   try {
      const teacher = await Teacher.findOne({
         user: req.user._id,
         isActive: true,
      })
         .populate("user", "name userId role isActive")
         .lean();

      if (!teacher) {
         return res.status(404).json({
            success: false,
            message: "Teacher profile not found",
         });
      }

      return res.status(200).json({
         success: true,
         teacher,
      });
   } catch (error) {
      console.error("Get teacher profile error:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to get teacher profile",
      });
   }
};

// ======================================================
// UPDATE TEACHER PROFILE
// PUT /api/teacher/profile
// ======================================================

const updateTeacherProfile = async (req, res) => {
   try {
      const {
         name,
         fatherName,
         subject,
         qualification,
         phone,
         email,
         address,
         city,
         state,
         joiningDate,
         profilePhoto,
      } = req.body;

      const teacher = await getLoggedInTeacher(req);

      if (!teacher) {
         return res.status(404).json({
            success: false,
            message: "Teacher profile not found",
         });
      }

      // BASIC DETAILS

      if (name !== undefined) {
         if (!String(name).trim()) {
            return res.status(400).json({
               success: false,
               message: "Name cannot be empty",
            });
         }

         teacher.name = String(name).trim();
      }

      if (fatherName !== undefined) {
         teacher.fatherName = String(fatherName).trim();
      }

      if (subject !== undefined) {
         if (!String(subject).trim()) {
            return res.status(400).json({
               success: false,
               message: "Subject cannot be empty",
            });
         }

         teacher.subject = String(subject).trim();
      }

      if (qualification !== undefined) {
         teacher.qualification = String(qualification).trim();
      }

      if (phone !== undefined) {
         teacher.phone = String(phone).trim();
      }

      if (email !== undefined) {
         teacher.email = String(email).trim().toLowerCase();
      }

      if (address !== undefined) {
         teacher.address = String(address).trim();
      }

      if (city !== undefined) {
         teacher.city = String(city).trim();
      }

      if (state !== undefined) {
         teacher.state = String(state).trim();
      }

      // JOINING DATE

      if (joiningDate !== undefined) {
         if (joiningDate === "") {
            return res.status(400).json({
               success: false,
               message: "Joining date cannot be empty",
            });
         }

         const parsedDate = new Date(joiningDate);

         if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
               success: false,
               message: "Invalid joining date",
            });
         }

         teacher.joiningDate = parsedDate;
      }

      // PROFILE PHOTO
      // Teacher model field is "photo", not "profilePhoto".

      if (profilePhoto !== undefined) {
         const photo = String(profilePhoto).trim();

         if (
            photo &&
            !photo.startsWith("data:image/") &&
            !/^https?:\/\/\S+$/i.test(photo)
         ) {
            return res.status(400).json({
               success: false,
               message: "Invalid profile photo",
            });
         }

         teacher.photo = photo;
      }

      await teacher.save();

      // UPDATE USER NAME

      if (name !== undefined && teacher.user) {
         await User.findByIdAndUpdate(teacher.user, {
            name: teacher.name,
         });
      }

      // GET UPDATED PROFILE

      const updatedTeacher = await Teacher.findById(teacher._id)
         .populate("user", "name userId role isActive")
         .lean();

      return res.status(200).json({
         success: true,
         message: "Teacher profile updated successfully",
         teacher: updatedTeacher,
      });
   } catch (error) {
      console.error("Update teacher profile error:", error);

      if (error.name === "ValidationError") {
         return res.status(400).json({
            success: false,
            message: error.message,
         });
      }

      return res.status(500).json({
         success: false,
         message: "Failed to update teacher profile",
      });
   }
};

// ======================================================
// GET ALL ASSIGNED STUDENTS
// GET /api/teacher/students
// ======================================================

const getTeacherStudents = async (req, res) => {
   try {
      const { className, section, search } = req.query;

      const teacher = await getLoggedInTeacher(req);

      if (!teacher) {
         return res.status(404).json({
            success: false,
            message: "Teacher profile not found",
         });
      }

      const assignedFilter = getAssignedStudentFilter(teacher);

      const conditions = [
         assignedFilter,
         { isActive: true },
      ];

      // OPTIONAL CLASS FILTER

      if (className) {
         conditions.push({
            className: String(className).trim(),
         });
      }

      // OPTIONAL SECTION FILTER

      if (section) {
         conditions.push({
            section: String(section).trim().toUpperCase(),
         });
      }

      // OPTIONAL SEARCH FILTER

      if (search) {
         const searchValue = String(search).trim();

         if (searchValue.length > 100) {
            return res.status(400).json({
               success: false,
               message: "Search text is too long",
            });
         }

         const escapedSearch = searchValue.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
         );

         conditions.push({
            $or: [
               {
                  name: {
                     $regex: escapedSearch,
                     $options: "i",
                  },
               },
               {
                  studentId: {
                     $regex: escapedSearch,
                     $options: "i",
                  },
               },
               {
                  rollNumber: {
                     $regex: escapedSearch,
                     $options: "i",
                  },
               },
               {
                  email: {
                     $regex: escapedSearch,
                     $options: "i",
                  },
               },
            ],
         });
      }

      const students = await Student.find({
         $and: conditions,
      })
         .populate("user", "name userId role isActive")
         .sort({
            className: 1,
            section: 1,
            rollNumber: 1,
         })
         .lean();

      return res.status(200).json({
         success: true,
         count: students.length,
         students,
      });
   } catch (error) {
      console.error("Get teacher students error:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to get students",
      });
   }
};

// ======================================================
// GET SINGLE ASSIGNED STUDENT
// GET /api/teacher/students/:id
// ======================================================

const getTeacherStudentById = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid student ID",
         });
      }

      const teacher = await getLoggedInTeacher(req);

      if (!teacher) {
         return res.status(404).json({
            success: false,
            message: "Teacher profile not found",
         });
      }

      const assignedFilter = getAssignedStudentFilter(teacher);

      const student = await Student.findOne({
         $and: [
            { _id: id },
            { isActive: true },
            assignedFilter,
         ],
      })
         .populate("user", "name userId role isActive")
         .lean();

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student not found or not assigned to you",
         });
      }

      return res.status(200).json({
         success: true,
         student,
      });
   } catch (error) {
      console.error("Get teacher student error:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to get student",
      });
   }
};

// ======================================================
// TEACHER DASHBOARD
// GET /api/teacher/dashboard
// ======================================================

const getTeacherDashboard = async (req, res) => {
   try {
      const teacher = await getLoggedInTeacher(req);

      if (!teacher) {
         return res.status(404).json({
            success: false,
            message: "Teacher profile not found",
         });
      }

      const assignedFilter = getAssignedStudentFilter(teacher);

      // GET ONLY ASSIGNED ACTIVE STUDENTS

      const students = await Student.find({
         $and: [
            assignedFilter,
            { isActive: true },
         ],
      })
         .select("_id className section")
         .lean();

      const totalStudents = students.length;

      const studentIds = students.map((student) => student._id);

      const classes = [
         ...new Set(students.map((student) => student.className)),
      ];

      const sections = [
         ...new Set(students.map((student) => student.section)),
      ];

      // TODAY DATE RANGE

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // ATTENDANCE ONLY FOR ASSIGNED STUDENTS

      const todayAttendance = studentIds.length
         ? await Attendance.find({
            student: { $in: studentIds },
            date: {
               $gte: today,
               $lt: tomorrow,
            },
         }).lean()
         : [];

      const present = todayAttendance.filter(
         (item) => item.status === "present"
      ).length;

      const absent = todayAttendance.filter(
         (item) => item.status === "absent"
      ).length;

      const late = todayAttendance.filter(
         (item) => item.status === "late"
      ).length;

      const marked = present + absent + late;

      const attendancePercentage =
         totalStudents > 0
            ? Math.round((present / totalStudents) * 100)
            : 0;

      return res.status(200).json({
         success: true,

         stats: {
            totalStudents,
            totalClasses: classes.length,
            totalSections: sections.length,
            todayAttendance: attendancePercentage,
         },

         attendance: {
            total: totalStudents,
            present,
            absent,
            late,
            marked,
            notMarked: Math.max(totalStudents - marked, 0),
            percentage: attendancePercentage,
         },
      });
   } catch (error) {
      console.error("Teacher dashboard error:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to get teacher dashboard",
      });
   }
};

// ======================================================
// EXPORTS
// ======================================================

export {
   getTeacherProfile,
   updateTeacherProfile,
   getTeacherStudents,
   getTeacherStudentById,
   getTeacherDashboard,
};
