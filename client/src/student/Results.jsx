import {
   useEffect,
   useMemo,
   useState,
} from "react";

import {
   Link,
   useNavigate,
} from "react-router-dom";


// =====================================================
// API
// =====================================================

const API_URL =
   import.meta.env.VITE_API_URL ||
   "http://localhost:5000";


// =====================================================
// SUBJECT KEY
//
// Teacher Results me marks isi type ke key se save
// hote hain.
//
// Example:
// Biology -> biology
// Physical Science -> physical_science
// =====================================================

const getSubjectKey = (subject = {}) => {
   return String(
      subject.code ||
      subject.name ||
      "subject"
   )
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
};


// =====================================================
// GRADE
// =====================================================

const getGrade = (percentage) => {
   const value =
      Number(percentage) || 0;

   if (value >= 90) return "A+";
   if (value >= 80) return "A";
   if (value >= 70) return "B+";
   if (value >= 60) return "B";
   if (value >= 50) return "C";
   if (value >= 33) return "D";

   return "F";
};


// =====================================================
// STATUS
// =====================================================

const getStatus = (percentage) => {
   return Number(percentage) >= 33
      ? "Pass"
      : "Fail";
};


// =====================================================
// AUTH TOKEN
// =====================================================

const getToken = () => {
   return (
      localStorage.getItem(
         "schoolToken"
      ) ||
      sessionStorage.getItem(
         "schoolToken"
      ) ||
      ""
   );
};


// =====================================================
// API HELPER
// =====================================================

