import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

// =====================================================
// HELPERS
// =====================================================

const normalizeText = (value = "") =>
   String(value ?? "").trim().toLowerCase();

const normalizeSection = (value = "") =>
   String(value ?? "").trim().toUpperCase();

const normalizeStream = (value = "") => {
   const stream = normalizeText(value);
   return stream || "general";
};

const getDefaultAcademicYear = () => {
   const now = new Date();
   const year = now.getFullYear();
   const month = now.getMonth();

   const startYear = month >= 3 ? year : year - 1;
   return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

const normalizeAcademicYear = (value) => {
   const year = String(value ?? "").trim();
   return year || getDefaultAcademicYear();
};

const normalizeClassName = (value = "") => {
   const text = normalizeText(value);

   const prePrimary = {
      nursery: "Nursery",
      lkg: "LKG",
      ukg: "UKG",
   };

   if (prePrimary[text]) return prePrimary[text];

   const match = text.match(
      /(?:^|\D)(1[0-2]|[1-9])(?:st|nd|rd|th)?(?:\D|$)/i
   );

   return match ? match[1] : "";
};

const isSameClass = (firstClass, secondClass) => {
   const first = normalizeClassName(firstClass);
   const second = normalizeClassName(secondClass);

   return Boolean(first && second && first === second);
};

// General subject is common to all streams.
// A General student cannot receive a specific-stream subject.
const isSameStream = (studentStream, subjectStream) => {
   const student = normalizeStream(studentStream);
   const subject = normalizeStream(subjectStream);

   if (subject === "general") return true;
   if (student === "general") return false;

   return student === subject;
};

// Blank subject section means all sections.
// Specific section subject requires an exact student section.
const isSameSection = (studentSection, subjectSection) => {
   const student = normalizeSection(studentSection);
   const subject = normalizeSection(subjectSection);

   if (!subject) return true;

   return student === subject;
};

const isSameAcademicYear = (studentYear, subjectYear) => {
   return (
      normalizeText(normalizeAcademicYear(studentYear)) ===
      normalizeText(normalizeAcademicYear(subjectYear))
   );
};

const isSubjectForStudent = (subject, student) => {
   if (!subject || !student || subject.isActive === false) {
      return false;
   }

   return (
      isSameClass(student.className, subject.className) &&
      isSameStream(student.stream, subject.stream) &&
      isSameSection(student.section, subject.section) &&
      isSameAcademicYear(student.academicYear, subject.academicYear)
   );
};

// =====================================================
// AUTOMATIC SUBJECT ASSIGNMENT
// =====================================================

// Subject create/update hone par matching students ke
// assignedSubjects automatically update honge.
const syncSubjectAssignments = async (subject) => {
   const students = await Student.find({
      isActive: true,
   }).select(
      "_id className stream section academicYear assignedSubjects"
   );

   const subjectId = String(subject._id);

   for (const student of students) {
      const existingIds = (student.assignedSubjects || []).map(
         (id) => String(id)
      );

      const alreadyAssigned = existingIds.includes(subjectId);
      const matches = isSubjectForStudent(subject, student);

      if (matches && !alreadyAssigned) {
         student.assignedSubjects.push(subject._id);
         await student.save();
      }

      if (!matches && alreadyAssigned) {
         student.assignedSubjects = student.assignedSubjects.filter(
            (id) => String(id) !== subjectId
         );
         await student.save();
      }
   }
};

// =====================================================
// POPULATE HELPERS
// =====================================================

const teacherPopulate = {
   path: "teacher",
   select:
      "name teacherId subject subjects teachingClasses teachingSections isActive",
};

const assignedSubjectsPopulate = {
   path: "assignedSubjects",
   match: { isActive: true },
   populate: {
      path: "teacher",
      select:
         "name teacherId subject subjects teachingClasses teachingSections",
   },
};

// =====================================================
// CREATE SUBJECT
// POST /api/subjects
// =====================================================

const createSubject = async (req, res) => {
   try {
      const {
         name,
         code,
         teacher,
         room,
         classesPerWeek,
         description,
         className,
         stream,
         section,
         academicYear,
         icon,
      } = req.body;

      if (
         !String(name || "").trim() ||
         !String(code || "").trim() ||
         !String(className || "").trim()
      ) {
         return res.status(400).json({
            success: false,
            message: "Name, code and class are required.",
         });
      }

      const cleanName = String(name).trim();
      const cleanCode = String(code).trim().toUpperCase();
      const cleanClass = normalizeClassName(className);

      if (!cleanClass) {
         return res.status(400).json({
            success: false,
            message:
               "Valid class select karein: Nursery, LKG, UKG ya Class 1 se 12.",
         });
      }

      const cleanStream = String(stream || "General").trim();
      const cleanSection = normalizeSection(section);
      const cleanAcademicYear = normalizeAcademicYear(academicYear);

      // Duplicate check
      const existingSubjects = await Subject.find({
         code: cleanCode,
         isActive: true,
      }).lean();

      const duplicate = existingSubjects.some((subject) => {
         return (
            isSameClass(cleanClass, subject.className) &&
            normalizeSection(subject.section) === cleanSection &&
            normalizeStream(subject.stream) ===
            normalizeStream(cleanStream) &&
            normalizeText(subject.academicYear) ===
            normalizeText(cleanAcademicYear)
         );
      });

      if (duplicate) {
         return res.status(400).json({
            success: false,
            message:
               "This subject already exists for this class, stream, section and academic year.",
         });
      }

      // Validate teacher
      let teacherId = null;
      let teacherName = "";

      if (teacher) {
         if (!mongoose.Types.ObjectId.isValid(teacher)) {
            return res.status(400).json({
               success: false,
               message: "Invalid teacher ID.",
            });
         }

         const teacherData = await Teacher.findOne({
            _id: teacher,
            isActive: true,
         });

         if (!teacherData) {
            return res.status(404).json({
               success: false,
               message: "Teacher not found.",
            });
         }

         teacherId = teacherData._id;
         teacherName = teacherData.name || "";
      }

      const subject = await Subject.create({
         name: cleanName,
         code: cleanCode,
         teacher: teacherId,
         teacherName,
         room: String(room || "").trim(),
         classesPerWeek: Math.max(0, Number(classesPerWeek) || 0),
         description: String(description || "").trim(),
         className: cleanClass,
         stream: cleanStream,
         section: cleanSection,
         academicYear: cleanAcademicYear,
         icon: icon || "📚",
         isActive: true,
      });

      // Automatically assign to matching students
      await syncSubjectAssignments(subject);

      const populatedSubject = await Subject.findById(subject._id)
         .populate(teacherPopulate)
         .lean();

      return res.status(201).json({
         success: true,
         message: "Subject created and matching students updated successfully.",
         subject: populatedSubject,
      });
   } catch (error) {
      console.error("CREATE SUBJECT ERROR:", error);

      if (error?.code === 11000) {
         return res.status(400).json({
            success: false,
            message: "This subject already exists.",
         });
      }

      return res.status(500).json({
         success: false,
         message: "Failed to create subject.",
         error: error.message,
      });
   }
};

// =====================================================
// GET ALL SUBJECTS
// GET /api/subjects
// =====================================================

const getAllSubjects = async (req, res) => {
   try {
      const {
         className,
         stream,
         section,
         academicYear,
      } = req.query;

      const filter = {
         isActive: true,
      };

      if (academicYear) {
         filter.academicYear = String(academicYear).trim();
      }

      const allSubjects = await Subject.find(filter)
         .populate(teacherPopulate)
         .sort({
            className: 1,
            section: 1,
            name: 1,
         })
         .lean();

      let finalSubjects = allSubjects;

      if (className) {
         finalSubjects = finalSubjects.filter((subject) =>
            isSameClass(className, subject.className)
         );
      }

      if (stream) {
         finalSubjects = finalSubjects.filter((subject) =>
            isSameStream(stream, subject.stream)
         );
      }

      if (section !== undefined && section !== "") {
         finalSubjects = finalSubjects.filter((subject) =>
            isSameSection(section, subject.section)
         );
      }

      return res.status(200).json({
         success: true,
         count: finalSubjects.length,
         subjects: finalSubjects,
      });
   } catch (error) {
      console.error("GET SUBJECTS ERROR:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to get subjects.",
         error: error.message,
      });
   }
};

