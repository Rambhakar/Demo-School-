

import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";



const API_URL = (
   import.meta.env.VITE_API_URL || "http://localhost:5000"
)
   .replace(/\/+$/, "")
   .replace(/\/api$/i, "");



// Normalize class names so "Class 8" and "8" can match.

const normalize = (value) =>

   String(value ?? "")

      .trim()

      .toLowerCase()

      .replace(/^class\s*/, "")

      .replace(/\s+/g, "");



export default function Subjects() {

   const navigate = useNavigate();



   const [subjects, setSubjects] = useState([]);

   const [student, setStudent] = useState(null);

   const [loading, setLoading] = useState(true);

   const [error, setError] = useState("");

   const [search, setSearch] = useState("");

   const [refreshing, setRefreshing] = useState(false);



   const getToken = () =>

      localStorage.getItem("schoolToken") ||

      sessionStorage.getItem("schoolToken") ||

      localStorage.getItem("token") ||

      sessionStorage.getItem("token") ||

      "";



   useEffect(() => {

      fetchSubjects();

   }, []);



   const fetchSubjects = async () => {

      try {

         setLoading(true);

         setError("");



         const token = getToken();



         if (!token) {

            setError("Login session nahi mila. Please login again.");

            navigate("/login");

            return;

         }



         const response = await fetch(`${API_URL}/api/subjects/my`, {

            method: "GET",

            headers: {

               Authorization: `Bearer ${token}`,

               "Content-Type": "application/json",

            },

         });



         const data = await response.json().catch(() => ({}));



         if (response.status === 401 || response.status === 403) {

            [

               "schoolToken",

               "schoolUser",

               "token",

               "user",

            ].forEach((key) => {

               localStorage.removeItem(key);

               sessionStorage.removeItem(key);

            });



            setSubjects([]);

            setStudent(null);

            navigate("/login");

            return;

         }



         if (!response.ok) {

            throw new Error(data.message || "Subjects load nahi ho paaye.");

         }



         setSubjects(Array.isArray(data.subjects) ? data.subjects : []);

         setStudent(data.student || null);

      } catch (err) {

         console.error("Student Subjects Error:", err);

         setError(err.message || "Subjects load nahi ho paaye.");

      } finally {

         setLoading(false);

         setRefreshing(false);

      }

   };



   // IMPORTANT: Only show subjects belonging to this student's class

   // and, where specified, the student's section.

   const classSubjects = useMemo(() => {

      if (!student?.className) return [];



      const studentClass = normalize(student.className);

      const studentSection = normalize(student.section);



      return subjects.filter((subject) => {

         const subjectClass = normalize(subject.className);



         // A subject without a class assignment is not shown.

         if (!subjectClass || subjectClass !== studentClass) {

            return false;

         }



         // If the subject has a section, it must match the student.

         const subjectSection = normalize(subject.section);



         if (subjectSection && subjectSection !== studentSection) {

            return false;

         }



         return true;

      });

   }, [subjects, student]);



   const filteredSubjects = useMemo(() => {

      const query = search.trim().toLowerCase();



      if (!query) return classSubjects;



      return classSubjects.filter((subject) =>

         [

            subject.name,

            subject.code,

            subject.description,

            subject.teacher?.name,

            subject.teacherName,

            subject.room,

         ]

            .filter(Boolean)

            .join(" ")

            .toLowerCase()

            .includes(query)

      );

   }, [classSubjects, search]);



   const totalWeeklyClasses = classSubjects.reduce(

      (total, subject) =>

         total + Number(subject.classesPerWeek || 0),

      0

   );



   const totalTeachers = new Set(

      classSubjects

         .map(

            (subject) =>

               subject.teacher?._id || subject.teacherName

         )

         .filter(Boolean)

   ).size;



   if (loading) {

      return (

         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-5">

            <div className="text-center">

               <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center text-4xl mx-auto animate-bounce">

                  📚

               </div>

               <h2 className="text-xl font-bold text-slate-800 mt-5">

                  Loading Your Subjects

               </h2>

               <p className="text-sm text-slate-500 mt-2">

                  Please wait...

               </p>

            </div>

         </div>

      );

   }



   return (

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">



         {/* HEADER */}

         <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">



               <Link

                  to="/student/dashboard"

                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition mb-4"

               >

                  <span>←</span> Back to Dashboard

               </Link>



               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">



                  <div>

                     <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">

                        Student Learning Portal

                     </p>



                     <h1 className="text-3xl font-black text-slate-900 mt-1">

                        My Subjects 📚

                     </h1>



                     <p className="text-slate-500 mt-2">

                        {student?.name || "Student"}

                        {student?.studentId

                           ? ` • ${student.studentId}`

                           : ""}

                     </p>



                     <div className="flex flex-wrap gap-2 mt-3">

                        <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">

                           Class {student?.className || "N/A"}

                        </span>



                        <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">

                           Section {student?.section || "N/A"}

                        </span>

                     </div>

                  </div>



                  <div className="flex items-center gap-3">

                     <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-5 min-w-32 shadow-lg shadow-blue-200">

                        <p className="text-xs text-blue-100 font-semibold">

                           My Subjects

                        </p>

                        <p className="text-3xl font-black mt-1">

                           {classSubjects.length}

                        </p>

                     </div>



                     <button

                        onClick={() => {

                           setRefreshing(true);

                           fetchSubjects();

                        }}

                        disabled={refreshing}

                        className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-blue-50 transition text-xl disabled:opacity-50"

                        title="Refresh subjects"

                     >

                        {refreshing ? "⏳" : "↻"}

                     </button>

                  </div>



               </div>

            </div>

         </header>



         {/* MAIN */}

         <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">



            {error && (

               <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6">

                  <p className="font-semibold">Something went wrong</p>

                  <p className="text-sm mt-1">{error}</p>

                  <button

                     onClick={fetchSubjects}

                     className="mt-3 text-sm font-bold underline"

                  >

                     Try Again

                  </button>

               </div>

            )}



            {!student?.className && (

               <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 mb-6">

                  <p className="font-bold">Class information not available</p>

                  <p className="text-sm mt-1">

                     Your student profile does not contain a class.

                     Please contact your school administrator.

                  </p>

               </div>

            )}



            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-9">



               <SummaryCard

                  icon="📚"

                  title="Total Subjects"

                  value={classSubjects.length}

                  description="Subjects in your class"

                  color="blue"

               />



               <SummaryCard

                  icon="👨‍🏫"

                  title="Teachers"

                  value={totalTeachers}

                  description="Assigned subject teachers"

                  color="purple"

               />



               <SummaryCard

                  icon="🗓️"

                  title="Weekly Classes"

                  value={totalWeeklyClasses}

                  description="Classes every week"

                  color="emerald"

               />



            </div>



            {/* SUBJECT SECTION */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">



               <div>

                  <h2 className="text-2xl font-black text-slate-900">

                     Subjects for Your Class

                  </h2>

                  <p className="text-sm text-slate-500 mt-1">

                     Showing subjects assigned to Class{" "}

                     {student?.className || "N/A"}

                     {student?.section

                        ? `, Section ${student.section}`

                        : ""}

                  </p>

               </div>



               <div className="relative w-full md:w-80">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2">

                     🔍

                  </span>

                  <input

                     type="text"

                     value={search}

                     onChange={(e) => setSearch(e.target.value)}

                     placeholder="Search your subjects..."

                     className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"

                  />

               </div>



            </div>



            {/* SUBJECT CARDS */}

            {filteredSubjects.length === 0 ? (



               <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 text-center shadow-sm">



                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto">

                     📚

                  </div>



                  <h3 className="text-xl font-black text-slate-900 mt-5">

                     {classSubjects.length === 0

                        ? "No Subjects Assigned"

                        : "No Matching Subjects"}

                  </h3>



                  <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">

                     {classSubjects.length === 0

                        ? "Abhi aapki class ke liye subjects assign nahi hue hain. Please school administrator se contact karein."

                        : "Aapki search se koi subject match nahi hua."}

                  </p>



                  {search && (

                     <button

                        onClick={() => setSearch("")}

                        className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"

                     >

                        Clear Search

                     </button>

                  )}



               </div>



            ) : (



               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">



                  {filteredSubjects.map((subject, index) => (



                     <div

                        key={subject._id || `${subject.name}-${index}`}

                        className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"

                     >



                        {/* CARD TOP */}

                        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />



                        <div className="p-6">



                           <div className="flex justify-between items-start">



                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl">

                                 {subject.icon || "📘"}

                              </div>



                              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">

                                 {subject.code || "SUBJECT"}

                              </span>



                           </div>



                           <h3 className="text-xl font-black text-slate-900 mt-5 group-hover:text-blue-600 transition">

                              {subject.name || "Unnamed Subject"}

                           </h3>



                           <p className="text-sm text-slate-500 mt-2 leading-6 min-h-10">

                              {subject.description ||

                                 "Explore and learn this subject."}

                           </p>



                           {/* CLASS BADGES */}

                           <div className="flex flex-wrap gap-2 mt-4">

                              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">

                                 Class {subject.className}

                              </span>



                              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">

                                 Section {subject.section || "All"}

                              </span>

                           </div>



                           {/* DETAILS */}

                           <div className="mt-6 space-y-4">



                              <InfoRow

                                 icon="👨‍🏫"

                                 label="Subject Teacher"

                                 value={

                                    subject.teacher?.name ||

                                    subject.teacherName ||

                                    "Not Assigned"

                                 }

                              />



                              <InfoRow

                                 icon="🏫"

                                 label="Class Room"

                                 value={subject.room || "Not Assigned"}

                              />



                              <InfoRow

                                 icon="🗓️"

                                 label="Weekly Schedule"

                                 value={`${Number(

                                    subject.classesPerWeek || 0

                                 )} Classes / Week`}

                              />



                              <InfoRow

                                 icon="📅"

                                 label="Academic Year"

                                 value={subject.academicYear || "2026-27"}

                              />



                           </div>



                        </div>



                        {/* CARD FOOTER */}

                        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">

                           <span className="text-xs font-semibold text-slate-500">

                              Your Class Subject

                           </span>



                           <span className="text-xs font-bold text-emerald-600">

                              ✓ Assigned

                           </span>

                        </div>



                     </div>



                  ))}



               </div>



            )}



            {/* AI STUDY */}

            <div className="mt-9 relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-7 md:p-9 text-white shadow-xl">



               <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />

               <div className="absolute -right-5 -bottom-20 w-56 h-56 rounded-full bg-white/10" />



               <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">



                  <div>

                     <p className="text-sm font-bold text-blue-100">

                        YOUR PERSONAL STUDY PARTNER

                     </p>



                     <h2 className="text-2xl md:text-3xl font-black mt-2">

                        Study Smarter with AI 🤖

                     </h2>



                     <p className="text-blue-100 text-sm mt-3 max-w-xl">

                        Ask questions, understand difficult topics and

                        get help with your assigned subjects.

                     </p>

                  </div>



                  <Link

                     to="/student/ai-study"

                     className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-700 rounded-xl font-black hover:bg-blue-50 transition shadow-lg shrink-0"

                  >

                     Open AI Study →

                  </Link>



               </div>

            </div>



         </main>

      </div>

   );

}



// SUMMARY CARD

function SummaryCard({ icon, title, value, description, color }) {

   const colors = {

      blue: "from-blue-500 to-indigo-500",

      purple: "from-purple-500 to-pink-500",

      emerald: "from-emerald-500 to-teal-500",

   };



   return (

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition">

         <div className="flex justify-between items-center">

            <div>

               <p className="text-sm font-semibold text-slate-500">

                  {title}

               </p>

               <p className="text-3xl font-black text-slate-900 mt-2">

                  {value}

               </p>

               <p className="text-xs text-slate-400 mt-1">

                  {description}

               </p>

            </div>



            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl text-white shadow-lg`}>

               {icon}

            </div>

         </div>

      </div>

   );

}



// INFO ROW

function InfoRow({ icon, label, value }) {

   return (

      <div className="flex items-center gap-3">

         <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-lg">

            {icon}

         </div>



         <div className="min-w-0">

            <p className="text-xs text-slate-400 font-medium">

               {label}

            </p>

            <p className="text-sm font-bold text-slate-700 truncate">

               {value}

            </p>

         </div>

      </div>

   );

}