const api = async (
   endpoint,
   options = {}
) => {
   const token = getToken();

   if (!token) {
      throw new Error(
         "Login session nahi mila. Please login again."
      );
   }

   const response =
      await fetch(
         `${API_URL}${endpoint}`,
         {
            ...options,

            headers: {
               "Content-Type":
                  "application/json",

               Authorization:
                  `Bearer ${token}`,

               ...(options.headers || {}),
            },
         }
      );


   let data = {};

   try {
      data =
         await response.json();
   } catch {
      data = {};
   }


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

      throw new Error(
         "Login session expire ho gaya. Please login again."
      );
   }


   if (!response.ok) {
      throw new Error(
         data.message ||
         "Request failed."
      );
   }


   return data;
};


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Results() {
   const navigate = useNavigate();


   // ===================================================
   // STATE
   // ===================================================

   const [student, setStudent] =
      useState(null);

   const [subjects, setSubjects] =
      useState([]);

   const [results, setResults] =
      useState([]);

   const [selectedResultIndex, setSelectedResultIndex] =
      useState(0);

   const [loading, setLoading] =
      useState(true);

   const [error, setError] =
      useState("");


   // ===================================================
   // LOAD DATA
   // ===================================================

   useEffect(() => {
      loadResults();
   }, []);


   const loadResults = async () => {
      try {
         setLoading(true);
         setError("");


         // -----------------------------------------------
         // GET LOGGED-IN USER
         // -----------------------------------------------

         const userText =
            localStorage.getItem(
               "schoolUser"
            ) ||
            sessionStorage.getItem(
               "schoolUser"
            );


         let user = null;

         if (userText) {
            try {
               user =
                  JSON.parse(
                     userText
                  );
            } catch {
               user = null;
            }
         }


         // -----------------------------------------------
         // STUDENT ID
         // -----------------------------------------------

         const studentId =
            user?.studentId ||
            user?.userId ||
            user?.id;


         if (!studentId) {
            throw new Error(
               "Student ID nahi mila. Please login again."
            );
         }


         // -----------------------------------------------
         // RESULTS
         // -----------------------------------------------

         const resultData =
            await api(
               `/api/results/student/${encodeURIComponent(
                  studentId
               )}`
            );


         // -----------------------------------------------
         // SUBJECTS
         // -----------------------------------------------
         //
         // Student ke assigned subjects.
         //
         // Isi se Biology, Chemistry, Physics,
         // Hindi, English, Maths etc. ke names milenge.
         //

         let subjectData = {
            subjects: [],
         };


         try {
            subjectData =
               await api(
                  "/api/subjects/my"
               );
         } catch (subjectError) {
            console.warn(
               "Subjects API warning:",
               subjectError
            );
         }


         setStudent(
            resultData.student ||
            subjectData.student ||
            null
         );


         setResults(
            Array.isArray(
               resultData.results
            )
               ? resultData.results
               : []
         );


         setSubjects(
            Array.isArray(
               subjectData.subjects
            )
               ? subjectData.subjects
               : []
         );


      } catch (err) {
         console.error(
            "Student Results Error:",
            err
         );


         setError(
            err.message ||
            "Results load nahi ho paaye."
         );


         // -----------------------------------------------
         // LOGIN REDIRECT
         // -----------------------------------------------

         if (
            String(
               err.message || ""
            )
               .toLowerCase()
               .includes("login")
         ) {
            setTimeout(() => {
               navigate("/login");
            }, 1000);
         }

      } finally {
         setLoading(false);
      }
   };


   // ===================================================
   // CURRENT RESULT
   // ===================================================

   const currentResult =
      results[
      selectedResultIndex
      ] || null;


   // ===================================================
   // SUBJECT RESULT DATA
   // ===================================================

   const subjectResults =
      useMemo(() => {
         if (!currentResult) {
            return [];
         }


         const marks =
            currentResult.marks ||
            {};


         // -----------------------------------------------
         // SUBJECTS FROM ADMIN ASSIGNMENT
         // -----------------------------------------------

         const rows =
            subjects.map(
               (subject) => {
                  const key =
                     getSubjectKey(
                        subject
                     );


                  const value =
                     marks[key];


                  const numericMarks =
                     Number(value);


                  // Only show subjects for which
                  // teacher entered marks.
                  if (
                     value === undefined ||
                     value === null ||
                     value === ""
                  ) {
                     return null;
                  }


                  return {
                     key,

                     subject:
                        subject.name ||
                        subject.code ||
                        "Subject",

                     code:
                        subject.code ||
                        "",

                     maxMarks: 100,

                     obtainedMarks:
                        Number.isFinite(
                           numericMarks
                        )
                           ? numericMarks
                           : 0,

                     teacher:
                        subject.teacher?.name ||
                        subject.teacherName ||
                        "Teacher",

                     room:
                        subject.room ||
                        "",

                     percentage:
                        Number.isFinite(
                           numericMarks
                        )
                           ? numericMarks
                           : 0,

                     grade:
                        getGrade(
                           numericMarks
                        ),

                     status:
                        getStatus(
                           numericMarks
                        ),
                  };
               }
            )
               .filter(Boolean);


         // -----------------------------------------------
         // FALLBACK
         //
         // Agar teacher ne koi subject save kiya
         // jo current assigned-subject list me nahi
         // mil raha, marks object se bhi show karo.
         // -----------------------------------------------

         const usedKeys =
            new Set(
               rows.map(
                  (row) =>
                     row.key
               )
            );


         Object.entries(
            marks
         ).forEach(
            ([key, value]) => {
               if (
                  usedKeys.has(key)
               ) {
                  return;
               }


               const numericMarks =
                  Number(value);


               rows.push({
                  key,

                  subject:
                     key
                        .replace(
                           /_/g,
                           " "
                        )
                        .replace(
                           /\b\w/g,
                           (char) =>
                              char.toUpperCase()
                        ),

                  code: "",

                  maxMarks: 100,

                  obtainedMarks:
                     Number.isFinite(
                        numericMarks
                     )
                        ? numericMarks
                        : 0,

                  teacher:
                     "Teacher",

                  room: "",

                  percentage:
                     Number.isFinite(
                        numericMarks
                     )
                        ? numericMarks
                        : 0,

                  grade:
                     getGrade(
                        numericMarks
                     ),

                  status:
                     getStatus(
                        numericMarks
                     ),
               });
            }
         );


         return rows;

      }, [
         currentResult,
         subjects,
      ]);


   // ===================================================
   // TOTAL MARKS
   // ===================================================

   const totalMarks =
      subjectResults.reduce(
         (
            total,
            subject
         ) =>
            total +
            Number(
               subject.maxMarks ||
               0
            ),
         0
      );


   // ===================================================
   // OBTAINED MARKS
   // ===================================================

   const obtainedMarks =
      subjectResults.reduce(
         (
            total,
            subject
         ) =>
            total +
            Number(
               subject.obtainedMarks ||
               0
            ),
         0
      );


   // ===================================================
   // PERCENTAGE
   // ===================================================

   const calculatedPercentage =
      totalMarks > 0
         ? Number(
            (
               (obtainedMarks /
                  totalMarks) *
               100
            ).toFixed(2)
         )
         : Number(
            currentResult?.percentage ||
            0
         );


   // ===================================================
   // GRADE
   // ===================================================

   const overallGrade =
      currentResult?.grade ||
      getGrade(
         calculatedPercentage
      );


   // ===================================================
   // STATUS
   // ===================================================

   const overallStatus =
      currentResult?.resultStatus ||
      getStatus(
         calculatedPercentage
      );


   // ===================================================
   // PASSED SUBJECTS
   // ===================================================

   const passedSubjects =
      subjectResults.filter(
         (subject) =>
            subject.status ===
            "Pass"
      ).length;


   // ===================================================
   // LOADING SCREEN
   // ===================================================

   if (loading) {
      return (
         <div className="min-h-screen bg-slate-50 flex items-center justify-center">

            <div className="text-center">

               <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

               <p className="mt-4 font-bold text-slate-600">
                  Results load ho rahe hain...
               </p>

            </div>

         </div>
      );
   }


   // ===================================================
   // PAGE
   // ===================================================

   return (
      <div className="min-h-screen bg-slate-50">


         {/* =================================================
          HEADER
      ================================================= */}

         <header className="bg-white border-b border-slate-200">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

               <Link
                  to="/student/dashboard"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition mb-3"
               >
                  ← Back to Dashboard
               </Link>


               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                     <p className="text-sm font-semibold text-blue-600">
                        Student Portal
                     </p>

                     <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                        Examination Results
                     </h1>

                     <p className="text-slate-500 mt-1">

                        {student?.name ||
                           "Student"}

                        {student?.studentId
                           ? ` • ${student.studentId}`
                           : ""}

                        {student?.className
                           ? ` • Class ${student.className}`
                           : ""}

                        {student?.section
                           ? ` • Section ${student.section}`
                           : ""}

                     </p>

                  </div>


                  {/* =================================================
                EXAM SELECTOR
            ================================================= */}

                  <div>

                     <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                        Examination
                     </p>


                     {results.length > 0 ? (

                        <select
                           value={
                              selectedResultIndex
                           }
                           onChange={(event) =>
                              setSelectedResultIndex(
                                 Number(
                                    event.target.value
                                 )
                              )
                           }
                           className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 font-bold text-blue-900 outline-none"
                        >

                           {results.map(
                              (
                                 result,
                                 index
                              ) => (

                                 <option
                                    key={
                                       result._id ||
                                       index
                                    }
                                    value={index}
                                 >
                                    {result.exam ||
                                       "Examination"}
                                    {" "}
                                    {result.academicYear
                                       ? `• ${result.academicYear}`
                                       : ""}
                                 </option>

                              )
                           )}

                        </select>

                     ) : (

                        <div className="bg-slate-100 rounded-xl px-4 py-3 font-bold text-slate-600">
                           No Result Available
                        </div>

                     )}

                  </div>

               </div>

            </div>

         </header>


         {/* =================================================
          MAIN
      ================================================= */}

         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


            {/* =================================================
            ERROR
        ================================================= */}

            {error && (
               <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6">
                  {error}
               </div>
            )}


            {/* =================================================
            NO RESULTS
        ================================================= */}

            {!currentResult ? (

               <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">

                  <div className="text-6xl mb-5">
                     📊
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900">
                     Result Abhi Available Nahi Hai
                  </h2>

                  <p className="text-slate-500 mt-2">
                     Teacher ne abhi aapka examination
                     result publish nahi kiya hai.
                  </p>

               </div>

            ) : (

               <>
                  {/* =================================================
                SUMMARY
            ================================================= */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">


                     {/* PERCENTAGE */}

                     <SummaryCard
                        icon="📊"
                        title="Percentage"
                        value={`${calculatedPercentage}%`}
                        description="Overall performance"
                     />


                     {/* TOTAL */}

                     <SummaryCard
                        icon="📝"
                        title="Total Marks"
                        value={obtainedMarks}
                        description={`Out of ${totalMarks}`}
                     />


                     {/* GRADE */}

                     <SummaryCard
                        icon="🏆"
                        title="Overall Grade"
                        value={overallGrade}
                        description="Final grade"
                     />


                     {/* PASSED */}

                     <SummaryCard
                        icon="✓"
                        title="Subjects Passed"
                        value={`${passedSubjects}/${subjectResults.length}`}
                        description="Subject performance"
                     />

                  </div>


                  {/* =================================================
                EXAM INFORMATION
            ================================================= */}

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">

                     <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                        <InfoBox
                           label="Examination"
                           value={
                              currentResult.exam ||
                              "Examination"
                           }
                        />

                        <InfoBox
                           label="Academic Year"
                           value={
                              currentResult.academicYear ||
                              "2026-27"
                           }
                        />

                        <InfoBox
                           label="Class"
                           value={
                              currentResult.className ||
                              student?.className ||
                              "-"
                           }
                        />

                        <InfoBox
                           label="Section"
                           value={
                              currentResult.section ||
                              student?.section ||
                              "-"
                           }
                        />

                     </div>

                  </div>


                  {/* =================================================
                PERFORMANCE BAR
            ================================================= */}

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">

                     <div className="flex items-center justify-between mb-3">

                        <div>

                           <h2 className="font-bold text-slate-900">
                              Overall Performance
                           </h2>

                           <p className="text-sm text-slate-500 mt-1">
                              Teacher ke entered marks ke basis par
                           </p>

                        </div>

                        <span className="font-bold text-blue-600">
                           {calculatedPercentage}%
                        </span>

                     </div>


                     <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">

                        <div
                           className="h-full bg-blue-600 rounded-full transition-all duration-700"
                           style={{
                              width: `${Math.min(
                                 100,
                                 Math.max(
                                    0,
                                    calculatedPercentage
                                 )
                              )}%`,
                           }}
                        />

                     </div>

                  </div>


                  {/* =================================================
                SUBJECT-WISE RESULT
            ================================================= */}

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">

                     <div className="p-6 border-b border-slate-200">

                        <h2 className="text-xl font-bold text-slate-900">
                           Subject-wise Results
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                           Teacher ne jo marks enter kiye hain
                           woh yahan show honge.
                        </p>

                     </div>


                     {subjectResults.length === 0 ? (

                        <div className="p-10 text-center">

                           <div className="text-5xl mb-4">
                              📚
                           </div>

                           <h3 className="text-xl font-bold text-slate-900">
                              Marks Available Nahi Hain
                           </h3>

                           <p className="text-slate-500 mt-2">
                              Is examination ke liye teacher
                              ne abhi marks enter nahi kiye.
                           </p>

                        </div>

                     ) : (

                        <div className="overflow-x-auto">

                           <table className="w-full min-w-[850px]">

                              <thead className="bg-slate-50">

                                 <tr>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                       #
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                       Subject
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                       Teacher
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                       Maximum
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                       Obtained
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                       %
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                       Grade
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                       Status
                                    </th>

                                 </tr>

                              </thead>


                              <tbody className="divide-y divide-slate-100">

                                 {subjectResults.map(
                                    (
                                       subject,
                                       index
                                    ) => (

                                       <tr
                                          key={
                                             subject.key
                                          }
                                          className="hover:bg-slate-50 transition"
                                       >

                                          {/* NUMBER */}

                                          <td className="px-6 py-5 text-sm text-slate-500">
                                             {index + 1}
                                          </td>


                                          {/* SUBJECT */}

                                          <td className="px-6 py-5">

                                             <div>

                                                <p className="font-bold text-slate-900">
                                                   {subject.subject}
                                                </p>

                                                {subject.code && (
                                                   <p className="text-xs text-slate-400 mt-1">
                                                      {subject.code}
                                                   </p>
                                                )}

                                             </div>

                                          </td>


                                          {/* TEACHER */}

                                          <td className="px-6 py-5">

                                             <div className="flex items-center gap-2">

                                                <span className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                                   👨‍🏫
                                                </span>

                                                <div>

                                                   <p className="text-sm font-semibold text-slate-700">
                                                      {subject.teacher}
                                                   </p>

                                                   {subject.room && (
                                                      <p className="text-xs text-slate-400">
                                                         Room {subject.room}
                                                      </p>
                                                   )}

                                                </div>

                                             </div>

                                          </td>


                                          {/* MAX MARKS */}

                                          <td className="px-6 py-5 text-sm text-slate-600">
                                             {subject.maxMarks}
                                          </td>


                                          {/* OBTAINED */}

                                          <td className="px-6 py-5">

                                             <span className="text-lg font-black text-slate-900">
                                                {subject.obtainedMarks}
                                             </span>

                                             <span className="text-sm text-slate-400">
                                                /{subject.maxMarks}
                                             </span>

                                          </td>


                                          {/* PERCENTAGE */}

                                          <td className="px-6 py-5">

                                             <div className="flex items-center gap-3">

                                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">

                                                   <div
                                                      className="h-full bg-blue-600 rounded-full"
                                                      style={{
                                                         width: `${Math.min(
                                                            100,
                                                            Math.max(
                                                               0,
                                                               subject.percentage
                                                            )
                                                         )}%`,
                                                      }}
                                                   />

                                                </div>

                                                <span className="text-sm font-semibold text-slate-600">
                                                   {subject.percentage}%
                                                </span>

                                             </div>

                                          </td>


                                          {/* GRADE */}

                                          <td className="px-6 py-5">

                                             <span className="inline-flex items-center justify-center min-w-11 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                                {subject.grade}
                                             </span>

                                          </td>


                                          {/* STATUS */}

                                          <td className="px-6 py-5">

                                             <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${subject.status ===
                                                      "Pass"
                                                      ? "bg-emerald-100 text-emerald-700"
                                                      : "bg-red-100 text-red-700"
                                                   }`}
                                             >
                                                {subject.status}
                                             </span>

                                          </td>

                                       </tr>

                                    )
                                 )}

                              </tbody>

                           </table>

                        </div>

                     )}

                  </div>


                  {/* =================================================
                FINAL RESULT
            ================================================= */}

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                        <div>

                           <p className="text-sm text-slate-500">
                              Result Status
                           </p>

                           <h3
                              className={`text-2xl font-bold mt-1 ${overallStatus ===
                                    "Pass"
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                 }`}
                           >
                              {overallStatus.toUpperCase()}
                           </h3>

                           <p className="text-sm text-slate-500 mt-2">
                              Result teacher ke saved marks
                              ke basis par hai.
                           </p>

                        </div>


                        <div
                           className={`w-24 h-24 rounded-full border-8 flex items-center justify-center ${overallStatus ===
                                 "Pass"
                                 ? "border-emerald-100"
                                 : "border-red-100"
                              }`}
                        >

                           <span
                              className={`text-2xl font-bold ${overallStatus ===
                                    "Pass"
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                 }`}
                           >
                              {overallGrade}
                           </span>

                        </div>

                     </div>

                  </div>

               </>
            )}

         </main>

      </div>
   );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
   icon,
   title,
   value,
   description,
}) {
   return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

         <div className="flex items-center justify-between">

            <div>

               <p className="text-sm text-slate-500">
                  {title}
               </p>

               <p className="text-3xl font-bold text-slate-900 mt-2">
                  {value}
               </p>

               <p className="text-xs text-slate-400 mt-1">
                  {description}
               </p>

            </div>


            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
               {icon}
            </div>

         </div>

      </div>
   );
}


// =====================================================
// INFO BOX
// =====================================================

function InfoBox({
   label,
   value,
}) {
   return (
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

         <p className="text-xs font-semibold text-slate-400 uppercase">
            {label}
         </p>

         <p className="text-sm font-bold text-slate-800 mt-1">
            {value}
         </p>

      </div>
   );
}