
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

import { generateUserId } from "../utils/generateId.js";

// ======================================================
// COMMON HELPERS
// ======================================================

const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const getCurrentAcademicYear = () => {
   const now = new Date();
   const year =
      now.getFullYear() - (now.getMonth() < 3 ? 1 : 0);

   return `${year}-${String(year + 1).slice(-2)}`;
};

const normalizeClass = (value) => {
   const text = String(value || "").trim().toLowerCase();

   const aliases = {
      nursery: "Nursery",
      nur: "Nursery",
      lkg: "LKG",
      ukg: "UKG",
   };

   if (aliases[text]) return aliases[text];

   const match = text.match(
      /(?:^|\D)(1[0-2]|[1-9])(?:st|nd|rd|th)?(?:\D|$)/i
   );

   return match ? match[1] : "";
};

const normalizeArray = (value) => {
   if (!Array.isArray(value)) return [];

   return [
      ...new Set(
         value
            .map((item) => String(item).trim())
            .filter(Boolean)
      ),
   ];
};

const isValidDate = (value) => {
   const date = new Date(value);
   return !Number.isNaN(date.getTime());
};

const handleError = (res, error, label, message) => {
   console.error(`${label}:`, error);

   if (error?.name === "ValidationError") {
      return res.status(400).json({
         success: false,
         message: "Validation failed",
         errors: Object.values(error.errors || {}).map((item) => ({
            field: item.path,
            message: item.message,
         })),
      });
   }

   if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      return res.status(400).json({
         success: false,
         message: `Duplicate value for ${field || "this field"}`,
      });
   }

   return res.status(500).json({
      success: false,
      message: message || "Something went wrong",
   });
};

// ======================================================
// CREATE STUDENT
// ======================================================

export const createStudent = async (req, res) => {
   let user = null;

   try {
      const {
         name,
         fatherName,
         motherName,
         dob,
         gender,
         className,
         stream,
         section,
         rollNumber,
         phone,
         email,
         address,
         city,
         state,
         password,
      } = req.body;

      if (
         !name?.trim() ||
         !fatherName?.trim() ||
         !motherName?.trim() ||
         !className?.trim() ||
         !password
      ) {
         return res.status(400).json({
            success: false,
            message:
               "Name, father name, mother name, class and password are required",
         });
      }

      if (password.length < 6) {
         return res.status(400).json({
            success: false,
            message: "Password must contain at least 6 characters",
         });
      }

      if (dob && !isValidDate(dob)) {
         return res.status(400).json({
            success: false,
            message: "Invalid date of birth",
         });
      }

      const normalizedClass = normalizeClass(className);

      if (!normalizedClass) {
         return res.status(400).json({
            success: false,
            message: "Invalid class name",
         });
      }

      let normalizedGender;

      if (gender) {
         const value = String(gender).trim().toLowerCase();

         if (!["male", "female", "other"].includes(value)) {
            return res.status(400).json({
               success: false,
               message: "Invalid gender",
            });
         }

         normalizedGender = value;
      }

      const studentId = await generateUserId("student");
      const hashedPassword = await bcrypt.hash(password, 12);

      user = await User.create({
         name: name.trim(),
         userId: studentId,
         password: hashedPassword,
         role: "student",
         isActive: true,
      });

      const studentData = {
         user: user._id,
         studentId,
         name: name.trim(),
         fatherName: fatherName.trim(),
         motherName: motherName.trim(),
         className: normalizedClass,
         stream: stream?.trim() || "General",
         section: section?.trim().toUpperCase() || "A",
         rollNumber: rollNumber?.trim() || undefined,
         phone: phone?.trim() || undefined,
         email: email?.trim() || undefined,
         address: address?.trim() || undefined,
         city: city?.trim() || undefined,
         state: state?.trim() || undefined,
         gender: normalizedGender,
      };

      if (dob) {
         studentData.dob = new Date(dob);
      }

      const student = await Student.create(studentData);

      return res.status(201).json({
         success: true,
         message: "Student created successfully",
         loginDetails: {
            userId: studentId,
            password,
         },
         student,
      });
   } catch (error) {
      // Remove the User account if Student creation fails.
      if (user?._id) {
         try {
            await User.findByIdAndDelete(user._id);
         } catch (deleteError) {
            console.error("Student rollback error:", deleteError);
         }
      }

      return handleError(
         res,
         error,
         "Create Student Error",
         "Unable to create student"
      );
   }
};

