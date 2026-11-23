import Student from "../models/Student.js";

// =====================================================
// GET LOGGED-IN STUDENT PROFILE
// GET /api/student/profile
// =====================================================

const getStudentProfile = async (req, res) => {
   try {
      const student = await Student.findOne({
         user: req.user._id,
      })
         .populate(
            "user",
            "name userId role isActive"
         )
         .populate({
            path: "assignedSubjects",
            select:
               "name code teacher teacherName room classesPerWeek description className section academicYear icon isActive",
            populate: {
               path: "teacher",
               select:
                  "teacherId name subject subjects teachingClasses teachingSections isActive",
            },
         });

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student profile not found",
         });
      }

      return res.status(200).json({
         success: true,
         student,
      });
   } catch (error) {
      console.error(
         "Get student profile error:",
         error
      );

      return res.status(500).json({
         success: false,
         message: "Failed to get student profile",
         error: error.message,
      });
   }
};

// =====================================================
// GET LOGGED-IN STUDENT BASIC INFORMATION
// GET /api/student/me
// =====================================================

const getMyStudentInfo = async (req, res) => {
   try {
      const student = await Student.findOne({
         user: req.user._id,
      })
         .select(
            "studentId name fatherName motherName dob gender photo className stream section rollNumber assignedSubjects phone email address city state admissionDate isActive"
         )
         .populate({
            path: "assignedSubjects",
            select:
               "name code teacher teacherName room classesPerWeek description className section academicYear icon isActive",
            populate: {
               path: "teacher",
               select:
                  "teacherId name subject subjects teachingClasses teachingSections isActive",
            },
         });

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student profile not found",
         });
      }

      return res.status(200).json({
         success: true,
         student,
      });
   } catch (error) {
      console.error(
         "Get my student info error:",
         error
      );

      return res.status(500).json({
         success: false,
         message: "Failed to get student information",
         error: error.message,
      });
   }
};

// =====================================================
// GET STUDENT DASHBOARD
// GET /api/student/dashboard
// =====================================================

const getStudentDashboard = async (req, res) => {
   try {
      const student = await Student.findOne({
         user: req.user._id,
      })
         .populate(
            "user",
            "name userId role isActive"
         )
         .populate({
            path: "assignedSubjects",
            select:
               "name code teacher teacherName room classesPerWeek description className section academicYear icon isActive",
            populate: {
               path: "teacher",
               select:
                  "teacherId name subject subjects teachingClasses teachingSections isActive",
            },
         });

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student profile not found",
         });
      }

      const subjects = Array.isArray(
         student.assignedSubjects
      )
         ? student.assignedSubjects
         : [];

      return res.status(200).json({
         success: true,

         student: {
            id: student._id,

            studentId: student.studentId,

            name: student.name,

            fatherName: student.fatherName,

            motherName: student.motherName,

            dob: student.dob,

            gender: student.gender,

            photo: student.photo || "",

            className: student.className,

            stream: student.stream || "General",

            section: student.section,

            rollNumber: student.rollNumber,

            assignedSubjects: subjects,

            phone: student.phone,

            email: student.email,

            address: student.address,

            city: student.city,

            state: student.state,

            admissionDate: student.admissionDate,

            isActive: student.isActive,
         },

         stats: {
            attendance: 0,

            overallPercentage: 0,

            subjects: subjects.length,

            pendingResults: 0,
         },

         message:
            "Student dashboard data loaded successfully",
      });
   } catch (error) {
      console.error(
         "Get student dashboard error:",
         error
      );

      return res.status(500).json({
         success: false,
         message: "Failed to get student dashboard",
         error: error.message,
      });
   }
};

// =====================================================
// GET STUDENT BY ID
// GET /api/student/:id
// =====================================================

const getStudentById = async (req, res) => {
   try {
      const student = await Student.findById(
         req.params.id
      )
         .populate(
            "user",
            "name userId role isActive"
         )
         .populate({
            path: "assignedSubjects",
            select:
               "name code teacher teacherName room classesPerWeek description className section academicYear icon isActive",
            populate: {
               path: "teacher",
               select:
                  "teacherId name subject subjects teachingClasses teachingSections isActive",
            },
         });

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student not found",
         });
      }

      return res.status(200).json({
         success: true,
         student,
      });
   } catch (error) {
      console.error(
         "Get student by ID error:",
         error
      );

      return res.status(500).json({
         success: false,
         message: "Failed to get student",
         error: error.message,
      });
   }
};

// =====================================================
// EXPORTS
// =====================================================

export {
   getStudentProfile,
   getStudentById,
   getMyStudentInfo,
   getStudentDashboard,
};