
import mongoose from "mongoose";

// ======================================================
// TEACHER CLASS ASSIGNMENT SCHEMA
// ======================================================

const teachingAssignmentSchema = new mongoose.Schema(
   {
      className: {
         type: String,
         required: true,
         trim: true,
      },

      // Empty array means all sections of this class
      sections: {
         type: [String],
         default: [],
      },

      academicYear: {
         type: String,
         required: true,
         trim: true,
      },

      isActive: {
         type: Boolean,
         default: true,
      },
   },
   { _id: false }
);

// ======================================================
// TEACHER SCHEMA
// ======================================================

const teacherSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
         unique: true,
      },

      teacherId: {
         type: String,
         required: true,
         unique: true,
         uppercase: true,
         trim: true,
      },

      name: {
         type: String,
         required: true,
         trim: true,
      },

      fatherName: {
         type: String,
         trim: true,
      },

      photo: {
         type: String,
         default: "",
      },

      subject: {
         type: String,
         required: true,
         trim: true,
      },

      subjects: {
         type: [String],
         default: [],
      },

      // Legacy fields for compatibility
      teachingClasses: {
         type: [String],
         default: [],
      },

      teachingSections: {
         type: [String],
         default: [],
      },

      // Structured class and section assignments
      teachingAssignments: {
         type: [teachingAssignmentSchema],
         default: [],
      },

      phone: {
         type: String,
         required: true,
         trim: true,
      },

      email: {
         type: String,
         trim: true,
         lowercase: true,
      },

      qualification: {
         type: String,
         trim: true,
      },

      address: {
         type: String,
         trim: true,
      },

      city: {
         type: String,
         trim: true,
      },

      state: {
         type: String,
         trim: true,
      },

      joiningDate: {
         type: Date,
         default: Date.now,
      },

      isActive: {
         type: Boolean,
         default: true,
      },
   },
   {
      timestamps: true,
   }
);

export default mongoose.model("Teacher", teacherSchema);
