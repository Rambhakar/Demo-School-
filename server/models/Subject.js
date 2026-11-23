
import mongoose from "mongoose";

// =====================================================
// DYNAMIC ACADEMIC YEAR
// April to March
// =====================================================

export const getDefaultAcademicYear = () => {
   const now = new Date();

   const year =
      now.getMonth() >= 3
         ? now.getFullYear()
         : now.getFullYear() - 1;

   return `${year}-${String(year + 1).slice(-2)}`;
};

// =====================================================
// CLASS NORMALIZER
// =====================================================

export const normalizeClassName = (value = "") => {
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

// =====================================================
// STREAM NORMALIZER
// =====================================================

export const normalizeStream = (value = "") => {
   const text = String(value ?? "").trim();

   if (!text) return "General";

   const streamMap = {
      general: "General",
      science: "Science",
      bio: "Bio",
      biology: "Bio",
      maths: "Maths",
      math: "Maths",
      commerce: "Commerce",
      arts: "Arts",
   };

   return streamMap[text.toLowerCase()] || text;
};

// =====================================================
// SECTION NORMALIZER
// =====================================================

export const normalizeSection = (value = "") =>
   String(value ?? "").trim().toUpperCase();

// =====================================================
// ACADEMIC YEAR NORMALIZER
// =====================================================

export const normalizeAcademicYear = (value = "") => {
   const text = String(value ?? "").trim();
   return text || getDefaultAcademicYear();
};

// =====================================================
// SUBJECT SCHEMA
// =====================================================

const subjectSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, "Subject name is required."],
         trim: true,
      },

      code: {
         type: String,
         required: [true, "Subject code is required."],
         trim: true,
         uppercase: true,
      },

      teacher: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Teacher",
         default: null,
      },

      teacherName: {
         type: String,
         default: "",
         trim: true,
      },

      room: {
         type: String,
         default: "",
         trim: true,
      },

      classesPerWeek: {
         type: Number,
         default: 0,
         min: [0, "Classes per week cannot be negative."],
      },

      description: {
         type: String,
         default: "",
         trim: true,
      },

      className: {
         type: String,
         required: [true, "Class is required."],
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
            message:
               "Class Nursery, LKG, UKG ya Class 1 se 12 ke beech honi chahiye.",
         },
      },

      stream: {
         type: String,
         default: "General",
         trim: true,
         set: normalizeStream,
      },

      section: {
         type: String,
         default: "",
         trim: true,
         set: normalizeSection,
      },

      academicYear: {
         type: String,
         default: getDefaultAcademicYear,
         trim: true,
         set: normalizeAcademicYear,
         validate: {
            validator(value) {
               return /^\d{4}-\d{2}$/.test(String(value));
            },
            message: "Invalid academic year. Example: 2026-27",
         },
      },

      icon: {
         type: String,
         default: "📚",
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

// =====================================================
// PRE VALIDATE
// =====================================================

subjectSchema.pre("validate", function () {
   if (this.className) {
      this.className = normalizeClassName(this.className);
   }

   this.stream = normalizeStream(this.stream);
   this.section = normalizeSection(this.section);
   this.academicYear = normalizeAcademicYear(this.academicYear);

   if (this.code) {
      this.code = String(this.code).trim().toUpperCase();
   }

   if (this.name) {
      this.name = String(this.name).trim();
   }

   if (this.teacherName) {
      this.teacherName = String(this.teacherName).trim();
   }
});

// =====================================================
// INDEXES
// =====================================================

subjectSchema.index({
   code: 1,
   className: 1,
   section: 1,
   academicYear: 1,
});

subjectSchema.index({
   className: 1,
   section: 1,
});

subjectSchema.index({
   className: 1,
   stream: 1,
});

subjectSchema.index({
   teacher: 1,
});

subjectSchema.index({
   academicYear: 1,
});

subjectSchema.index({
   className: 1,
   stream: 1,
   section: 1,
   academicYear: 1,
   isActive: 1,
});

// =====================================================
// MODEL
// =====================================================

const Subject =
   mongoose.models.Subject ||
   mongoose.model("Subject", subjectSchema);

export default Subject;
