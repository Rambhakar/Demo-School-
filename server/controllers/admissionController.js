
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import Admission from "../models/Admission.js";
import User from "../models/User.js";
import Student from "../models/Student.js";

import {
   generateApplicationNumber,
   generateUserId,
} from "../utils/generateId.js";

// ==========================================
// HELPERS
// ==========================================

const cleanText = (value) =>
   typeof value === "string" ? value.trim() : "";

const sendServerError = (res, error, label) => {
   console.error(`========== ${label} ==========`);
   console.error(error);
   console.error("Message:", error.message);
   console.error("Name:", error.name);
   console.error("Details:", error.errors);
   console.error("================================");

   return res.status(500).json({
      success: false,
      message:
         process.env.NODE_ENV === "development"
            ? error.message
            : "Server error. Please try again later.",
      ...(process.env.NODE_ENV === "development"
         ? {
            errorName: error.name,
            details: error.errors || null,
         }
         : {}),
   });
};

// ==========================================
// 1. CREATE ADMISSION
// PUBLIC API
// POST /api/admissions
// ==========================================

export const createAdmission = async (req, res) => {
   try {
      const studentName = cleanText(req.body.studentName);
      const fatherName = cleanText(req.body.fatherName);
      const motherName = cleanText(req.body.motherName);
      const classApplied = cleanText(req.body.classApplied);

      const dob = req.body.dob || null;
      const gender = cleanText(req.body.gender);

      const previousSchool = cleanText(req.body.previousSchool);
      const phone = cleanText(req.body.phone);
      const email = cleanText(req.body.email).toLowerCase();
      const address = cleanText(req.body.address);
      const city = cleanText(req.body.city);
      const state = cleanText(req.body.state);
      const message = cleanText(req.body.message);

      // Required fields
      if (
         !studentName ||
         !fatherName ||
         !motherName ||
         !classApplied
      ) {
         return res.status(400).json({
            success: false,
            message:
               "Student name, father name, mother name and class are required.",
         });
      }

      // Date validation
      if (dob && Number.isNaN(new Date(dob).getTime())) {
         return res.status(400).json({
            success: false,
            message: "Please enter a valid date of birth.",
         });
      }

      // Gender validation
      const allowedGenders = [
         "",
         "Male",
         "Female",
         "Other",
         "male",
         "female",
         "other",
      ];

      if (!allowedGenders.includes(gender)) {
         return res.status(400).json({
            success: false,
            message: "Please select a valid gender.",
         });
      }

      // Generate application number
      const applicationNumber =
         await generateApplicationNumber(Admission);

      // Save application
      const admission = await Admission.create({
         applicationNumber,
         studentName,
         fatherName,
         motherName,
         dob,
         gender,
         classApplied,
         previousSchool,
         phone,
         email,
         address,
         city,
         state,
         message,
         status: "pending",
      });

      return res.status(201).json({
         success: true,
         message: "Admission application submitted successfully.",
         applicationNumber,
         admission,
      });
   } catch (error) {
      if (error.code === 11000) {
         return res.status(409).json({
            success: false,
            message:
               "Duplicate application number. Please submit again.",
         });
      }

      return sendServerError(
         res,
         error,
         "CREATE ADMISSION ERROR"
      );
   }
};

// ==========================================
// 2. GET ALL ADMISSIONS
// ADMIN API
// GET /api/admissions
// ==========================================

export const getAdmissions = async (req, res) => {
   try {
      const admissions = await Admission.find()
         .sort({ createdAt: -1 })
         .lean();

      return res.status(200).json({
         success: true,
         count: admissions.length,
         admissions,
      });
   } catch (error) {
      return sendServerError(
         res,
         error,
         "GET ADMISSIONS ERROR"
      );
   }
};

// ==========================================
// 3. GET SINGLE ADMISSION
// ADMIN API
// GET /api/admissions/:id
// ==========================================

