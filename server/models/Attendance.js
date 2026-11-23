
import mongoose from "mongoose";

// ======================================================
// ATTENDANCE SCHEMA
// ======================================================

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
      lowercase: true,
      trim: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// PREVENT DUPLICATE ATTENDANCE
// Same student + same date = one attendance record
// ======================================================

attendanceSchema.index(
  { student: 1, date: 1 },
  { unique: true }
);

// ======================================================
// MODEL
// ======================================================

const Attendance =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);

export default Attendance;
