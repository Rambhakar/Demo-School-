import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// VITE_API_URL may be either the server root or end with /api.
// Normalize it so endpoint paths below never become /api/api/...
const API_URL = (
   import.meta.env.VITE_API_URL || "http://localhost:5000"
)
   .replace(/\/+$/, "")
   .replace(/\/api$/i, "");

/* =========================================================
   OPTIONS
========================================================= */

const CLASS_OPTIONS = [
   "1",
   "2",
   "3",
   "4",
   "5",
   "6",
   "7",
   "8",
   "9",
   "10",
   "11",
   "12",
];

const STREAM_OPTIONS = [
   "General",
   "Science",
   "Bio",
   "Maths",
   "Commerce",
   "Arts",
];

const SUBJECT_OPTIONS = [
   "Hindi",
   "English",
   "Mathematics",
   "Physics",
   "Chemistry",
   "Biology",
   "Computer",
   "Social Science",
   "Science",
   "Accountancy",
   "Business Studies",
   "Economics",
   "History",
   "Geography",
   "Political Science",
];

const SECTION_OPTIONS = [
   "A",
   "B",
   "C",
   "D",
   "E",
];

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
   name: "",
   fatherName: "",
   motherName: "",

   dob: "",
   gender: "",

   className: "",
   stream: "",
   section: "",
   rollNumber: "",

   phone: "",
   email: "",

   address: "",
   city: "",
   state: "",

   password: "",

   photo: "",

   /* STUDENT */
   assignedSubjects: [],

   /* TEACHER */
   subjects: [],
   teachingClasses: [],
   teachingSections: [],

   qualification: "",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CreateUser() {
   const navigate = useNavigate();

   const [userType, setUserType] =
      useState("student");

   const [formData, setFormData] =
      useState(INITIAL_FORM);

   const [availableSubjects, setAvailableSubjects] =
      useState([]);

   const [loadingSubjects, setLoadingSubjects] =
      useState(false);

   const [subjectSearch, setSubjectSearch] =
      useState("");

   const [showPassword, setShowPassword] =
      useState(false);

   const [loading, setLoading] =
      useState(false);

   const [error, setError] =
      useState("");

   const [success, setSuccess] =
      useState("");

   const [createdUser, setCreatedUser] =
      useState(null);

   /* =====================================================
      TOKEN
   ===================================================== */

   const getToken = () => {
      return (
         localStorage.getItem("schoolToken") ||
         sessionStorage.getItem("schoolToken")
      );
   };

   /* =====================================================
      CLASS NUMBER
   ===================================================== */

   const getClassNumber = (value = "") => {
      const text = String(value)
         .trim()
         .toLowerCase();

      const match = text.match(
         /(?:^|\D)(1[0-2]|[1-9])(?:st|nd|rd|th)?(?:\D|$)/i
      );

      return match ? match[1] : "";
   };

   /* =====================================================
      LOAD SUBJECTS
   ===================================================== */

   const loadSubjects = async (
      selectedClass = "",
      selectedStream = "",
      selectedSection = ""
   ) => {
      try {
         setLoadingSubjects(true);
         setError("");

         const token = getToken();

         if (!token) {
            setAvailableSubjects([]);
            return;
         }

         const classNumber =
            getClassNumber(
               selectedClass
            );

         if (!classNumber) {
            setAvailableSubjects([]);
            return;
         }

         const params =
            new URLSearchParams();

         params.set(
            "className",
            classNumber
         );

         params.set(
            "academicYear",
            "2026-27"
         );

         if (selectedStream) {
            params.set(
               "stream",
               selectedStream
            );
         }

         if (selectedSection) {
            params.set(
               "section",
               selectedSection
            );
         }

         const response =
            await fetch(
               `${API_URL}/api/subjects?${params.toString()}`,
               {
                  method: "GET",

                  headers: {
                     Authorization:
                        `Bearer ${token}`,

                     Accept:
                        "application/json",
                  },
               }
            );

         const data =
            await response.json();

         console.log(
            "📚 SUBJECT API:",
            data
         );

         if (!response.ok) {
            throw new Error(
               data.message ||
               "Subjects load nahi ho paaye."
            );
         }

         const subjects =
            Array.isArray(
               data.subjects
            )
               ? data.subjects
               : Array.isArray(
                  data.data
               )
                  ? data.data
                  : [];

         setAvailableSubjects(subjects);

         // AUTOMATIC CURRICULUM:
         // Subjects returned for this Class + Stream + Section are
         // selected by default. Admin can still edit the selection.
         setFormData((previous) => {
            const sameClass =
               getClassNumber(previous.className) ===
               getClassNumber(selectedClass);
            const sameStream =
               String(previous.stream || "General").toLowerCase() ===
               String(selectedStream || "General").toLowerCase();
            const sameSection =
               String(previous.section || "").toLowerCase() ===
               String(selectedSection || "").toLowerCase();

            if (
               userType !== "student" ||
               !sameClass ||
               !sameStream ||
               !sameSection
            ) {
               return previous;
            }

            return {
               ...previous,
               assignedSubjects: subjects
                  .map((subject) => subject?._id)
                  .filter(Boolean),
            };
         });

      } catch (err) {
         console.error(
            "Load Subjects Error:",
            err
         );

         setAvailableSubjects([]);

         setError(
            err.message ||
            "Subjects load nahi ho paaye."
         );

      } finally {
         setLoadingSubjects(false);
      }
   };

   /* =====================================================
      LOAD SUBJECTS WHEN CLASS / STREAM / SECTION CHANGES
   ===================================================== */

   useEffect(() => {
      if (
         userType === "student" &&
         formData.className
      ) {
         loadSubjects(
            formData.className,
            formData.stream,
            formData.section
         );
      } else {
         setAvailableSubjects([]);
      }
   }, [
      userType,
      formData.className,
      formData.stream,
      formData.section,
   ]);

   /* =====================================================
      HANDLE INPUT
   ===================================================== */

   const handleChange = (e) => {
      const {
         name,
         value,
      } = e.target;

      setFormData(
         (previous) => {

            const updated = {
               ...previous,
               [name]: value,
            };

            /*
               Class / stream / section change
               hone par selected subjects reset.
            */

            if (
               name === "className" ||
               name === "stream" ||
               name === "section"
            ) {
               updated.assignedSubjects = [];
            }

            // Stream is mainly relevant for Classes 11-12.
            // For Classes 1-10, keep it as General automatically.
            if (name === "className") {
               const classNumber = getClassNumber(value);
               if (classNumber && Number(classNumber) <= 10) {
                  updated.stream = "General";
               }
            }

            return updated;
         }
      );

      setError("");
      setSuccess("");
   };

   /* =====================================================
      ARRAY TOGGLE
   ===================================================== */

   const toggleArrayValue = (
      field,
      value
   ) => {

      setFormData(
         (previous) => {

            const current =
               previous[field] || [];

            const exists =
               current.includes(
                  value
               );

            return {
               ...previous,

               [field]: exists
                  ? current.filter(
                     (item) =>
                        item !== value
                  )
                  : [
                     ...current,
                     value,
                  ],
            };
         }
      );

      setError("");
      setSuccess("");
   };

   /* =====================================================
      STUDENT SUBJECT FILTER
   ===================================================== */

   const getStudentSubjects = () => {

      if (
         !formData.className ||
         !Array.isArray(
            availableSubjects
         )
      ) {
         return [];
      }

      const selectedClass =
         getClassNumber(
            formData.className
         );

      const selectedStream =
         String(
            formData.stream || ""
         )
            .trim()
            .toLowerCase();

      const selectedSection =
         String(
            formData.section || ""
         )
            .trim()
            .toLowerCase();

      return availableSubjects.filter(
         (subject) => {

            /*
               CLASS
            */

            const subjectClass =
               getClassNumber(
                  subject.className
               );

            if (
               !selectedClass ||
               !subjectClass ||
               selectedClass !==
               subjectClass
            ) {
               return false;
            }

            /*
               STREAM

               Agar subject me stream nahi hai,
               to common subject maana jayega.
            */

            const subjectStream =
               String(
                  subject.stream || ""
               )
                  .trim()
                  .toLowerCase();

            if (
               subjectStream &&
               subjectStream !==
               "general"
            ) {

               if (
                  !selectedStream
               ) {
                  return false;
               }

               if (
                  subjectStream !==
                  selectedStream
               ) {
                  return false;
               }
            }

            /*
               SECTION

               Blank section =
               all sections.
            */

            const subjectSection =
               String(
                  subject.section || ""
               )
                  .trim()
                  .toLowerCase();

            if (
               subjectSection
            ) {

               if (
                  !selectedSection
               ) {
                  return false;
               }

               if (
                  subjectSection !==
                  selectedSection
               ) {
                  return false;
               }
            }

            return true;
         }
      );
   };

   /* =====================================================
      FILTERED SUBJECTS
   ===================================================== */

   const studentSubjects =
      useMemo(
         () => {

            const subjects =
               getStudentSubjects();

            const search =
               subjectSearch
                  .trim()
                  .toLowerCase();

            if (!search) {
               return subjects;
            }

            return subjects.filter(
               (subject) => {

                  const name =
                     String(
                        subject.name ||
                        subject.subjectName ||
                        ""
                     ).toLowerCase();

                  const code =
                     String(
                        subject.code ||
                        ""
                     ).toLowerCase();

                  return (
                     name.includes(
                        search
                     ) ||
                     code.includes(
                        search
                     )
                  );
               }
            );
         },
         [
            availableSubjects,
            formData.className,
            formData.stream,
            formData.section,
            subjectSearch,
         ]
      );

   /* =====================================================
      SELECT ALL STUDENT SUBJECTS
   ===================================================== */

   const selectAllStudentSubjects = () => {

      const ids =
         studentSubjects
            .map(
               (subject) =>
                  subject._id
            )
            .filter(Boolean);

      setFormData(
         (previous) => ({
            ...previous,

            assignedSubjects: Array.from(
               new Set([
                  ...previous.assignedSubjects,
                  ...ids,
               ])
            ),
         })
      );
   };

   /* =====================================================
      CLEAR STUDENT SUBJECTS
   ===================================================== */

   const clearStudentSubjects = () => {
      setFormData(
         (previous) => ({
            ...previous,
            assignedSubjects: [],
         })
      );
   };

   /* =====================================================
      PHOTO
   ===================================================== */

   const handlePhotoChange = (e) => {

      const file =
         e.target.files?.[0];

      if (!file) {
         return;
      }

      if (
         !file.type.startsWith(
            "image/"
         )
      ) {
         setError(
            "Sirf image file select karo."
         );

         e.target.value = "";

         return;
      }

      if (
         file.size >
         3 * 1024 * 1024
      ) {
         setError(
            "Photo 3MB se chhoti honi chahiye."
         );

         e.target.value = "";

         return;
      }

      const reader =
         new FileReader();

      reader.onload = () => {

         setFormData(
            (previous) => ({
               ...previous,
               photo:
                  reader.result,
            })
         );
      };

      reader.onerror = () => {
         setError(
            "Photo read nahi ho paayi."
         );
      };

      reader.readAsDataURL(
         file
      );

      setError("");
   };

   /* =====================================================
      REMOVE PHOTO
   ===================================================== */

   const removePhoto = () => {
      setFormData(
         (previous) => ({
            ...previous,
            photo: "",
         })
      );
   };

   /* =====================================================
      USER TYPE
   ===================================================== */

   const handleUserTypeChange = (
      type
   ) => {

      setUserType(type);

      setFormData({
         ...INITIAL_FORM,
      });

      setAvailableSubjects([]);

      setSubjectSearch("");

      setError("");
      setSuccess("");
      setCreatedUser(null);
   };

   /* =====================================================
      RESET
   ===================================================== */

   const resetForm = () => {

      setFormData({
         ...INITIAL_FORM,
      });

      setAvailableSubjects([]);

      setSubjectSearch("");

      setError("");
      setSuccess("");
      setCreatedUser(null);
   };

   /* =====================================================
      SUBMIT
   ===================================================== */

   const handleSubmit = async (
      e
   ) => {

      e.preventDefault();

      try {

         setLoading(true);
         setError("");
         setSuccess("");
         setCreatedUser(null);

         const token =
            getToken();

         if (!token) {
            navigate("/");
            return;
         }

         /*
            COMMON VALIDATION
         */

         if (
            !formData.name.trim()
         ) {
            throw new Error(
               "Name enter karo."
            );
         }

         if (
            !formData.phone.trim()
         ) {
            throw new Error(
               "Phone number enter karo."
            );
         }

         if (
            !formData.password
         ) {
            throw new Error(
               "Password enter karo."
            );
         }

         if (
            formData.password.length <
            6
         ) {
            throw new Error(
               "Password kam se kam 6 characters ka hona chahiye."
            );
         }

         /*
            STUDENT
         */

         if (
            userType === "student"
         ) {

            if (
               !formData.fatherName.trim()
            ) {
               throw new Error(
                  "Father name enter karo."
               );
            }

            if (
               !formData.motherName.trim()
            ) {
               throw new Error(
                  "Mother name enter karo."
               );
            }

            if (
               !formData.className
            ) {
               throw new Error(
                  "Student ki class select karo."
               );
            }

            const studentClassNumber =
               Number(getClassNumber(formData.className));

            if (
               studentClassNumber >= 11 &&
               !formData.stream
            ) {
               throw new Error(
                  "Class 11-12 ke student ka stream select karo."
               );
            }

            if (
               !formData.section
            ) {
               throw new Error(
                  "Student ka section select karo."
               );
            }

            if (
               !formData.rollNumber.trim()
            ) {
               throw new Error(
                  "Student ka roll number enter karo."
               );
            }
         }

         /*
            TEACHER
         */

         if (
            userType === "teacher"
         ) {

            if (
               !formData.subjects.length
            ) {
               throw new Error(
                  "Teacher ka kam se kam ek subject select karo."
               );
            }

            if (
               !formData.qualification.trim()
            ) {
               throw new Error(
                  "Teacher ki qualification enter karo."
               );
            }

            if (
               !formData.teachingClasses.length
            ) {
               throw new Error(
                  "Teacher ki kam se kam ek class select karo."
               );
            }
         }

         /*
            ENDPOINT
         */

         const endpoint =
            userType === "student"
               ? `${API_URL}/api/admin/students`
               : `${API_URL}/api/admin/teachers`;

         /*
            PAYLOAD
         */

         let payload;

         if (
            userType === "student"
         ) {

            payload = {

               name:
                  formData.name.trim(),

               fatherName:
                  formData.fatherName.trim(),

               motherName:
                  formData.motherName.trim(),

               dob:
                  formData.dob ||
                  undefined,

               gender:
                  formData.gender,

               className:
                  formData.className,

               stream:
                  formData.stream,

               section:
                  formData.section,

               rollNumber:
                  formData.rollNumber.trim(),

               assignedSubjects:
                  formData.assignedSubjects,

               photo:
                  formData.photo,

               phone:
                  formData.phone.trim(),

               email:
                  formData.email.trim(),

               address:
                  formData.address.trim(),

               city:
                  formData.city.trim(),

               state:
                  formData.state.trim(),

               password:
                  formData.password,
            };

         } else {

            payload = {

               name:
                  formData.name.trim(),

               fatherName:
                  formData.fatherName.trim(),

               subject:
                  formData.subjects[0],

               subjects:
                  formData.subjects,

               teachingClasses:
                  formData.teachingClasses,

               teachingSections:
                  formData.teachingSections,

               qualification:
                  formData.qualification.trim(),

               photo:
                  formData.photo,

               phone:
                  formData.phone.trim(),

               email:
                  formData.email.trim(),

               address:
                  formData.address.trim(),

               city:
                  formData.city.trim(),

               state:
                  formData.state.trim(),

               joiningDate:
                  new Date().toISOString(),

               password:
                  formData.password,
            };
         }

         /*
            API
         */

         const response =
            await fetch(
               endpoint,
               {
                  method: "POST",

                  headers: {
                     "Content-Type":
                        "application/json",

                     Authorization:
                        `Bearer ${token}`,
                  },

                  body:
                     JSON.stringify(
                        payload
                     ),
               }
            );

         /*
            AUTH ERROR
         */

         if (
            response.status === 401 ||
            response.status === 403
         ) {

            localStorage.removeItem(
               "schoolToken"
            );

            localStorage.removeItem(
               "schoolUser"
            );

            sessionStorage.removeItem(
               "schoolToken"
            );

            sessionStorage.removeItem(
               "schoolUser"
            );

            navigate("/");

            return;
         }

         const data =
            await response.json();

         if (
            !response.ok ||
            !data.success
         ) {
            throw new Error(
               data.message ||
               `Failed to create ${userType}`
            );
         }

         const created =
            data.student ||
            data.teacher ||
            data.user;

         const resultUser = {

            userId:
               data.userId ||
               created?.studentId ||
               created?.teacherId ||
               created?.userId ||
               "-",

            name:
               formData.name,

            password:
               formData.password,

            role:
               userType,

            photo:
               formData.photo,

            className:
               formData.className,

            stream:
               formData.stream,

            section:
               formData.section,

            rollNumber:
               formData.rollNumber,

            assignedSubjects:
               formData.assignedSubjects,

            subjects:
               formData.subjects,

            teachingClasses:
               formData.teachingClasses,

            teachingSections:
               formData.teachingSections,
         };

         setCreatedUser(
            resultUser
         );

         setSuccess(
            `${userType === "student"
               ? "Student"
               : "Teacher"
            } account created successfully.`
         );

         setFormData({
            ...INITIAL_FORM,
         });

         setAvailableSubjects([]);

         setSubjectSearch("");

      } catch (err) {

         console.error(
            "Create User Error:",
            err
         );

         setError(
            err.message ||
            "Something went wrong."
         );

      } finally {

         setLoading(false);
      }
   };

   /* =====================================================
      UI
   ===================================================== */

   return (
      <div className="min-h-screen overflow-x-hidden bg-slate-950">

         {/* =================================================
            ANIMATED BACKGROUND
         ================================================= */}

         <style>{`
            @keyframes floatOne {
               0%, 100% {
                  transform: translate3d(0, 0, 0) scale(1);
               }
               50% {
                  transform: translate3d(40px, -30px, 0) scale(1.08);
               }
            }

            @keyframes floatTwo {
               0%, 100% {
                  transform: translate3d(0, 0, 0);
               }
               50% {
                  transform: translate3d(-35px, 25px, 0);
               }
            }

            @keyframes glowPulse {
               0%, 100% {
                  opacity: .35;
               }
               50% {
                  opacity: .7;
               }
            }

            @keyframes slideUp {
               from {
                  opacity: 0;
                  transform: translateY(18px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }

            .create-user-float-one {
               animation: floatOne 9s ease-in-out infinite;
            }

            .create-user-float-two {
               animation: floatTwo 11s ease-in-out infinite;
            }

            .create-user-glow {
               animation: glowPulse 4s ease-in-out infinite;
            }

            .create-user-slide {
               animation: slideUp .55s ease-out both;
            }
         `}</style>

         <div className="pointer-events-none fixed inset-0 overflow-hidden">

            <div className="create-user-float-one absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="create-user-float-two absolute -right-32 top-72 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="create-user-glow absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

         </div>

         {/* =================================================
            HEADER
         ================================================= */}

         <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

               <div>

                  <button
                     type="button"
                     onClick={() =>
                        navigate(
                           "/admin/dashboard"
                        )
                     }
                     className="mb-2 text-sm font-bold text-blue-300 transition hover:text-white"
                  >
                     ← Back to Dashboard
                  </button>

                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                     Create User
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                     Student aur Teacher accounts
                     professionally manage karo.
                  </p>

               </div>

               <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-right sm:block">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                     Account Type
                  </p>

                  <p className="mt-1 font-black text-white">
                     {userType ===
                        "student"
                        ? "🎓 Student"
                        : "👨‍🏫 Teacher"}
                  </p>

               </div>

            </div>

         </header>

         {/* =================================================
            MAIN
         ================================================= */}

         <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* =================================================
               USER TYPE CARDS
            ================================================= */}

            <div className="mb-8 grid gap-5 md:grid-cols-2">

               <button
                  type="button"
                  onClick={() =>
                     handleUserTypeChange(
                        "student"
                     )
                  }
                  className={`group relative overflow-hidden rounded-[2rem] border p-7 text-left transition-all duration-300 hover:-translate-y-1 ${userType === "student"
                     ? "border-blue-400/60 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 shadow-2xl shadow-blue-500/10"
                     : "border-white/10 bg-white/[0.04] hover:border-blue-400/30"
                     }`}
               >

                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl transition group-hover:scale-150" />

                  <div className="relative">

                     <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-4xl ring-1 ring-blue-400/20 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                        🎓
                     </div>

                     <h2 className="text-2xl font-black text-white">
                        Create Student
                     </h2>

                     <p className="mt-2 text-sm text-slate-400">
                        Class, stream, section,
                        subjects aur complete
                        student profile.
                     </p>

                     <div className="mt-5 flex flex-wrap gap-2">

                        <Badge text="Class" />
                        <Badge text="Stream" />
                        <Badge text="Section" />
                        <Badge text="Subjects" />

                     </div>

                  </div>

               </button>

               <button
                  type="button"
                  onClick={() =>
                     handleUserTypeChange(
                        "teacher"
                     )
                  }
                  className={`group relative overflow-hidden rounded-[2rem] border p-7 text-left transition-all duration-300 hover:-translate-y-1 ${userType === "teacher"
                     ? "border-purple-400/60 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 shadow-2xl shadow-purple-500/10"
                     : "border-white/10 bg-white/[0.04] hover:border-purple-400/30"
                     }`}
               >

                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl transition group-hover:scale-150" />

                  <div className="relative">

                     <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 text-4xl ring-1 ring-purple-400/20 transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                        👨‍🏫
                     </div>

                     <h2 className="text-2xl font-black text-white">
                        Create Teacher
                     </h2>

                     <p className="mt-2 text-sm text-slate-400">
                        Multiple subjects, classes
                        aur sections define karo.
                     </p>

                     <div className="mt-5 flex flex-wrap gap-2">

                        <Badge text="Subjects" />
                        <Badge text="Classes" />
                        <Badge text="Sections" />

                     </div>

                  </div>

               </button>

            </div>

            {/* =================================================
               SUCCESS
            ================================================= */}

            {success &&
               createdUser && (
                  <div className="create-user-slide mb-8 overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-6 shadow-2xl">

                     <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-2xl">
                           ✓
                        </div>

                        <div>

                           <h3 className="text-xl font-black text-emerald-300">
                              Account Created Successfully
                           </h3>

                           <p className="mt-1 text-sm text-emerald-200/70">
                              Login details ko safe
                              jagah par note kar lena.
                           </p>

                        </div>

                     </div>

                     <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <DarkInfo
                           label="Name"
                           value={
                              createdUser.name
                           }
                        />

                        <DarkInfo
                           label="Login ID"
                           value={
                              createdUser.userId
                           }
                        />

                        <DarkInfo
                           label="Password"
                           value={
                              createdUser.password
                           }
                        />

                        <DarkInfo
                           label="Role"
                           value={
                              createdUser.role
                           }
                        />

                     </div>

                  </div>
               )}

            {/* =================================================
               ERROR
            ================================================= */}

            {error && (
               <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 font-semibold text-red-300">
                  ❌ {error}
               </div>
            )}

            {/* =================================================
               FORM
            ================================================= */}

            <form
               onSubmit={
                  handleSubmit
               }
               className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white p-5 shadow-2xl sm:p-8"
            >

               <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-5 text-white shadow-xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                     <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/10">
                           {userType === "student" ? "🎓" : "👨‍🏫"}
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                              School Management System
                           </p>
                           <h2 className="mt-1 text-xl font-black sm:text-2xl">
                              {userType === "student"
                                 ? "New Student Registration"
                                 : "New Teacher Registration"}
                           </h2>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                           🔒 Secure Account
                        </span>
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-200">
                           ✦ 2026-27
                        </span>
                     </div>
                  </div>
               </div>

               {/* =================================================
                  BASIC INFORMATION
               ================================================= */}

               <section>

                  <SectionTitle
                     icon="👤"
                     title={
                        userType ===
                           "student"
                           ? "Student Information"
                           : "Teacher Information"
                     }
                     subtitle="Basic information carefully fill karo."
                  />

                  <div className="mt-6 grid gap-5 md:grid-cols-2">

                     <Input
                        label="Full Name"
                        name="name"
                        value={
                           formData.name
                        }
                        onChange={
                           handleChange
                        }
                        placeholder="Enter full name"
                        required
                     />

                     {userType ===
                        "student" && (
                           <>
                              <Input
                                 label="Father Name"
                                 name="fatherName"
                                 value={
                                    formData.fatherName
                                 }
                                 onChange={
                                    handleChange
                                 }
                                 placeholder="Enter father name"
                                 required
                              />

                              <Input
                                 label="Mother Name"
                                 name="motherName"
                                 value={
                                    formData.motherName
                                 }
                                 onChange={
                                    handleChange
                                 }
                                 placeholder="Enter mother name"
                                 required
                              />

                              <Input
                                 label="Date of Birth"
                                 name="dob"
                                 type="date"
                                 value={
                                    formData.dob
                                 }
                                 onChange={
                                    handleChange
                                 }
                              />

                              <Select
                                 label="Gender"
                                 name="gender"
                                 value={
                                    formData.gender
                                 }
                                 onChange={
                                    handleChange
                                 }
                                 options={[
                                    {
                                       value:
                                          "",
                                       label:
                                          "Select Gender",
                                    },
                                    {
                                       value:
                                          "male",
                                       label:
                                          "Male",
                                    },
                                    {
                                       value:
                                          "female",
                                       label:
                                          "Female",
                                    },
                                    {
                                       value:
                                          "other",
                                       label:
                                          "Other",
                                    },
                                 ]}
                              />
                           </>
                        )}

                     <Input
                        label="Phone"
                        name="phone"
                        value={
                           formData.phone
                        }
                        onChange={
                           handleChange
                        }
                        placeholder="Enter phone number"
                        required
                     />

                     <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={
                           formData.email
                        }
                        onChange={
                           handleChange
                        }
                        placeholder="Enter email"
                     />

                  </div>

               </section>

               {/* =================================================
                  PHOTO
               ================================================= */}

               <section className="mt-10 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">

                  <SectionTitle
                     icon="📸"
                     title="Profile Photo"
                     subtitle="Student ya teacher ki photo add karo."
                  />

                  <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">

                     {formData.photo ? (

                        <div className="relative">

                           <img
                              src={
                                 formData.photo
                              }
                              alt="Profile"
                              className="h-32 w-32 rounded-3xl border-4 border-white object-cover shadow-xl transition duration-300 hover:scale-105"
                           />

                           <button
                              type="button"
                              onClick={
                                 removePhoto
                              }
                              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-lg font-black text-white shadow-lg transition hover:scale-110"
                           >
                              ×
                           </button>

                        </div>

                     ) : (

                        <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white text-5xl shadow-lg">
                           {userType ===
                              "student"
                              ? "🎓"
                              : "👨‍🏫"}
                        </div>

                     )}

                     <div>

                        <input
                           type="file"
                           accept="image/png,image/jpeg,image/webp"
                           onChange={
                              handlePhotoChange
                           }
                           className="block w-full text-sm"
                        />

                        <p className="mt-2 text-xs font-semibold text-slate-500">
                           JPG, PNG or WEBP.
                           Maximum 3MB.
                        </p>

                     </div>

                  </div>

               </section>

               {/* =================================================
                  STUDENT ACADEMIC
               ================================================= */}

               {userType ===
                  "student" && (
                     <section className="mt-10 overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">

                        <SectionTitle
                           icon="🎓"
                           title="Academic Details"
                           subtitle="Student ki class, stream, section aur subjects verify karo."
                        />

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                           <Select
                              label="Class"
                              name="className"
                              value={
                                 formData.className
                              }
                              onChange={
                                 handleChange
                              }
                              required
                              options={[
                                 {
                                    value:
                                       "",
                                    label:
                                       "Select Class",
                                 },
                                 ...CLASS_OPTIONS.map(
                                    (
                                       item
                                    ) => ({
                                       value:
                                          item,
                                       label:
                                          `Class ${item}`,
                                    })
                                 ),
                              ]}
                           />

                           <Select
                              label="Stream"
                              name="stream"
                              value={
                                 formData.stream
                              }
                              onChange={
                                 handleChange
                              }
                              required
                              options={[
                                 {
                                    value:
                                       "",
                                    label:
                                       "Select Stream",
                                 },
                                 ...STREAM_OPTIONS.map(
                                    (
                                       item
                                    ) => ({
                                       value:
                                          item,
                                       label:
                                          item,
                                    })
                                 ),
                              ]}
                           />

                           <Select
                              label="Section"
                              name="section"
                              value={
                                 formData.section
                              }
                              onChange={
                                 handleChange
                              }
                              required
                              options={[
                                 {
                                    value:
                                       "",
                                    label:
                                       "Select Section",
                                 },
                                 ...SECTION_OPTIONS.map(
                                    (
                                       item
                                    ) => ({
                                       value:
                                          item,
                                       label:
                                          `Section ${item}`,
                                    })
                                 ),
                              ]}
                           />

                           <Input
                              label="Roll Number"
                              name="rollNumber"
                              value={
                                 formData.rollNumber
                              }
                              onChange={
                                 handleChange
                              }
                              placeholder="e.g. 25"
                              required
                           />

                        </div>

                        {/* =================================================
                        STUDENT SUBJECTS
                     ================================================= */}

                        <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">

                           {/* SUBJECT HEADER */}

                           <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">

                              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                 <div>

                                    <div className="flex items-center gap-3">

                                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
                                          📚
                                       </div>

                                       <div>

                                          <h4 className="text-xl font-black">
                                             Student Subjects
                                          </h4>

                                          <p className="text-sm text-blue-100">
                                             Class ke available
                                             subjects select karo.
                                          </p>

                                       </div>

                                    </div>

                                 </div>

                                 <div className="flex items-center gap-3">

                                    <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur">

                                       <p className="text-2xl font-black">
                                          {
                                             formData.assignedSubjects
                                                .length
                                          }
                                       </p>

                                       <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                                          Selected
                                       </p>

                                    </div>

                                 </div>

                              </div>

                           </div>

                           {/* SUBJECT CONTENT */}

                           <div className="p-5 sm:p-6">

                              {/* FILTER STATUS */}

                              <div className="mb-5 flex flex-wrap gap-2">

                                 <StatusPill
                                    label="Class"
                                    value={
                                       formData.className ||
                                       "Pending"
                                    }
                                 />

                                 <StatusPill
                                    label="Stream"
                                    value={
                                       formData.stream ||
                                       "Pending"
                                    }
                                 />

                                 <StatusPill
                                    label="Section"
                                    value={
                                       formData.section ||
                                       "Pending"
                                    }
                                 />

                                 <StatusPill
                                    label="Year"
                                    value="2026-27"
                                 />

                              </div>

                              {/* SEARCH + ACTIONS */}

                              {formData.className &&
                                 formData.stream &&
                                 formData.section && (
                                    <div className="mb-5 flex flex-col gap-3 lg:flex-row">

                                       <div className="relative flex-1">

                                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                                             🔎
                                          </span>

                                          <input
                                             value={
                                                subjectSearch
                                             }
                                             onChange={(
                                                e
                                             ) =>
                                                setSubjectSearch(
                                                   e.target.value
                                                )
                                             }
                                             placeholder="Search subject or code..."
                                             className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                          />

                                       </div>

                                       <button
                                          type="button"
                                          onClick={
                                             selectAllStudentSubjects
                                          }
                                          disabled={
                                             !studentSubjects.length
                                          }
                                          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                       >
                                          ✓ Select All
                                       </button>

                                       <button
                                          type="button"
                                          onClick={
                                             clearStudentSubjects
                                          }
                                          disabled={
                                             !formData.assignedSubjects
                                                .length
                                          }
                                          className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                                       >
                                          Clear
                                       </button>

                                    </div>
                                 )}

                              {/* LOADING */}

                              {loadingSubjects && (
                                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                    {Array.from(
                                       {
                                          length: 6,
                                       }
                                    ).map(
                                       (
                                          _,
                                          index
                                       ) => (
                                          <div
                                             key={
                                                index
                                             }
                                             className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5"
                                          >
                                             <div className="h-5 w-2/3 rounded bg-slate-200" />
                                             <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
                                          </div>
                                       )
                                    )}

                                 </div>
                              )}

                              {/* NO CLASS */}

                              {!loadingSubjects &&
                                 !formData.className && (
                                    <EmptyState
                                       icon="🏫"
                                       title="Pehle class select karo"
                                       text="Class select karte hi us class ke available subjects yahan automatically load honge."
                                    />
                                 )}

                              {/* STREAM / SECTION PENDING */}

                              {!loadingSubjects &&
                                 formData.className &&
                                 (!formData.stream ||
                                    !formData.section) && (
                                    <EmptyState
                                       icon="⚙️"
                                       title="Stream aur Section select karo"
                                       text="Subjects ko accurately verify karne ke liye Class + Stream + Section select karna zaroori hai."
                                    />
                                 )}

                              {/* SUBJECTS */}

                              {!loadingSubjects &&
                                 formData.className &&
                                 formData.stream &&
                                 formData.section &&
                                 studentSubjects.length >
                                 0 && (

                                    <div>

                                       <div className="mb-4 flex items-center justify-between">

                                          <div>

                                             <p className="font-black text-slate-900">
                                                Available Subjects
                                             </p>

                                             <p className="text-xs text-slate-500">
                                                {studentSubjects.length} subject
                                                {studentSubjects.length !==
                                                   1
                                                   ? "s"
                                                   : ""}{" "}
                                                available
                                             </p>

                                          </div>

                                          <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
                                             {
                                                formData
                                                   .assignedSubjects
                                                   .length
                                             }{" "}
                                             Selected
                                          </div>

                                       </div>

                                       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                          {studentSubjects.map(
                                             (
                                                subject,
                                                index
                                             ) => {

                                                const id =
                                                   subject._id;

                                                const name =
                                                   subject.name ||
                                                   subject.subjectName ||
                                                   subject.code ||
                                                   "Subject";

                                                const selected =
                                                   formData.assignedSubjects.includes(
                                                      id
                                                   );

                                                return (
                                                   <button
                                                      type="button"
                                                      key={
                                                         id ||
                                                         index
                                                      }
                                                      onClick={() =>
                                                         toggleArrayValue(
                                                            "assignedSubjects",
                                                            id
                                                         )
                                                      }
                                                      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 ${selected
                                                         ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl shadow-blue-500/10 ring-2 ring-blue-100"
                                                         : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg"
                                                         }`}
                                                   >

                                                      {selected && (
                                                         <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow-lg">
                                                            ✓
                                                         </div>
                                                      )}

                                                      <div className="flex items-start gap-4">

                                                         <div
                                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition-all duration-300 ${selected
                                                               ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:rotate-6"
                                                               : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                                                               }`}
                                                         >
                                                            📖
                                                         </div>

                                                         <div className="min-w-0">

                                                            <p
                                                               className={`truncate font-black ${selected
                                                                  ? "text-blue-800"
                                                                  : "text-slate-900"
                                                                  }`}
                                                            >
                                                               {
                                                                  name
                                                               }
                                                            </p>

                                                            {subject.code && (
                                                               <p className="mt-1 text-xs font-bold text-slate-400">
                                                                  {
                                                                     subject.code
                                                                  }
                                                               </p>
                                                            )}

                                                            <div className="mt-3 flex flex-wrap gap-1.5">

                                                               <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
                                                                  Class{" "}
                                                                  {
                                                                     formData.className
                                                                  }
                                                               </span>

                                                               {subjectSection(
                                                                  subject
                                                               )}

                                                            </div>

                                                         </div>

                                                      </div>

                                                   </button>
                                                );
                                             }
                                          )}

                                       </div>

                                    </div>
                                 )}

                              {/* NO SUBJECT */}

                              {!loadingSubjects &&
                                 formData.className &&
                                 formData.stream &&
                                 formData.section &&
                                 studentSubjects.length ===
                                 0 && (

                                    <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-7 text-center">

                                       <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg">
                                          📚
                                       </div>

                                       <h4 className="mt-4 text-lg font-black text-amber-900">
                                          Subjects nahi mile
                                       </h4>

                                       <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-amber-700">
                                          Admin → Subjects me
                                          Class{" "}
                                          <b>
                                             {
                                                formData.className
                                             }
                                          </b>
                                          , Stream{" "}
                                          <b>
                                             {
                                                formData.stream
                                             }
                                          </b>
                                          , Section{" "}
                                          <b>
                                             {
                                                formData.section
                                             }
                                          </b>{" "}
                                          ke subjects create/check karo.
                                       </p>

                                       <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black text-amber-700 shadow-sm">
                                          ⚡ 2026-27
                                          Academic Year
                                       </div>

                                    </div>
                                 )}

                              {/* SELECTED SUBJECT SUMMARY */}

                              {formData.assignedSubjects.length >
                                 0 && (
                                    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

                                       <div className="flex items-center justify-between">

                                          <div>

                                             <p className="font-black text-blue-900">
                                                Selected Subjects
                                             </p>

                                             <p className="text-xs text-blue-600">
                                                Ye subjects student
                                                profile me assign honge.
                                             </p>

                                          </div>

                                          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                                             {
                                                formData.assignedSubjects
                                                   .length
                                             }
                                          </span>

                                       </div>

                                       <div className="mt-4 flex flex-wrap gap-2">

                                          {formData.assignedSubjects.map(
                                             (
                                                id
                                             ) => {

                                                const subject =
                                                   availableSubjects.find(
                                                      (
                                                         item
                                                      ) =>
                                                         item._id ===
                                                         id
                                                   );

                                                if (
                                                   !subject
                                                ) {
                                                   return null;
                                                }

                                                return (
                                                   <span
                                                      key={
                                                         id
                                                      }
                                                      className="rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black text-blue-700 shadow-sm"
                                                   >
                                                      ✓{" "}
                                                      {subject.name ||
                                                         subject.subjectName ||
                                                         subject.code}
                                                   </span>
                                                );
                                             }
                                          )}

                                       </div>

                                    </div>
                                 )}

                           </div>

                        </div>

                        {/* =================================================
                        STUDENT VERIFICATION
                     ================================================= */}

                        <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">

                           <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">

                              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                 Student Verification
                              </p>

                           </div>

                           <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

                              <VerifyCard
                                 icon="🏫"
                                 label="Class"
                                 value={
                                    formData.className
                                       ? `Class ${formData.className}`
                                       : "Not selected"
                                 }
                              />

                              <VerifyCard
                                 icon="🎯"
                                 label="Stream"
                                 value={
                                    formData.stream ||
                                    "Not selected"
                                 }
                              />

                              <VerifyCard
                                 icon="🏷️"
                                 label="Section"
                                 value={
                                    formData.section
                                       ? `Section ${formData.section}`
                                       : "Not selected"
                                 }
                              />

                              <VerifyCard
                                 icon="🔢"
                                 label="Roll Number"
                                 value={
                                    formData.rollNumber ||
                                    "Not selected"
                                 }
                              />

                           </div>

                        </div>

                     </section>
                  )}

               {/* =================================================
                  TEACHER
               ================================================= */}

               {userType ===
                  "teacher" && (
                     <section className="mt-10 overflow-hidden rounded-[2rem] border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">

                        <SectionTitle
                           icon="👨‍🏫"
                           title="Teacher Teaching Profile"
                           subtitle="Teacher multiple subjects, classes aur sections padha sakta hai."
                        />

                        <div className="mt-6">

                           <Input
                              label="Qualification"
                              name="qualification"
                              value={
                                 formData.qualification
                              }
                              onChange={
                                 handleChange
                              }
                              placeholder="e.g. M.Sc, B.Ed"
                              required
                           />

                        </div>

                        {/* TEACHER SUBJECTS */}

                        <div className="mt-7 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">

                           <div className="border-b border-slate-100 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">

                              <div className="flex items-center justify-between">

                                 <div>

                                    <div className="flex items-center gap-3">

                                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                                          📚
                                       </div>

                                       <div>

                                          <h4 className="text-xl font-black">
                                             Subjects Teacher Can Teach
                                          </h4>

                                          <p className="text-sm text-purple-100">
                                             Multiple subjects select karo.
                                          </p>

                                       </div>

                                    </div>

                                 </div>

                                 <span className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur">
                                    <b className="block text-2xl">
                                       {
                                          formData.subjects
                                             .length
                                       }
                                    </b>
                                    <small>
                                       Selected
                                    </small>
                                 </span>

                              </div>

                           </div>

                           <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">

                              {SUBJECT_OPTIONS.map(
                                 (
                                    subject
                                 ) => {

                                    const selected =
                                       formData.subjects.includes(
                                          subject
                                       );

                                    return (
                                       <button
                                          type="button"
                                          key={
                                             subject
                                          }
                                          onClick={() =>
                                             toggleArrayValue(
                                                "subjects",
                                                subject
                                             )
                                          }
                                          className={`group rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-1 ${selected
                                             ? "border-purple-500 bg-purple-100 text-purple-800 shadow-lg"
                                             : "border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-purple-50"
                                             }`}
                                       >

                                          <div className="flex items-center gap-3">

                                             <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${selected
                                                   ? "bg-purple-600 text-white"
                                                   : "bg-white text-slate-500"
                                                   }`}
                                             >
                                                {selected
                                                   ? "✓"
                                                   : "📘"}
                                             </div>

                                             <span className="font-bold">
                                                {
                                                   subject
                                                }
                                             </span>

                                          </div>

                                       </button>
                                    );
                                 }
                              )}

                           </div>

                        </div>

                        {/* TEACHER CLASSES */}

                        <div className="mt-7 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">

                           <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">

                              <div className="flex items-center justify-between">

                                 <div>

                                    <div className="flex items-center gap-3">

                                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                                          🏫
                                       </div>

                                       <div>

                                          <h4 className="text-xl font-black">
                                             Classes Teacher Can Teach
                                          </h4>

                                          <p className="text-sm text-blue-100">
                                             Class 1 se Class 12 tak select kar sakte ho.
                                          </p>

                                       </div>

                                    </div>

                                 </div>

                                 <span className="rounded-2xl bg-white/10 px-4 py-3 text-center">
                                    <b className="block text-2xl">
                                       {
                                          formData
                                             .teachingClasses
                                             .length
                                       }
                                    </b>
                                    <small>
                                       Classes
                                    </small>
                                 </span>

                              </div>

                           </div>

                           <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

                              {CLASS_OPTIONS.map(
                                 (
                                    className
                                 ) => {

                                    const selected =
                                       formData.teachingClasses.includes(
                                          className
                                       );

                                    return (
                                       <button
                                          type="button"
                                          key={
                                             className
                                          }
                                          onClick={() =>
                                             toggleArrayValue(
                                                "teachingClasses",
                                                className
                                             )
                                          }
                                          className={`rounded-2xl border p-4 font-black transition-all duration-300 hover:-translate-y-1 ${selected
                                             ? "border-indigo-500 bg-indigo-100 text-indigo-800 shadow-lg"
                                             : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300"
                                             }`}
                                       >

                                          <div className="text-xl">
                                             {selected
                                                ? "✓"
                                                : "🏫"}
                                          </div>

                                          <div className="mt-2">
                                             Class{" "}
                                             {
                                                className
                                             }
                                          </div>

                                       </button>
                                    );
                                 }
                              )}

                           </div>

                        </div>

                        {/* TEACHER SECTIONS */}

                        <div className="mt-7 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">

                           <div className="border-b border-slate-100 bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">

                              <div className="flex items-center justify-between">

                                 <div>

                                    <div className="flex items-center gap-3">

                                       <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                                          🏷️
                                       </div>

                                       <div>

                                          <h4 className="text-xl font-black">
                                             Sections Teacher Can Teach
                                          </h4>

                                          <p className="text-sm text-orange-100">
                                             Multiple sections select kar sakte ho.
                                          </p>

                                       </div>

                                    </div>

                                 </div>

                                 <span className="rounded-2xl bg-white/10 px-4 py-3 text-center">
                                    <b className="block text-2xl">
                                       {
                                          formData
                                             .teachingSections
                                             .length
                                       }
                                    </b>
                                    <small>
                                       Sections
                                    </small>
                                 </span>

                              </div>

                           </div>

                           <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-5">

                              {SECTION_OPTIONS.map(
                                 (
                                    section
                                 ) => {

                                    const selected =
                                       formData.teachingSections.includes(
                                          section
                                       );

                                    return (
                                       <button
                                          type="button"
                                          key={
                                             section
                                          }
                                          onClick={() =>
                                             toggleArrayValue(
                                                "teachingSections",
                                                section
                                             )
                                          }
                                          className={`rounded-2xl border p-5 font-black transition-all duration-300 hover:-translate-y-1 ${selected
                                             ? "border-amber-500 bg-amber-100 text-amber-800 shadow-lg"
                                             : "border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-300"
                                             }`}
                                       >

                                          <div className="text-xl">
                                             {selected
                                                ? "✓"
                                                : "🏷️"}
                                          </div>

                                          <div className="mt-2">
                                             Section{" "}
                                             {
                                                section
                                             }
                                          </div>

                                       </button>
                                    );
                                 }
                              )}

                           </div>

                        </div>

                        {/* TEACHER SUMMARY */}

                        <div className="mt-7 overflow-hidden rounded-[2rem] border border-purple-200 bg-white p-6 shadow-xl">

                           <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                              Teacher Teaching Summary
                           </p>

                           <div className="mt-5 grid gap-4 md:grid-cols-3">

                              <SummaryCard
                                 icon="📚"
                                 title="Subjects"
                                 value={
                                    formData.subjects
                                       .length
                                       ? formData.subjects.join(
                                          ", "
                                       )
                                       : "Not selected"
                                 }
                              />

                              <SummaryCard
                                 icon="🏫"
                                 title="Classes"
                                 value={
                                    formData
                                       .teachingClasses
                                       .length
                                       ? formData.teachingClasses.join(
                                          ", "
                                       )
                                       : "Not selected"
                                 }
                              />

                              <SummaryCard
                                 icon="🏷️"
                                 title="Sections"
                                 value={
                                    formData
                                       .teachingSections
                                       .length
                                       ? formData.teachingSections.join(
                                          ", "
                                       )
                                       : "All sections"
                                 }
                              />

                           </div>

                        </div>

                     </section>
                  )}

               {/* =================================================
                  ADDRESS
               ================================================= */}

               <section className="mt-10">

                  <SectionTitle
                     icon="📍"
                     title="Address"
                     subtitle="Complete address details."
                  />

                  <textarea
                     name="address"
                     value={
                        formData.address
                     }
                     onChange={
                        handleChange
                     }
                     rows={3}
                     placeholder="Enter complete address"
                     className="mt-5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">

                     <Input
                        label="City"
                        name="city"
                        value={
                           formData.city
                        }
                        onChange={
                           handleChange
                        }
                        placeholder="Enter city"
                     />

                     <Input
                        label="State"
                        name="state"
                        value={
                           formData.state
                        }
                        onChange={
                           handleChange
                        }
                        placeholder="Enter state"
                     />

                  </div>

               </section>

               {/* =================================================
                  LOGIN
               ================================================= */}

               <section className="mt-10 overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">

                  <SectionTitle
                     icon="🔐"
                     title="Login Account"
                     subtitle="System automatically Student ID / Teacher ID generate karega."
                  />

                  <div className="mt-6 max-w-xl">
                     <label className="mb-2 block text-sm font-black text-slate-700">
                        Password <span className="text-red-500">*</span>
                     </label>

                     <div className="relative">
                        <input
                           type={showPassword ? "text" : "password"}
                           name="password"
                           value={formData.password}
                           onChange={handleChange}
                           placeholder="Minimum 6 characters"
                           required
                           minLength={6}
                           autoComplete="new-password"
                           className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-28 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <button
                           type="button"
                           onClick={() => setShowPassword((value) => !value)}
                           className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-100 hover:text-blue-700"
                        >
                           {showPassword ? "Hide" : "Show"}
                        </button>
                     </div>

                     <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black ${formData.password.length >= 6
                           ? "bg-emerald-50 text-emerald-700"
                           : "bg-slate-100 text-slate-500"
                           }`}>
                           {formData.password.length >= 6 ? "✓ Strong enough" : "6+ characters"}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                           Login ke liye ye password use hoga.
                        </span>
                     </div>
                  </div>

               </section>

               {/* =================================================
                  BUTTONS
               ================================================= */}

               <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                     type="button"
                     onClick={
                        resetForm
                     }
                     className="rounded-2xl bg-slate-100 px-7 py-3 font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200"
                  >
                     Clear
                  </button>

                  <button
                     type="submit"
                     disabled={
                        loading
                     }
                     className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-black text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                     {loading
                        ? "Creating..."
                        : userType ===
                           "student"
                           ? "🚀 Create Student"
                           : "🚀 Create Teacher"}
                  </button>

               </div>

            </form>

            <div className="mt-6 text-center text-xs font-semibold text-slate-500">
               <span className="text-blue-500">●</span> Admin-only workspace
               <span className="mx-2">•</span>
               Verify details before creating the account
            </div>

         </main>

      </div>
   );
}

/* =========================================================
   SUBJECT SECTION HELPER
========================================================= */

function subjectSection(
   subject
) {
   const section =
      String(
         subject.section || ""
      ).trim();

   if (!section) {
      return (
         <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
            All Sections
         </span>
      );
   }

   return (
      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-600">
         Section {section}
      </span>
   );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
   icon,
   title,
   subtitle,
}) {
   return (
      <div className="flex items-start gap-4">

         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl shadow-sm">
            {icon}
         </div>

         <div>

            <h2 className="text-2xl font-black text-slate-950">
               {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
               {subtitle}
            </p>

         </div>

      </div>
   );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
   label,
   name,
   type = "text",
   value,
   onChange,
   placeholder,
   required = false,
}) {
   return (
      <div>

         <label className="mb-2 block text-sm font-black text-slate-700">

            {label}

            {required && (
               <span className="ml-1 text-red-500">
                  *
               </span>
            )}

         </label>

         <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={
               placeholder
            }
            required={
               required
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
         />

      </div>
   );
}

/* =========================================================
   SELECT
========================================================= */

function Select({
   label,
   name,
   value,
   onChange,
   options,
   required = false,
}) {
   return (
      <div>

         <label className="mb-2 block text-sm font-black text-slate-700">

            {label}

            {required && (
               <span className="ml-1 text-red-500">
                  *
               </span>
            )}

         </label>

         <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
         >

            {options.map(
               (
                  option
               ) => (
                  <option
                     key={
                        option.value
                     }
                     value={
                        option.value
                     }
                  >
                     {
                        option.label
                     }
                  </option>
               )
            )}

         </select>

      </div>
   );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({
   text,
}) {
   return (
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
         {text}
      </span>
   );
}

/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({
   label,
   value,
}) {
   return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">

         <span className="text-slate-400">
            {label}:
         </span>{" "}

         <span className="text-slate-800">
            {value}
         </span>

      </span>
   );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
   icon,
   title,
   text,
}) {
   return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
            {icon}
         </div>

         <h4 className="mt-4 font-black text-slate-900">
            {title}
         </h4>

         <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {text}
         </p>

      </div>
   );
}

/* =========================================================
   VERIFY CARD
========================================================= */

function VerifyCard({
   icon,
   label,
   value,
}) {
   return (
      <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">

         <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
               {icon}
            </div>

            <div>

               <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {label}
               </p>

               <p className="mt-1 font-black text-slate-800">
                  {value}
               </p>

            </div>

         </div>

      </div>
   );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
   icon,
   title,
   value,
}) {
   return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">

         <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
               {icon}
            </div>

            <div className="min-w-0">

               <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {title}
               </p>

               <p className="mt-2 break-words text-sm font-black text-slate-800">
                  {value}
               </p>

            </div>

         </div>

      </div>
   );
}

/* =========================================================
   DARK INFO
========================================================= */

function DarkInfo({
   label,
   value,
}) {
   return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

         <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {label}
         </p>

         <p className="mt-1 break-words font-black text-white">
            {value || "-"}
         </p>

      </div>
   );
}