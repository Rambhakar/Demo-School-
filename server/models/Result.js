import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
   {
      // =====================================================
      // STUDENT
      // =====================================================

      student: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Student",
         required: true,
         index: true,
      },

      // =====================================================
      // STUDENT ID
      // =====================================================

      studentId: {
         type: String,
         required: true,
         trim: true,
         index: true,
      },

      // =====================================================
      // CLASS
      //
      // IMPORTANT:
      // Yahan enum nahi lagana hai.
      //
      // Examples:
      // 1
      // 5
      // 10
      // 11th Science
      // 11th Bio
      // 12th Science
      // 12th Bio
      // Class 12
      //
      // Sab allow honge.
      // =====================================================

      className: {
         type: String,
         required: true,
         trim: true,
         index: true,
      },

      // =====================================================
      // SECTION
      // =====================================================

      section: {
         type: String,
         trim: true,
         default: "",
         index: true,
      },

      // =====================================================
      // EXAMINATION
      // =====================================================

      exam: {
         type: String,
         required: true,
         trim: true,
         index: true,

         enum: [
            "First Test",
            "Class Test",
            "Unit Test 1",
            "Unit Test 2",
            "Mid Term Examination",
            "Half Yearly Examination",
            "Pre Board Examination",
            "Annual Examination",
            "Final Examination",
         ],
      },

      // =====================================================
      // ACADEMIC YEAR
      // =====================================================

      academicYear: {
         type: String,
         required: true,
         trim: true,
         index: true,
         default: "2026-27",
      },

      // =====================================================
      // MARKS
      // =====================================================

      marks: {
         type: mongoose.Schema.Types.Mixed,
         default: {},
      },

      // =====================================================
      // TOTAL
      // =====================================================

      total: {
         type: Number,
         default: 0,
         min: 0,
      },

      // =====================================================
      // PERCENTAGE
      // =====================================================

      percentage: {
         type: Number,
         default: 0,
         min: 0,
         max: 100,
      },

      // =====================================================
      // GRADE
      // =====================================================

      grade: {
         type: String,
         default: "F",
         trim: true,
      },

      // =====================================================
      // RESULT STATUS
      // =====================================================

      resultStatus: {
         type: String,
         enum: [
            "Pass",
            "Fail",
            "Pending",
         ],
         default: "Pending",
         index: true,
      },

      // =====================================================
      // PARENT NOTIFICATION
      // =====================================================

      notified: {
         sms: {
            type: Boolean,
            default: false,
         },

         email: {
            type: Boolean,
            default: false,
         },

         lastAttemptAt: {
            type: Date,
            default: null,
         },

         lastNotificationMode: {
            type: String,

            enum: [
               "both",
               "sms",
               "email",
               "none",
            ],

            default: "none",
         },

         lastSmsError: {
            type: String,
            default: "",
         },

         lastEmailError: {
            type: String,
            default: "",
         },
      },

      // =====================================================
      // CREATED BY
      // =====================================================

      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         default: null,
      },

      // =====================================================
      // UPDATED BY
      // =====================================================

      updatedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         default: null,
      },
   },

   {
      timestamps: true,
   }
);

// =====================================================
// UNIQUE RESULT
//
// Ek student ke ek exam + academic year ka
// ek hi result hoga.
//
// Example:
//
// STU1005
// Annual Examination
// 2026-27
//
// duplicate nahi banega.
// =====================================================

resultSchema.index(
   {
      student: 1,
      exam: 1,
      academicYear: 1,
   },
   {
      unique: true,
   }
);

// =====================================================
// CLASS / SECTION / EXAM SEARCH
// =====================================================

resultSchema.index({
   className: 1,
   section: 1,
   exam: 1,
   academicYear: 1,
});

// =====================================================
// STUDENT ID SEARCH
// =====================================================

resultSchema.index({
   studentId: 1,
   exam: 1,
   academicYear: 1,
});

// =====================================================
// EXPORT
// =====================================================

export default mongoose.model(
   "Result",
   resultSchema
);