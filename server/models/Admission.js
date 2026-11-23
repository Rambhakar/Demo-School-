
import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
   {
      applicationNumber: {
         type: String,
         required: true,
         unique: true,
         trim: true,
      },

      studentName: {
         type: String,
         required: true,
         trim: true,
      },

      fatherName: {
         type: String,
         required: true,
         trim: true,
      },

      motherName: {
         type: String,
         required: true,
         trim: true,
      },

      dob: {
         type: Date,
         default: null,
      },

      gender: {
         type: String,
         enum: ["Male", "Female", "Other", "male", "female", "other", ""],
         default: "",
      },

      classApplied: {
         type: String,
         required: true,
         trim: true,
      },

      previousSchool: {
         type: String,
         default: "",
         trim: true,
      },

      phone: {
         type: String,
         default: "",
         trim: true,
      },

      email: {
         type: String,
         default: "",
         trim: true,
         lowercase: true,
      },

      address: {
         type: String,
         default: "",
         trim: true,
      },

      city: {
         type: String,
         default: "",
         trim: true,
      },

      state: {
         type: String,
         default: "",
         trim: true,
      },

      message: {
         type: String,
         default: "",
         trim: true,
      },

      status: {
         type: String,
         enum: ["pending", "reviewed", "approved", "rejected"],
         default: "pending",
      },

      studentUser: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         default: null,
      },

      studentProfile: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Student",
         default: null,
      },
   },
   {
      timestamps: true,
   }
);

admissionSchema.index({ status: 1, createdAt: -1 });

const Admission = mongoose.model("Admission", admissionSchema);

export default Admission;