// ======================================================
// CREATE TEACHER
// ======================================================

export const createTeacher = async (req, res) => {
   let user = null;

   try {
      const {
         name,
         fatherName,
         subject,
         subjects,
         teachingClasses,
         teachingSections,
         phone,
         email,
         qualification,
         address,
         joiningDate,
         password,
      } = req.body;

      if (
         !name?.trim() ||
         !subject?.trim() ||
         !phone?.trim() ||
         !password
      ) {
         return res.status(400).json({
            success: false,
            message: "Name, subject, phone and password are required",
         });
      }

      if (password.length < 6) {
         return res.status(400).json({
            success: false,
            message: "Password must contain at least 6 characters",
         });
      }

      if (joiningDate && !isValidDate(joiningDate)) {
         return res.status(400).json({
            success: false,
            message: "Invalid joining date",
         });
      }

      const normalizedSubjects = normalizeArray(subjects || [subject]);

      if (!normalizedSubjects.length) {
         return res.status(400).json({
            success: false,
            message: "At least one subject is required",
         });
      }

      const rawClasses = normalizeArray(teachingClasses);
      const normalizedTeachingClasses = [
         ...new Set(rawClasses.map(normalizeClass)),
      ];

      if (
         !normalizedTeachingClasses.length ||
         normalizedTeachingClasses.some((item) => !item)
      ) {
         return res.status(400).json({
            success: false,
            message: "Please select valid teaching classes",
         });
      }

      const normalizedTeachingSections = normalizeArray(
         teachingSections
      ).map((item) => item.toUpperCase());

      const teacherId = await generateUserId("teacher");
      const hashedPassword = await bcrypt.hash(password, 12);

      user = await User.create({
         name: name.trim(),
         userId: teacherId,
         password: hashedPassword,
         role: "teacher",
         isActive: true,
      });

      try {
         // Automatically create assignments for the current academic year.
         const academicYear = getCurrentAcademicYear();

         const teachingAssignments = normalizedTeachingClasses.map(
            (className) => ({
               className,
               sections: normalizedTeachingSections,
               academicYear,
               isActive: true,
            })
         );

         const teacher = await Teacher.create({
            user: user._id,
            teacherId,
            name: name.trim(),
            fatherName: fatherName?.trim() || undefined,
            subject: subject.trim(),
            subjects: normalizedSubjects,
            teachingClasses: normalizedTeachingClasses,
            teachingSections: normalizedTeachingSections,
            teachingAssignments,
            phone: phone.trim(),
            email: email?.trim() || undefined,
            qualification: qualification?.trim() || undefined,
            address: address?.trim() || undefined,
            joiningDate: joiningDate
               ? new Date(joiningDate)
               : new Date(),
            isActive: true,
         });

         return res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            loginDetails: {
               userId: teacherId,
               password,
            },
            teacher,
         });
      } catch (teacherError) {
         await User.findByIdAndDelete(user._id);
         user = null;
         throw teacherError;
      }
   } catch (error) {
      if (user?._id) {
         try {
            await User.findByIdAndDelete(user._id);
         } catch (deleteError) {
            console.error("Teacher rollback error:", deleteError);
         }
      }

      return handleError(
         res,
         error,
         "Create Teacher Error",
         "Unable to create teacher"
      );
   }
};

// ======================================================
// GET ALL STUDENTS
// ======================================================

export const getStudents = async (req, res) => {
   try {
      const students = await Student.find()
         .populate("user", "name userId role isActive")
         .sort({ createdAt: -1 });

      return res.json({
         success: true,
         count: students.length,
         students,
      });
   } catch (error) {
      return handleError(
         res,
         error,
         "Get Students Error",
         "Unable to fetch students"
      );
   }
};

// ======================================================
// GET ALL TEACHERS
// ======================================================

