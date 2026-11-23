import mongoose from "mongoose";

import Result from "../models/Result.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";

import {
   sendResultEmail,
   sendResultSms,
} from "../services/resultNotificationService.js";


// =====================================================
// HELPERS
// =====================================================

const normalizeText = (value = "") => {
   return String(value)
      .trim()
      .toLowerCase();
};


// =====================================================
// GET CLASS NUMBER
// Supports:
// 1
// 10
// 12
// 12th
// 12th bio
// 12th science
// Class 12
// Class 12 Bio
// =====================================================

const getClassNumber = (value = "") => {
   const text = normalizeText(value);

   const match = text.match(
      /(?:^|\D)(1[0-2]|[1-9])(?:st|nd|rd|th)?(?:\D|$)/i
   );

   return match ? match[1] : "";
};


// =====================================================
// SUBJECT KEY
// =====================================================

const getSubjectKey = (subject = {}) => {
   return String(
      subject.code ||
      subject.name ||
      "subject"
   )
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
};


// =====================================================
// CALCULATE RESULT
// =====================================================

const calculateResult = (marks = {}) => {
   const values = Object.values(marks)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

   const total = values.reduce(
      (sum, value) => sum + value,
      0
   );

   const maxMarks = values.length * 100;

   const percentage = maxMarks
      ? Number(
         (
            (total / maxMarks) *
            100
         ).toFixed(2)
      )
      : 0;

   let grade = "F";

   if (percentage >= 90) {
      grade = "A+";
   } else if (percentage >= 80) {
      grade = "A";
   } else if (percentage >= 70) {
      grade = "B+";
   } else if (percentage >= 60) {
      grade = "B";
   } else if (percentage >= 50) {
      grade = "C";
   } else if (percentage >= 33) {
      grade = "D";
   }

   return {
      total,
      percentage,
      grade,
      resultStatus:
         percentage >= 33
            ? "Pass"
            : "Fail",
   };
};


// =====================================================
// FIND CLASS NAMES
//
// Example:
// selected class = "12"
//
// Database:
// "12th Bio"
// "12th Science"
//
// Both will be returned.
// =====================================================

const getMatchingClassNames = async (
   className
) => {
   const requested = normalizeText(
      className
   );

   if (!requested) {
      return [];
   }

   // First exact match
   const exactClasses =
      await Student.distinct(
         "className",
         {
            className: className,
         }
      );

   if (exactClasses.length > 0) {
      return exactClasses;
   }

   // Otherwise find same class number
   const allClasses =
      await Student.distinct(
         "className"
      );

   const requestedNumber =
      getClassNumber(requested);

   if (!requestedNumber) {
      return [className];
   }

   const matchingClasses =
      allClasses.filter(
         (value) =>
            getClassNumber(value) ===
            requestedNumber
      );

   return matchingClasses.length
      ? matchingClasses
      : [className];
};


// =====================================================
// FIND STUDENTS
// =====================================================

