
import mongoose from "mongoose";

export const getDefaultAcademicYear = () => {
   const now = new Date();

   const year =
      now.getMonth() >= 3
         ? now.getFullYear()
         : now.getFullYear() - 1;

   return `${year}-${String(year + 1).slice(-2)}`;
};

const normalizeClassName = (value = "") => {
   const text = String(value ?? "").trim().toLowerCase();

   const aliases = {
      nursery: "Nursery",
      nur: "Nursery",
      lkg: "LKG",
      "lower kg": "LKG",
      "lower kindergarten": "LKG",
      ukg: "UKG",
      "upper kg": "UKG",
      "upper kindergarten": "UKG",
   };

   if (aliases[text]) return aliases[text];

   const match = text.match(
      /(?:^|\D)(1[0-2]|[1-9])(?:st|nd|rd|th)?(?:\D|$)/i
   );

   return match ? match[1] : String(value ?? "").trim();
};

const studentSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
         unique: true,
      },

      studentId: {
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
      },

      gender: {
         type: String,
         enum: ["male", "female", "other"],
         lowercase: true,
         trim: true,
      },

      photo: {
         type: String,
         default: "",
         trim: true,
      },

      className: {
         type: String,
         required: true,
         trim: true,
         set: normalizeClassName,
         validate: {
            validator(value) {
               const text = String(value ?? "").trim();

               return (
                  ["Nursery", "LKG", "UKG"].includes(text) ||
                  /^(1[0-2]|[1-9])$/.test(text)
               );
            },
            message: "Valid classes: Nursery, LKG, UKG and 1-12.",
         },
      },

      academicYear: {
         type: String,
         trim: true,
         default: getDefaultAcademicYear,
         match: [
            /^\d{4}-\d{2}$/,
            "Invalid academic year. Example: 2026-27",
         ],
      },

      stream: {
         type: String,
         default: "General",
         trim: true,
      },

      section: {
         type: String,
         default: "",
         trim: true,
         uppercase: true,
      },

      rollNumber: {
         type: String,
         trim: true,
      },

      assignedSubjects: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
         },
      ],

      phone: {
         type: String,
         trim: true,
      },

      email: {
         type: String,
         lowercase: true,
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

      admissionDate: {
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

studentSchema.index({
   className: 1,
   section: 1,
});

studentSchema.index({
   className: 1,
   rollNumber: 1,
});

studentSchema.index({
   isActive: 1,
});

studentSchema.index({
   academicYear: 1,
   className: 1,
   stream: 1,
   section: 1,
});

const Student =
   mongoose.models.Student ||
   mongoose.model("Student", studentSchema);

export default Student;