export const getTeachers = async (req, res) => {
   try {
      const teachers = await Teacher.find()
         .populate("user", "name userId role isActive")
         .sort({ createdAt: -1 });

      return res.json({
         success: true,
         count: teachers.length,
         teachers,
      });
   } catch (error) {
      return handleError(
         res,
         error,
         "Get Teachers Error",
         "Unable to fetch teachers"
      );
   }
};

// ======================================================
// UPDATE STUDENT
// ======================================================

export const updateStudent = async (req, res) => {
   try {
      const { id } = req.params;

      if (!isValidId(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid student ID",
         });
      }

      const {
         name,
         fatherName,
         motherName,
         dob,
         gender,
         className,
         stream,
         section,
         rollNumber,
         phone,
         email,
         address,
         city,
         state,
      } = req.body;

      const student = await Student.findById(id);

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student not found",
         });
      }

      if (dob && !isValidDate(dob)) {
         return res.status(400).json({
            success: false,
            message: "Invalid date of birth",
         });
      }

      if (gender !== undefined) {
         const value = String(gender).trim().toLowerCase();

         if (!["male", "female", "other"].includes(value)) {
            return res.status(400).json({
               success: false,
               message: "Invalid gender",
            });
         }

         student.gender = value;
      }

      if (className !== undefined) {
         const normalized = normalizeClass(className);

         if (!normalized) {
            return res.status(400).json({
               success: false,
               message: "Invalid class name",
            });
         }

         student.className = normalized;
      }

      if (name !== undefined) student.name = name.trim();
      if (fatherName !== undefined) student.fatherName = fatherName.trim();
      if (motherName !== undefined) student.motherName = motherName.trim();
      if (dob !== undefined) student.dob = dob ? new Date(dob) : undefined;
      if (stream !== undefined) student.stream = stream.trim();
      if (section !== undefined) student.section = section.trim().toUpperCase();
      if (rollNumber !== undefined) student.rollNumber = rollNumber.trim();
      if (phone !== undefined) student.phone = phone.trim();
      if (email !== undefined) student.email = email.trim();
      if (address !== undefined) student.address = address.trim();
      if (city !== undefined) student.city = city.trim();
      if (state !== undefined) student.state = state.trim();

      await student.save();

      if (student.user) {
         await User.findByIdAndUpdate(student.user, {
            name: student.name,
         });
      }

      return res.json({
         success: true,
         message: "Student updated successfully",
         student,
      });
   } catch (error) {
      return handleError(
         res,
         error,
         "Update Student Error",
         "Unable to update student"
      );
   }
};

// ======================================================
// UPDATE TEACHER
// ======================================================

export const updateTeacher = async (req, res) => {
   try {
      const { id } = req.params;

      if (!isValidId(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid teacher ID",
         });
      }

      const {
         name,
         fatherName,
         subject,
         subjects,
         teachingClasses,
         teachingSections,
         phone,
         email,
         qualification,
         address,
         joiningDate,
      } = req.body;

      const teacher = await Teacher.findById(id);

      if (!teacher) {
         return res.status(404).json({
            success: false,
            message: "Teacher not found",
         });
      }

      if (joiningDate && !isValidDate(joiningDate)) {
         return res.status(400).json({
            success: false,
            message: "Invalid joining date",
         });
      }

      if (name !== undefined) teacher.name = name.trim();
      if (fatherName !== undefined) teacher.fatherName = fatherName.trim();

      if (subject !== undefined) {
         if (!subject.trim()) {
            return res.status(400).json({
               success: false,
               message: "Subject cannot be empty",
            });
         }

         teacher.subject = subject.trim();
      }

      if (Array.isArray(subjects)) {
         const normalizedSubjects = normalizeArray(subjects);

         if (!normalizedSubjects.length) {
            return res.status(400).json({
               success: false,
               message: "At least one subject is required",
            });
         }

         teacher.subjects = normalizedSubjects;
      } else if (subject !== undefined) {
         teacher.subjects = [subject.trim()];
      }

      // Update legacy fields only.
      // Use assignTeacherClasses API to manage academic-year assignments.
      if (Array.isArray(teachingClasses)) {
         const normalizedClasses = [
            ...new Set(teachingClasses.map(normalizeClass)),
         ];

         if (
            !normalizedClasses.length ||
            normalizedClasses.some((item) => !item)
         ) {
            return res.status(400).json({
               success: false,
               message: "Please select valid teaching classes",
            });
         }

         teacher.teachingClasses = normalizedClasses;
      }

      if (Array.isArray(teachingSections)) {
         teacher.teachingSections = normalizeArray(
            teachingSections
         ).map((item) => item.toUpperCase());
      }

      if (phone !== undefined) teacher.phone = phone.trim();
      if (email !== undefined) teacher.email = email.trim();
      if (qualification !== undefined) {
         teacher.qualification = qualification.trim();
      }
      if (address !== undefined) teacher.address = address.trim();

      if (joiningDate !== undefined) {
         teacher.joiningDate = joiningDate
            ? new Date(joiningDate)
            : undefined;
      }

      await teacher.save();

      if (teacher.user) {
         await User.findByIdAndUpdate(teacher.user, {
            name: teacher.name,
         });
      }

      return res.json({
         success: true,
         message: "Teacher updated successfully",
         teacher,
      });
   } catch (error) {
      return handleError(
         res,
         error,
         "Update Teacher Error",
         "Unable to update teacher"
      );
   }
};