// =====================================================
// GET TEACHERS
// GET /api/subjects/teachers
// =====================================================

const getTeachersForSubject = async (req, res) => {
   try {
      const teachers = await Teacher.find({
         isActive: true,
      })
         .select(
            "_id teacherId name subject subjects teachingClasses teachingSections"
         )
         .sort({ name: 1 })
         .lean();

      return res.status(200).json({
         success: true,
         teachers,
      });
   } catch (error) {
      console.error("GET TEACHERS ERROR:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to get teachers.",
         error: error.message,
      });
   }
};

// =====================================================
// UPDATE SUBJECT
// PUT /api/subjects/:id
// =====================================================

const updateSubject = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid subject ID.",
         });
      }

      const subject = await Subject.findById(id);

      if (!subject) {
         return res.status(404).json({
            success: false,
            message: "Subject not found.",
         });
      }

      const {
         name,
         code,
         teacher,
         room,
         classesPerWeek,
         description,
         className,
         stream,
         section,
         academicYear,
         icon,
         isActive,
      } = req.body;

      if (name !== undefined) {
         subject.name = String(name).trim();
      }

      if (code !== undefined) {
         subject.code = String(code).trim().toUpperCase();
      }

      if (className !== undefined) {
         const cleanClass = normalizeClassName(className);

         if (!cleanClass) {
            return res.status(400).json({
               success: false,
               message:
                  "Valid class select karein: Nursery, LKG, UKG ya Class 1 se 12.",
            });
         }

         subject.className = cleanClass;
      }

      if (stream !== undefined) {
         subject.stream = String(stream || "General").trim();
      }

      if (section !== undefined) {
         subject.section = normalizeSection(section);
      }

      if (academicYear !== undefined) {
         subject.academicYear = normalizeAcademicYear(academicYear);
      }

      if (room !== undefined) {
         subject.room = String(room || "").trim();
      }

      if (classesPerWeek !== undefined) {
         subject.classesPerWeek = Math.max(
            0,
            Number(classesPerWeek) || 0
         );
      }

      if (description !== undefined) {
         subject.description = String(description || "").trim();
      }

      if (icon !== undefined) {
         subject.icon = icon;
      }

      if (isActive !== undefined) {
         subject.isActive =
            isActive === true || isActive === "true";
      }

      if (teacher !== undefined) {
         if (teacher) {
            if (!mongoose.Types.ObjectId.isValid(teacher)) {
               return res.status(400).json({
                  success: false,
                  message: "Invalid teacher ID.",
               });
            }

            const teacherData = await Teacher.findOne({
               _id: teacher,
               isActive: true,
            });

            if (!teacherData) {
               return res.status(404).json({
                  success: false,
                  message: "Teacher not found.",
               });
            }

            subject.teacher = teacherData._id;
            subject.teacherName = teacherData.name || "";
         } else {
            subject.teacher = null;
            subject.teacherName = "";
         }
      }

      await subject.save();

      // Reconcile assignments after subject changes
      await syncSubjectAssignments(subject);

      const updatedSubject = await Subject.findById(subject._id)
         .populate(teacherPopulate)
         .lean();

      return res.status(200).json({
         success: true,
         message: "Subject updated successfully.",
         subject: updatedSubject,
      });
   } catch (error) {
      console.error("UPDATE SUBJECT ERROR:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to update subject.",
         error: error.message,
      });
   }
};