const findStudentsForResult = async ({
   className,
   section,
   studentIds,
}) => {
   const query = {};

   // ---------------------------------------------------
   // Student IDs provided
   // Supports Mongo ObjectId AND STU1001 type IDs
   // ---------------------------------------------------

   if (studentIds) {
      const rawIds = String(studentIds)
         .split(",")
         .map((id) => id.trim())
         .filter(Boolean);

      const mongoIds = rawIds.filter(
         (id) =>
            mongoose.Types.ObjectId.isValid(
               id
            )
      );

      const normalStudentIds =
         rawIds
            .filter(
               (id) =>
                  !mongoose.Types.ObjectId.isValid(
                     id
                  )
            )
            .map((id) => id.toUpperCase());

      const orConditions = [];

      if (mongoIds.length > 0) {
         orConditions.push({
            _id: {
               $in: mongoIds,
            },
         });
      }

      if (normalStudentIds.length > 0) {
         orConditions.push({
            studentId: {
               $in: normalStudentIds,
            },
         });
      }

      if (orConditions.length > 0) {
         query.$or = orConditions;
      }
   }

   // ---------------------------------------------------
   // Class
   // ---------------------------------------------------

   if (
      !studentIds &&
      className
   ) {
      const matchingClasses =
         await getMatchingClassNames(
            className
         );

      query.className = {
         $in: matchingClasses,
      };
   }

   // ---------------------------------------------------
   // Section
   // ---------------------------------------------------

   if (
      section &&
      normalizeText(section) !==
      "all"
   ) {
      query.section = section;
   }

   // ---------------------------------------------------
   // Active students only
   //
   // If your Student model doesn't have isActive,
   // this query still works because Mongo simply
   // won't match missing fields.
   //
   // To avoid that problem, we don't use isActive here.
   // ---------------------------------------------------

   const students =
      await Student.find(query)
         .select(
            [
               "name",
               "studentId",
               "rollNumber",
               "className",
               "section",
               "phone",
               "email",
               "parentPhone",
               "parentEmail",
               "fatherName",
               "motherName",
            ].join(" ")
         )
         .sort({
            rollNumber: 1,
            name: 1,
         })
         .lean();

   return students;
};


// =====================================================
// GET SUBJECTS FOR STUDENTS
// =====================================================

const getSubjectsForStudents = async (
   students,
   className,
   section
) => {
   const studentClassNames = [
      ...new Set(
         students
            .map((student) =>
               String(
                  student.className || ""
               ).trim()
            )
            .filter(Boolean)
      ),
   ];

   const subjectQuery = {};

   // ---------------------------------------------------
   // If students exist, use their actual class names
   //
   // This supports:
   // 12th Bio
   // 12th Science
   // ---------------------------------------------------

   if (
      studentClassNames.length > 0
   ) {
      subjectQuery.className = {
         $in: studentClassNames,
      };
   }

   // ---------------------------------------------------
   // If no students but class selected
   // ---------------------------------------------------

   else if (className) {
      const matchingClasses =
         await getMatchingClassNames(
            className
         );

      subjectQuery.className = {
         $in: matchingClasses,
      };
   }

   // ---------------------------------------------------
   // Section
   // ---------------------------------------------------

   if (
      section &&
      normalizeText(section) !==
      "all"
   ) {
      subjectQuery.$or = [
         {
            section: section,
         },
         {
            section: "",
         },
         {
            section: null,
         },
         {
            section: {
               $exists: false,
            },
         },
      ];
   }

   // ---------------------------------------------------
   // Get subjects
   // ---------------------------------------------------

   const dbSubjects =
      await Subject.find(
         subjectQuery
      )
         .select(
            [
               "name",
               "code",
               "className",
               "section",
               "academicYear",
               "teacher",
            ].join(" ")
         )
         .sort({
            name: 1,
         })
         .lean();

   // ---------------------------------------------------
   // Convert subjects
   // ---------------------------------------------------

   const subjectMap = new Map();

   for (
      const subject of dbSubjects
   ) {
      const key =
         getSubjectKey(subject);

      if (!subjectMap.has(key)) {
         subjectMap.set(key, {
            key,

            label:
               subject.name ||
               subject.code ||
               "Subject",

            name:
               subject.name || "",

            code:
               subject.code || "",

            subjectId:
               subject._id,

            className:
               subject.className || "",

            section:
               subject.section || "",
         });
      }
   }

   let subjects =
      Array.from(
         subjectMap.values()
      );

   // ---------------------------------------------------
   // Fallback subjects
   //
   // This prevents empty result page if subjects
   // haven't been created yet.
   // ---------------------------------------------------

   if (subjects.length === 0) {
      subjects = [
         {
            key: "english",
            label: "English",
            name: "English",
         },

         {
            key: "hindi",
            label: "Hindi",
            name: "Hindi",
         },

         {
            key: "mathematics",
            label: "Mathematics",
            name: "Mathematics",
         },

         {
            key: "physics",
            label: "Physics",
            name: "Physics",
         },

         {
            key: "chemistry",
            label: "Chemistry",
            name: "Chemistry",
         },

         {
            key: "biology",
            label: "Biology",
            name: "Biology",
         },

         {
            key: "computer",
            label: "Computer",
            name: "Computer",
         },
      ];
   }

   return subjects;
};