// ======================================================
// ASSIGN TEACHER CLASSES / SECTIONS
// ======================================================

export const assignTeacherClasses = async (req, res) => {
   try {
      const { id } = req.params;
      const { teachingAssignments } = req.body;

      if (!isValidId(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid teacher ID",
         });
      }

      if (!Array.isArray(teachingAssignments)) {
         return res.status(400).json({
            success: false,
            message: "Assignments must be an array",
         });
      }

      const teacher = await Teacher.findById(id);

      if (!teacher) {
         return res.status(404).json({
            success: false,
            message: "Teacher not found",
         });
      }

      const defaultYear = getCurrentAcademicYear();
      const seen = new Set();

      const assignments = teachingAssignments.map((item) => {
         if (!item || typeof item !== "object" || Array.isArray(item)) {
            throw new Error("Each assignment must be an object");
         }

         const className = normalizeClass(item.className);
         const academicYear = String(
            item.academicYear || defaultYear
         ).trim();

         if (!className) {
            throw new Error(`Invalid class: ${item.className}`);
         }

         if (!/^\d{4}-\d{2}$/.test(academicYear)) {
            throw new Error(`Invalid academic year: ${academicYear}`);
         }

         const startYear = Number(academicYear.slice(0, 4));
         const expectedEnd = String(startYear + 1).slice(-2);

         if (academicYear.slice(5) !== expectedEnd) {
            throw new Error(`Invalid academic year: ${academicYear}`);
         }

         if (
            item.sections !== undefined &&
            !Array.isArray(item.sections)
         ) {
            throw new Error("Sections must be an array");
         }

         const key = `${className}-${academicYear}`;

         if (seen.has(key)) {
            throw new Error(`Duplicate assignment: ${key}`);
         }

         seen.add(key);

         return {
            className,
            sections: [
               ...new Set(
                  (item.sections || [])
                     .map((section) => String(section).trim().toUpperCase())
                     .filter(Boolean)
               ),
            ],
            academicYear,
            isActive: item.isActive !== false,
         };
      });

      teacher.teachingAssignments = assignments;

      teacher.teachingClasses = [
         ...new Set(assignments.map((item) => item.className)),
      ];

      teacher.teachingSections = [
         ...new Set(
            assignments.flatMap((item) => item.sections)
         ),
      ];

      await teacher.save();

      return res.json({
         success: true,
         message: "Teacher assignments saved successfully",
         teachingAssignments: teacher.teachingAssignments,
      });
   } catch (error) {
      if (
         error.message?.startsWith("Invalid") ||
         error.message?.startsWith("Duplicate") ||
         error.message?.startsWith("Sections") ||
         error.message?.startsWith("Each assignment")
      ) {
         return res.status(400).json({
            success: false,
            message: error.message,
         });
      }

      return handleError(
         res,
         error,
         "Assign Teacher Classes Error",
         "Unable to assign classes"
      );
   }
};

// ======================================================
// DELETE STUDENT
// ======================================================

