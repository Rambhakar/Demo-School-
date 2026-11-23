import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema(
   {
      _id: {
         type: String,
         default: "current",
      },
      year: {
         type: String,
         required: true,
         match: /^\d{4}-\d{2}$/,
      },
   },
   { timestamps: true }
);

export default mongoose.models.AcademicYear ||
   mongoose.model("AcademicYear", academicYearSchema);