// =====================================================
// DELETE SUBJECT
// DELETE /api/subjects/:id
// SOFT DELETE
// =====================================================

const deleteSubject = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid subject ID.",
         });
      }

      const subject = await Subject.findById(id);

      if (!subject) {
         return res.status(404).json({
            success: false,
            message: "Subject not found.",
         });
      }

      subject.isActive = false;
      await subject.save();

      // Remove this inactive subject from all students
      await Student.updateMany(
         { assignedSubjects: subject._id },
         { $pull: { assignedSubjects: subject._id } }
      );

      return res.status(200).json({
         success: true,
         message: "Subject deleted successfully.",
      });
   } catch (error) {
      console.error("DELETE SUBJECT ERROR:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to delete subject.",
         error: error.message,
      });
   }
};

// =====================================================
// ASSIGN SUBJECTS TO STUDENT
// PUT /api/subjects/assign
// =====================================================

const assignSubjectsToStudent = async (req, res) => {
   try {
      const { studentId, subjectIds } = req.body;

      if (!studentId) {
         return res.status(400).json({
            success: false,
            message: "Student ID is required.",
         });
      }

      if (!Array.isArray(subjectIds)) {
         return res.status(400).json({
            success: false,
            message: "subjectIds must be an array.",
         });
      }

      const uniqueSubjectIds = [
         ...new Set(
            subjectIds
               .map((id) => String(id).trim())
               .filter(Boolean)
         ),
      ];

      let student = null;

      if (mongoose.Types.ObjectId.isValid(studentId)) {
         student = await Student.findOne({
            _id: studentId,
            isActive: true,
         });
      }

      if (!student) {
         student = await Student.findOne({
            studentId: String(studentId).trim().toUpperCase(),
            isActive: true,
         });
      }

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student not found.",
         });
      }

      // Empty array means remove all assigned subjects
      if (uniqueSubjectIds.length === 0) {
         student.assignedSubjects = [];
         await student.save();

         const updatedStudent = await Student.findById(student._id)
            .populate(assignedSubjectsPopulate)
            .lean();

         return res.status(200).json({
            success: true,
            message: "All subjects removed from student.",
            student: updatedStudent,
            assignedSubjects: [],
         });
      }

      const invalidIds = uniqueSubjectIds.filter(
         (id) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
         return res.status(400).json({
            success: false,
            message: "One or more subject IDs are invalid.",
         });
      }

      const subjects = await Subject.find({
         _id: { $in: uniqueSubjectIds },
         isActive: true,
      });

      if (subjects.length !== uniqueSubjectIds.length) {
         return res.status(400).json({
            success: false,
            message:
               "One or more selected subjects are invalid or inactive.",
         });
      }

      const wrongSubject = subjects.find(
         (subject) => !isSubjectForStudent(subject, student)
      );

      if (wrongSubject) {
         return res.status(400).json({
            success: false,
            message:
               `Subject "${wrongSubject.name}" does not match student's class, stream, section or academic year.`,
         });
      }

      student.assignedSubjects = uniqueSubjectIds;
      await student.save();

      const updatedStudent = await Student.findById(student._id)
         .populate(assignedSubjectsPopulate)
         .lean();

      return res.status(200).json({
         success: true,
         message: "Subjects assigned successfully.",
         student: updatedStudent,
         assignedSubjects: updatedStudent?.assignedSubjects || [],
      });
   } catch (error) {
      console.error("ASSIGN SUBJECT ERROR:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to assign subjects.",
         error: error.message,
      });
   }
};