// =====================================================
// SEND PARENT NOTIFICATION
// =====================================================

const notifyOneParent = async ({
   student,
   result,
   mode,
}) => {
   const normalizedMode =
      normalizeText(mode);

   // ---------------------------------------------------
   // Support all possible frontend values
   // ---------------------------------------------------

   const wantSms =
      normalizedMode === "sms" ||
      normalizedMode ===
      "sms only" ||
      normalizedMode ===
      "sms_only" ||
      normalizedMode ===
      "sms+email" ||
      normalizedMode ===
      "sms + email" ||
      normalizedMode ===
      "both" ||
      normalizedMode ===
      "email + sms";

   const wantEmail =
      normalizedMode === "email" ||
      normalizedMode ===
      "email only" ||
      normalizedMode ===
      "email_only" ||
      normalizedMode ===
      "sms+email" ||
      normalizedMode ===
      "sms + email" ||
      normalizedMode ===
      "both" ||
      normalizedMode ===
      "email + sms";

   let sms = {
      sent: false,
      reason: "",
   };

   let email = {
      sent: false,
      reason: "",
   };

   // ===================================================
   // SMS
   // ===================================================

   if (wantSms) {
      try {
         const phone =
            student.parentPhone ||
            student.phone;

         if (!phone) {
            sms = {
               sent: false,
               reason:
                  "Parent phone number missing",
            };
         } else {
            sms =
               await sendResultSms({
                  to: phone,

                  studentName:
                     student.name,

                  exam:
                     result.exam,

                  percentage:
                     result.percentage,

                  grade:
                     result.grade,
               });
         }
      } catch (error) {
         console.error(
            "Result SMS error:",
            error.message
         );

         sms = {
            sent: false,
            reason:
               error.message ||
               "SMS failed",
         };
      }
   }

   // ===================================================
   // EMAIL
   // ===================================================

   if (wantEmail) {
      try {
         const emailAddress =
            student.parentEmail ||
            student.email;

         if (!emailAddress) {
            email = {
               sent: false,
               reason:
                  "Parent email missing",
            };
         } else {
            email =
               await sendResultEmail({
                  to: emailAddress,

                  studentName:
                     student.name,

                  exam:
                     result.exam,

                  className:
                     result.className,

                  percentage:
                     result.percentage,

                  grade:
                     result.grade,
               });
         }
      } catch (error) {
         console.error(
            "Result email error:",
            error.message
         );

         email = {
            sent: false,
            reason:
               error.message ||
               "Email failed",
         };
      }
   }

   // ===================================================
   // SAVE NOTIFICATION STATUS
   // ===================================================

   result.notified = {
      sms: Boolean(
         sms.sent
      ),

      email: Boolean(
         email.sent
      ),

      lastAttemptAt:
         new Date(),

      lastNotificationMode:
         mode,
   };

   await result.save();

   return {
      sms: Boolean(
         sms.sent
      ),

      email: Boolean(
         email.sent
      ),

      smsReason:
         sms.reason || "",

      emailReason:
         email.reason || "",
   };
};


// =====================================================
// GET TEACHER RESULTS
// =====================================================