export const deleteStudent = async (req, res) => {
   try {
      const { id } = req.params;

      if (!isValidId(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid student ID",
         });
      }

      const student = await Student.findById(id);

      if (!student) {
         return res.status(404).json({
            success: false,
            message: "Student not found",
         });
      }

      await Student.findByIdAndDelete(id);

      if (student.user) {
         await User.findByIdAndDelete(student.user);
      }

      return res.json({
         success: true,
         message: "Student deleted successfully",
      });
   } catch (error) {
      return handleError(
         res,
         error,
         "Delete Student Error",
         "Unable to delete student"
      );
   }
};

// ======================================================
// DELETE TEACHER
// ======================================================

export const deleteTeacher = async (req, res) => {
   try {
      const { id } = req.params;

      if (!isValidId(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid teacher ID",
         });
      }

      const teacher = await Teacher.findById(id);

      if (!teacher) {
         return res.status(404).json({
            success: false,
            message: "Teacher not found",
         });
      }

      await Teacher.findByIdAndDelete(id);

      if (teacher.user) {
         await User.findByIdAndDelete(teacher.user);
      }

      return res.json({
         success: true,
         message: "Teacher deleted successfully",
      });
   } catch (error) {
      return handleError(
         res,
         error,
         "Delete Teacher Error",
         "Unable to delete teacher"
      );
   }
};

// ======================================================
// RESET / CHANGE USER PASSWORD
// ======================================================

export const resetUserPassword = async (req, res) => {
   try {
      const { userId } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!userId?.trim()) {
         return res.status(400).json({
            success: false,
            message: "User ID is required",
         });
      }

      if (!newPassword || newPassword.length < 6) {
         return res.status(400).json({
            success: false,
            message: "New password must contain at least 6 characters",
         });
      }

      const user = await User.findOne({
         userId: userId.trim().toUpperCase(),
      });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      // Admin can only change their own admin password.
      if (user.role === "admin") {
         const loggedInAdminId = req.user?.userId?.toUpperCase();
         const requestedUserId = user.userId?.toUpperCase();

         if (
            !loggedInAdminId ||
            loggedInAdminId !== requestedUserId
         ) {
            return res.status(403).json({
               success: false,
               message: "You can only change your own admin password",
            });
         }

         if (!currentPassword) {
            return res.status(400).json({
               success: false,
               message: "Current password is required",
            });
         }

         const passwordMatched = await bcrypt.compare(
            currentPassword,
            user.password
         );

         if (!passwordMatched) {
            return res.status(400).json({
               success: false,
               message: "Current password is incorrect",
            });
         }

         const samePassword = await bcrypt.compare(
            newPassword,
            user.password
         );

         if (samePassword) {
            return res.status(400).json({
               success: false,
               message: "New password must be different from current password",
            });
         }
      }

      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();

      return res.json({
         success: true,
         message:
            user.role === "admin"
               ? "Admin password changed successfully"
               : "Password reset successfully",
      });
   } catch (error) {
      return handleError(
         res,
         error,
         "Password Reset Error",
         "Unable to change password"
      );
   }
};

// ======================================================
// ACTIVATE / DEACTIVATE USER
// ======================================================

export const toggleUserStatus = async (req, res) => {
   try {
      const { userId } = req.params;

      if (!userId?.trim()) {
         return res.status(400).json({
            success: false,
            message: "User ID is required",
         });
      }

      const user = await User.findOne({
         userId: userId.trim().toUpperCase(),
      });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      if (user.role === "admin") {
         return res.status(403).json({
            success: false,
            message: "Admin status cannot be changed here",
         });
      }

      user.isActive = !user.isActive;
      await user.save();

      // Keep the related profile status in sync with the User account.
      if (user.role === "student") {
         await Student.findOneAndUpdate(
            { user: user._id },
            { isActive: user.isActive }
         );
      }

      if (user.role === "teacher") {
         await Teacher.findOneAndUpdate(
            { user: user._id },
            { isActive: user.isActive }
         );
      }

      return res.json({
         success: true,
         message: user.isActive
            ? "Account activated"
            : "Account deactivated",
         isActive: user.isActive,
      });
   } catch (error) {
      return handleError(
         res,
         error,
         "Toggle Status Error",
         "Unable to update account status"
      );
   }
};