// =====================================================
// GET LOGGED-IN STUDENT SUBJECTS
// GET /api/subjects/my
// =====================================================

const getMySubjects = async (req, res) => {
   try {
      const student = await Student.findOne({
         user: req.user._id,
         isActive: true,
      })
         .populate(assignedSubjectsPopulate)
         .lean();

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student profile not found.",
         });
      }

      return res.status(200).json({
         success: true,
         student: {
            studentId: student.studentId,
            name: student.name,
            photo: student.photo || "",
            className: student.className,
            stream: student.stream || "General",
            section: student.section || "",
            rollNumber: student.rollNumber,
            academicYear: student.academicYear,
         },
         subjects: student.assignedSubjects || [],
      });
   } catch (error) {
      console.error("GET MY SUBJECTS ERROR:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to get student subjects.",
         error: error.message,
      });
   }
};

// =====================================================
// GET ONE STUDENT WITH SUBJECTS
// GET /api/subjects/student/:studentId
// =====================================================

const getStudentSubjects = async (req, res) => {
   try {
      const { studentId } = req.params;

      let student = null;

      if (mongoose.Types.ObjectId.isValid(studentId)) {
         student = await Student.findOne({
            _id: studentId,
            isActive: true,
         });
      }

      if (!student) {
         student = await Student.findOne({
            studentId: String(studentId).trim().toUpperCase(),
            isActive: true,
         });
      }

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student not found.",
         });
      }

      const populatedStudent = await Student.findById(student._id)
         .populate(assignedSubjectsPopulate)
         .lean();

      return res.status(200).json({
         success: true,
         student: populatedStudent,
      });
   } catch (error) {
      console.error("GET STUDENT SUBJECTS ERROR:", error);

      return res.status(500).json({
         success: false,
         message: "Failed to get student subjects.",
         error: error.message,
      });
   }
};

// =====================================================
// EXPORTS
// =====================================================

export {
   createSubject,
   getAllSubjects,
   getTeachersForSubject,
   updateSubject,
   deleteSubject,
   assignSubjectsToStudent,
   getMySubjects,
   getStudentSubjects,
};