export const getTeacherResults =
   async (req, res) => {
      try {
         const {
            className,
            section,
            exam,
            academicYear,
            studentIds,
         } = req.query;

         // ------------------------------------------------
         // STUDENTS
         // ------------------------------------------------

         const students =
            await findStudentsForResult({
               className,
               section,
               studentIds,
            });

         // ------------------------------------------------
         // EXISTING RESULTS
         // ------------------------------------------------

         const studentObjectIds =
            students.map(
               (student) =>
                  student._id
            );

         const resultQuery = {
            student: {
               $in: studentObjectIds,
            },
         };

         if (exam) {
            resultQuery.exam =
               exam;
         }

         if (academicYear) {
            resultQuery.academicYear =
               academicYear;
         }

         const results =
            studentObjectIds.length > 0
               ? await Result.find(
                  resultQuery
               ).lean()
               : [];

         // ------------------------------------------------
         // SUBJECTS
         // ------------------------------------------------

         const subjects =
            await getSubjectsForStudents(
               students,
               className,
               section
            );

         // ------------------------------------------------
         // MERGE STUDENTS + RESULTS
         // ------------------------------------------------

         const mergedStudents =
            students.map(
               (student) => {
                  const existingResult =
                     results.find(
                        (item) =>
                           String(
                              item.student
                           ) ===
                           String(
                              student._id
                           )
                     );

                  return {
                     ...student,

                     marks:
                        existingResult?.marks ||
                        {},

                     resultId:
                        existingResult?._id ||
                        null,

                     percentage:
                        existingResult?.percentage ||
                        0,

                     grade:
                        existingResult?.grade ||
                        "F",

                     total:
                        existingResult?.total ||
                        0,

                     resultStatus:
                        existingResult?.resultStatus ||
                        "Pending",
                  };
               }
            );

         // ------------------------------------------------
         // CLASSES
         // ------------------------------------------------

         const classes = [
            ...new Set(
               students
                  .map(
                     (student) =>
                        student.className
                  )
                  .filter(Boolean)
            ),
         ];

         // ------------------------------------------------
         // SECTIONS
         // ------------------------------------------------

         const sections = [
            ...new Set(
               students
                  .map(
                     (student) =>
                        student.section
                  )
                  .filter(Boolean)
            ),
         ];

         // ------------------------------------------------
         // RESPONSE
         // ------------------------------------------------

         return res.status(200).json({
            success: true,

            students:
               mergedStudents,

            results,

            subjects,

            classes,

            sections,
         });
      } catch (error) {
         console.error(
            "Get teacher results error:",
            error
         );

         return res.status(500).json({
            success: false,

            message:
               "Results load nahi ho paaye.",

            error:
               error.message,
         });
      }
   };


// =====================================================
// SAVE BULK RESULTS
// =====================================================