export const getAdmissionById = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid admission ID.",
         });
      }

      const admission = await Admission.findById(id)
         .populate("studentUser", "name userId role")
         .populate("studentProfile");

      if (!admission) {
         return res.status(404).json({
            success: false,
            message: "Admission not found.",
         });
      }

      return res.status(200).json({
         success: true,
         admission,
      });
   } catch (error) {
      return sendServerError(
         res,
         error,
         "GET SINGLE ADMISSION ERROR"
      );
   }
};

// ==========================================
// 4. UPDATE ADMISSION STATUS
// ADMIN API
// PATCH /api/admissions/:id/status
// ==========================================

export const updateAdmissionStatus = async (req, res) => {
   let createdUser = null;
   let createdStudent = null;

   try {
      const { id } = req.params;
      const { status, password } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid admission ID.",
         });
      }

      const allowedStatuses = [
         "pending",
         "reviewed",
         "approved",
         "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
         return res.status(400).json({
            success: false,
            message: "Invalid admission status.",
         });
      }

      const admission = await Admission.findById(id);

      if (!admission) {
         return res.status(404).json({
            success: false,
            message: "Admission not found.",
         });
      }

      // Prevent duplicate student account creation
      if (admission.status === "approved" || admission.studentUser) {
         return res.status(400).json({
            success: false,
            message: "Admission is already approved.",
         });
      }

      // Normal status update
      if (status !== "approved") {
         admission.status = status;

         await admission.save();

         return res.status(200).json({
            success: true,
            message: `Admission ${status} successfully.`,
            admission,
         });
      }

      // Approval password validation
      if (
         typeof password !== "string" ||
         password.trim().length < 6
      ) {
         return res.status(400).json({
            success: false,
            message:
               "Student password must contain at least 6 characters.",
         });
      }

      // Generate student login ID
      const studentId = await generateUserId("student");

      const hashedPassword = await bcrypt.hash(
         password.trim(),
         12
      );

      // Create User account
      createdUser = await User.create({
         name: admission.studentName,
         userId: studentId,
         password: hashedPassword,
         role: "student",
      });

      // Create Student profile
      // NOTE: These fields must match your Student.js schema.
      createdStudent = await Student.create({
         user: createdUser._id,
         studentId,

         name: admission.studentName,
         fatherName: admission.fatherName,
         motherName: admission.motherName,

         dob: admission.dob,
         gender: admission.gender,

         className: admission.classApplied,

         phone: admission.phone,
         email: admission.email,

         address: admission.address,
         city: admission.city,
         state: admission.state,
      });

      // Update Admission
      admission.status = "approved";
      admission.studentUser = createdUser._id;
      admission.studentProfile = createdStudent._id;

      await admission.save();

      return res.status(200).json({
         success: true,
         message:
            "Admission approved and student account created successfully.",

         loginDetails: {
            userId: studentId,
            password: password.trim(),
         },

         student: createdStudent,
         admission,
      });
   } catch (error) {
      console.error("ADMISSION APPROVAL ERROR:", error);

      // Rollback newly created records if approval fails
      try {
         if (createdStudent) {
            await Student.findByIdAndDelete(createdStudent._id);
         }

         if (createdUser) {
            await User.findByIdAndDelete(createdUser._id);
         }
      } catch (rollbackError) {
         console.error("ADMISSION ROLLBACK ERROR:", rollbackError);
      }

      return sendServerError(
         res,
         error,
         "UPDATE ADMISSION STATUS ERROR"
      );
   }
};

// ==========================================
// 5. DELETE ADMISSION
// ADMIN API
// DELETE /api/admissions/:id
// ==========================================

export const deleteAdmission = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({
            success: false,
            message: "Invalid admission ID.",
         });
      }

      const admission = await Admission.findById(id);

      if (!admission) {
         return res.status(404).json({
            success: false,
            message: "Admission not found.",
         });
      }

      // Deleting an admission does not delete an approved student account.
      await Admission.findByIdAndDelete(id);

      return res.status(200).json({
         success: true,
         message: "Admission application deleted successfully.",
      });
   } catch (error) {
      return sendServerError(
         res,
         error,
         "DELETE ADMISSION ERROR"
      );
   }
};
