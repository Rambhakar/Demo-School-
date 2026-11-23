
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";

export const getDefaultAcademicYear = () => {
   const now = new Date();
   const year =
      now.getMonth() >= 3
         ? now.getFullYear()
         : now.getFullYear() - 1;

   return `${year}-${String(year + 1).slice(-2)}`;
};

export const normalizeClass = (value = "") => {
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

export const normalizeStream = (value = "") => {
   const text = String(value ?? "").trim();

   if (!text) return "General";

   const map = {
      general: "General",
      science: "Science",
      bio: "Bio",
      biology: "Bio",
      maths: "Maths",
      math: "Maths",
      commerce: "Commerce",
      arts: "Arts",
   };

   return map[text.toLowerCase()] || text;
};

export const normalizeSection = (value = "") =>
   String(value ?? "").trim().toUpperCase();

export const normalizeYear = (value = "") =>
   String(value ?? "").trim() || getDefaultAcademicYear();

export const isSubjectForStudent = (subject, student) => {
   const sameClass =
      normalizeClass(subject.className) ===
      normalizeClass(student.className);

   const studentStream = normalizeStream(student.stream);
   const subjectStream = normalizeStream(subject.stream);

   // General subject is common to all streams.
   // General student must not receive stream-specific subjects.
   const sameStream =
      subjectStream === "General" ||
      studentStream === subjectStream;

   const studentSection = normalizeSection(student.section);
   const subjectSection = normalizeSection(subject.section);

   // Blank subject section means all sections.
   // Blank student section only matches blank subject section.
   const sameSection =
      !subjectSection || studentSection === subjectSection;

   const sameYear =
      normalizeYear(subject.academicYear) ===
      normalizeYear(student.academicYear);

   return (
      sameClass &&
      sameStream &&
      sameSection &&
      sameYear &&
      subject.isActive !== false
   );
};

// Assign all matching active subjects to one student.
// replace=true is used when creating a new student.
// Existing manual assignments are preserved during normal sync.
export const syncStudentSubjects = async (
   studentId,
   { replace = false } = {}
) => {
   const student = await Student.findById(studentId);

   if (!student) {
      throw new Error("Student not found for subject assignment.");
   }

   const subjects = await Subject.find({
      isActive: true,
   }).lean();

   const matchingIds = subjects
      .filter((subject) => isSubjectForStudent(subject, student))
      .map((subject) => String(subject._id));

   const existingIds = replace
      ? []
      : (student.assignedSubjects || []).map((id) => String(id));

   student.assignedSubjects = [
      ...new Set([...existingIds, ...matchingIds]),
   ];

   await student.save();

   return student;
};

// When a new subject is created, add it to all matching students.
export const assignSubjectToMatchingStudents = async (subject) => {
   const students = await Student.find({
      isActive: true,
   });

   const matchingStudents = students.filter((student) =>
      isSubjectForStudent(subject, student)
   );

   if (!matchingStudents.length) return 0;

   const subjectId = String(subject._id);

   const operations = matchingStudents
      .filter(
         (student) =>
            !(student.assignedSubjects || []).some(
               (id) => String(id) === subjectId
            )
      )
      .map((student) => ({
         updateOne: {
            filter: { _id: student._id },
            update: {
               $addToSet: {
                  assignedSubjects: subject._id,
               },
            },
         },
      }));

   if (operations.length) {
      await Student.bulkWrite(operations);
   }

   return operations.length;
};