export const saveBulkResults =
   async (req, res) => {
      try {
         const {
            results,
         } = req.body;

         // ------------------------------------------------
         // VALIDATE
         // ------------------------------------------------

         if (
            !Array.isArray(
               results
            ) ||
            results.length === 0
         ) {
            return res.status(400).json({
               success: false,

               message:
                  "Results array required.",
            });
         }

         const savedResults = [];

         const notifications = {
            sent: 0,
            failed: 0,
            sms: 0,
            email: 0,
            details: [],
         };

         // ------------------------------------------------
         // PROCESS EACH STUDENT
         // ------------------------------------------------

         for (
            const item of results
         ) {
            if (
               !item.studentId ||
               !item.exam
            ) {
               continue;
            }

            // ==============================================
            // FIND STUDENT
            // ==============================================

            let student = null;

            const studentIdText =
               String(
                  item.studentId
               ).trim();

            if (
               mongoose.Types.ObjectId.isValid(
                  studentIdText
               )
            ) {
               student =
                  await Student.findOne({
                     $or: [
                        {
                           _id:
                              studentIdText,
                        },

                        {
                           studentId:
                              studentIdText.toUpperCase(),
                        },
                     ],
                  });
            } else {
               student =
                  await Student.findOne({
                     studentId:
                        studentIdText.toUpperCase(),
                  });
            }

            if (!student) {
               console.warn(
                  "Student not found:",
                  item.studentId
               );

               continue;
            }

            // ==============================================
            // MARKS
            // ==============================================

            const marks =
               item.marks || {};

            const calculated =
               calculateResult(
                  marks
               );

            // ==============================================
            // ACADEMIC YEAR
            // ==============================================

            const academicYear =
               item.academicYear ||
               "2026-27";

            // ==============================================
            // SAVE / UPDATE RESULT
            // ==============================================

            const result =
               await Result.findOneAndUpdate(
                  {
                     student:
                        student._id,

                     exam:
                        item.exam,

                     academicYear,
                  },

                  {
                     $set: {
                        student:
                           student._id,

                        studentId:
                           student.studentId,

                        className:
                           student.className,

                        section:
                           student.section ||
                           "",

                        exam:
                           item.exam,

                        academicYear,

                        marks,

                        total:
                           calculated.total,

                        percentage:
                           calculated.percentage,

                        grade:
                           calculated.grade,

                        resultStatus:
                           calculated.resultStatus,

                        updatedBy:
                           req.user?._id,
                     },

                     $setOnInsert: {
                        createdBy:
                           req.user?._id,
                     },
                  },

                  {
                     new: true,

                     upsert: true,

                     runValidators: true,
                  }
               );

            savedResults.push(
               result
            );

            // ==============================================
            // NOTIFICATION MODE
            // ==============================================

            const mode =
               item.notify?.mode ||
               item.notificationMode ||
               "none";

            if (
               normalizeText(mode) !==
               "none"
            ) {
               const notification =
                  await notifyOneParent({
                     student,

                     result,

                     mode,
                  });

               const anySent =
                  notification.sms ||
                  notification.email;

               if (anySent) {
                  notifications.sent++;
               } else {
                  notifications.failed++;
               }

               if (
                  notification.sms
               ) {
                  notifications.sms++;
               }

               if (
                  notification.email
               ) {
                  notifications.email++;
               }

               notifications.details.push({
                  studentId:
                     student.studentId,

                  studentName:
                     student.name,

                  sms:
                     notification.sms,

                  email:
                     notification.email,

                  smsReason:
                     notification.smsReason,

                  emailReason:
                     notification.emailReason,
               });
            }
         }

         // ------------------------------------------------
         // RESPONSE
         // ------------------------------------------------

         return res.status(200).json({
            success: true,

            message:
               "Results saved successfully.",

            count:
               savedResults.length,

            results:
               savedResults,

            notifications,
         });
      } catch (error) {
         console.error(
            "Save bulk results error:",
            error
         );

         return res.status(500).json({
            success: false,

            message:
               "Results save nahi ho paaye.",

            error:
               error.message,
         });
      }
   };


// =====================================================
// GET STUDENT RESULTS
// =====================================================

export const getStudentResults =
   async (req, res) => {
      try {
         const {
            studentId,
         } = req.params;

         const studentIdText =
            String(
               studentId
            ).trim();

         // ------------------------------------------------
         // FIND STUDENT
         // ------------------------------------------------

         let student = null;

         if (
            mongoose.Types.ObjectId.isValid(
               studentIdText
            )
         ) {
            student =
               await Student.findOne({
                  $or: [
                     {
                        _id:
                           studentIdText,
                     },

                     {
                        studentId:
                           studentIdText.toUpperCase(),
                     },
                  ],
               })
                  .select(
                     "name studentId className section"
                  )
                  .lean();
         } else {
            student =
               await Student.findOne({
                  studentId:
                     studentIdText.toUpperCase(),
               })
                  .select(
                     "name studentId className section"
                  )
                  .lean();
         }

         if (!student) {
            return res.status(404).json({
               success: false,

               message:
                  "Student not found.",
            });
         }

         // ------------------------------------------------
         // GET RESULTS
         // ------------------------------------------------

         const studentResults =
            await Result.find({
               student:
                  student._id,
            })
               .sort({
                  createdAt: -1,
               })
               .lean();

         // ------------------------------------------------
         // RESPONSE
         // ------------------------------------------------

         return res.status(200).json({
            success: true,

            student,

            results:
               studentResults,
         });
      } catch (error) {
         console.error(
            "Get student results error:",
            error
         );

         return res.status(500).json({
            success: false,

            message:
               "Student results load nahi ho paaye.",

            error:
               error.message,
         });
      }
   };