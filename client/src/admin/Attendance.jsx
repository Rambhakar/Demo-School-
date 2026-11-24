

import { useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";


const API_URL = (
   import.meta.env.VITE_API_URL || "http://localhost:5000"
)
   .replace(/\/+$/, "")
   .replace(/\/api$/i, "");


const today = () => {

   const date = new Date();

   const offset = date.getTimezoneOffset();


   return new Date(date.getTime() - offset * 60000)

      .toISOString()

      .slice(0, 10);

};


const getToken = () =>

   localStorage.getItem("schoolToken") ||

   sessionStorage.getItem("schoolToken") ||

   localStorage.getItem("token") ||

   sessionStorage.getItem("token");


const statusOptions = [

   { value: "present", label: "Present", icon: "✓" },

   { value: "absent", label: "Absent", icon: "✕" },

   { value: "late", label: "Late", icon: "◷" },

];


export default function AdminAttendance() {

   const [className, setClassName] = useState("all");

   const [section, setSection] = useState("all");

   const [date, setDate] = useState(today());


   const [classes, setClasses] = useState([]);

   const [sections, setSections] = useState([]);

   const [students, setStudents] = useState([]);


   const [search, setSearch] = useState("");

   const [filter, setFilter] = useState("all");


   const [loading, setLoading] = useState(false);

   const [saving, setSaving] = useState(false);

   const [loaded, setLoaded] = useState(false);


   const [error, setError] = useState("");

   const [message, setMessage] = useState("");


   const requestHeaders = () => ({

      Authorization: `Bearer ${getToken()}`,

      "Content-Type": "application/json",

   });


   // =====================================================

   // LOAD ATTENDANCE

   // =====================================================


   const loadAttendance = useCallback(

      async (

         selectedClass = className,

         selectedSection = section,

         selectedDate = date

      ) => {

         if (!selectedDate) {

            setError("Please select attendance date.");

            return;

         }


         if (!getToken()) {

            setError("Login session nahi mila. Please login again.");

            return;

         }


         try {

            setLoading(true);

            setError("");

            setMessage("");


            const params = new URLSearchParams({

               className: selectedClass || "all",

               section: selectedSection || "all",

               date: selectedDate,

            });


            const response = await fetch(

               `${API_URL}/api/attendance/class?${params.toString()}`,

               {

                  method: "GET",

                  headers: requestHeaders(),

               }

            );


            const data = await response.json().catch(() => ({}));


            if (!response.ok || data.success === false) {

               throw new Error(

                  data.message || "Attendance load nahi hui."

               );

            }


            const rows = (data.students || []).map((item) => {

               const student = item.student || {};

               const attendance = item.attendance || null;


               return {

                  _id: student._id,

                  studentId: student.studentId || "",

                  name: student.name || "Student",

                  rollNumber: student.rollNumber || "",

                  className: student.className || "",

                  section: student.section || "",

                  status: attendance?.status || "",

                  remarks: attendance?.remarks || "",

                  attendanceId: attendance?._id || null,

               };

            });


            setStudents(rows);


            setClasses(

               [...new Set(data.classes || [])].sort((a, b) =>

                  String(a).localeCompare(String(b), undefined, {

                     numeric: true,

                  })

               )

            );


            setSections(

               [...new Set(data.sections || [])].sort((a, b) =>

                  String(a).localeCompare(String(b), undefined, {

                     numeric: true,

                  })

               )

            );


            setLoaded(true);


            if (!rows.length) {

               setMessage(

                  "Is selection mein koi active student nahi mila."

               );

            }

         } catch (err) {

            console.error("Admin attendance load:", err);

            setError(err.message || "Attendance load nahi hui.");

            setStudents([]);

            setLoaded(false);

         } finally {

            setLoading(false);

         }

      },

      [className, section, date]

   );


   // Automatically load all students when page opens

   useEffect(() => {

      loadAttendance("all", "all", date);

   }, []);


   // =====================================================

   // FILTER HANDLERS

   // =====================================================


   const handleClassChange = async (value) => {

      setClassName(value);

      setSection("all");

      setSearch("");

      setFilter("all");


      await loadAttendance(value, "all", date);

   };


   const handleSectionChange = async (value) => {

      setSection(value);

      setSearch("");

      setFilter("all");


      await loadAttendance(className, value, date);

   };


   const handleDateChange = async (value) => {

      setDate(value);

      await loadAttendance(className, section, value);

   };


   // =====================================================

   // UPDATE STUDENT

   // =====================================================


   const updateStudent = (id, changes) => {

      setStudents((previous) =>

         previous.map((student) =>

            student._id === id

               ? { ...student, ...changes }

               : student

         )

      );

   };


   // =====================================================

   // MARK ALL

   // =====================================================


   const markAll = (status) => {

      setStudents((previous) =>

         previous.map((student) => ({

            ...student,

            status,

         }))

      );


      setMessage(

         `All students marked ${status}. Save attendance to confirm.`

      );

      setError("");

   };


   // =====================================================

   // SAVE ATTENDANCE

   // =====================================================


   const saveAttendance = async () => {

      if (!students.length) {

         setError("Save karne ke liye students available nahi hain.");

         return;

      }


      const unmarked = students.filter(

         (student) => !student.status

      );


      if (unmarked.length) {

         setError(

            `${unmarked.length} students ki attendance abhi mark nahi hui hai.`

         );

         return;

      }


      if (!getToken()) {

         setError("Login session nahi mila. Please login again.");

         return;

      }


      try {

         setSaving(true);

         setError("");

         setMessage("");


         const payload = {

            date,

            attendance: students.map((student) => ({

               studentId: student._id,

               status: student.status,

               remarks: student.remarks || "",

            })),

         };


         // Send class and section only when both are selected

         if (className !== "all" && section !== "all") {

            payload.className = className;

            payload.section = section;

         }


         const response = await fetch(`${API_URL}/api/attendance`, {

            method: "POST",

            headers: requestHeaders(),

            body: JSON.stringify(payload),

         });


         const data = await response.json().catch(() => ({}));


         if (!response.ok || data.success === false) {

            const invalid = data.invalidStudents?.length

               ? ` Invalid students: ${data.invalidStudents.join(", ")}`

               : "";


            throw new Error(

               (data.message || "Attendance save nahi hui.") + invalid

            );

         }


         setMessage(

            `Successfully saved attendance for ${data.count ?? students.length

            } students.`

         );


         await loadAttendance(className, section, date);

      } catch (err) {

         console.error("Admin attendance save:", err);

         setError(err.message || "Attendance save nahi hui.");

      } finally {

         setSaving(false);

      }

   };


   // =====================================================

   // COUNTS

   // =====================================================


   const counts = useMemo(() => {

      const present = students.filter(

         (student) => student.status === "present"

      ).length;


      const absent = students.filter(

         (student) => student.status === "absent"

      ).length;


      const late = students.filter(

         (student) => student.status === "late"

      ).length;


      return {

         total: students.length,

         present,

         absent,

         late,

         notMarked: students.length - present - absent - late,

      };

   }, [students]);


   // =====================================================

   // SEARCH AND STATUS FILTER

   // =====================================================


   const filteredStudents = useMemo(() => {

      const query = search.trim().toLowerCase();


      return students.filter((student) => {

         const matchesSearch = [

            student.name,

            student.studentId,

            student.rollNumber,

            student.className,

            student.section,

         ]

            .join(" ")

            .toLowerCase()

            .includes(query);


         const matchesFilter =

            filter === "all" ||

            (filter === "notMarked"

               ? !student.status

               : student.status === filter);


         return matchesSearch && matchesFilter;

      });

   }, [students, search, filter]);


   // =====================================================

   // CSV EXPORT

   // =====================================================


   const exportCSV = () => {

      if (!students.length) {

         setError("Export karne ke liye attendance data nahi hai.");

         return;

      }


      const escapeCSV = (value) =>

         `"${String(value ?? "").replace(/"/g, '""')}"`;


      const rows = [

         [

            "Name",

            "Student ID",

            "Roll Number",

            "Class",

            "Section",

            "Date",

            "Status",

            "Remarks",

         ],

         ...students.map((student) => [

            student.name,

            student.studentId,

            student.rollNumber,

            student.className,

            student.section,

            date,

            student.status || "Not Marked",

            student.remarks,

         ]),

      ];


      const csv = rows

         .map((row) => row.map(escapeCSV).join(","))

         .join("\n");


      const blob = new Blob(["\uFEFF" + csv], {

         type: "text/csv;charset=utf-8;",

      });


      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");


      anchor.href = url;

      anchor.download = `attendance-${className}-${section}-${date}.csv`;

      anchor.click();


      URL.revokeObjectURL(url);

   };


   const completion =

      counts.total > 0

         ? Math.round(

            ((counts.present + counts.absent + counts.late) /

               counts.total) *

            100

         )

         : 0;


   // =====================================================

   // UI

   // =====================================================


   return (

      <div className="min-h-screen overflow-x-hidden bg-[#f5f7fc] text-slate-800">

         <style>{`

        @keyframes attendanceUp {

          from { opacity: 0; transform: translateY(18px); }

          to { opacity: 1; transform: translateY(0); }

        }


        .attendance-enter {

          animation: attendanceUp .45s ease both;

        }


        @media (prefers-reduced-motion: reduce) {

          .attendance-enter {

            animation: none !important;

          }

        }

      `}</style>


         {/* HEADER */}

         <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">

            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-4 sm:px-6">

               <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl text-white shadow-lg">

                     📅

                  </div>


                  <div className="min-w-0">

                     <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">

                        School Management

                     </p>

                     <h1 className="truncate text-lg font-black text-slate-900 sm:text-xl">

                        Attendance Center

                     </h1>

                  </div>

               </div>


               <div className="flex items-center gap-2">

                  <Link

                     to="/admin/dashboard"

                     className="rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 sm:px-4"

                  >

                     ← <span className="hidden sm:inline">Dashboard</span>

                  </Link>


                  <button

                     onClick={() =>

                        loadAttendance(className, section, date)

                     }

                     disabled={loading}

                     className="h-10 w-10 rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 disabled:opacity-50"

                     title="Refresh"

                  >

                     {loading ? "⏳" : "↻"}

                  </button>

               </div>

            </div>

         </header>


         <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9">

            {/* HERO */}

            <section className="attendance-enter relative mb-7 overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 p-6 text-white shadow-xl sm:p-9 lg:p-10">

               <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" />

               <div className="absolute -bottom-36 right-1/4 h-72 w-72 rounded-full bg-white/10" />


               <div className="relative max-w-3xl">

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold tracking-wider">

                     <span className="h-2 w-2 rounded-full bg-emerald-300" />

                     ADMIN CONTROL CENTER

                  </span>


                  <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">

                     Smart Attendance

                     <br />

                     <span className="text-blue-200">

                        Management System

                     </span>

                  </h2>


                  <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">

                     Manage daily student attendance, update records and

                     monitor every class from one place.

                  </p>

               </div>

            </section>


            {/* ALERTS */}

            {error && (

               <div className="mb-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">

                  <span className="text-xl">⚠️</span>

                  <p className="text-sm font-semibold">{error}</p>

                  <button

                     onClick={() => setError("")}

                     className="ml-auto font-bold"

                  >

                     ×

                  </button>

               </div>

            )}


            {message && (

               <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">

                  <span className="text-xl">✓</span>

                  <p className="text-sm font-semibold">{message}</p>

                  <button

                     onClick={() => setMessage("")}

                     className="ml-auto font-bold"

                  >

                     ×

                  </button>

               </div>

            )}


            {/* FILTER PANEL */}

            <section className="attendance-enter mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

               <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                     <p className="text-xs font-black uppercase tracking-widest text-blue-600">

                        Attendance Setup

                     </p>

                     <h3 className="mt-1 text-xl font-black text-slate-900">

                        Select Class & Date

                     </h3>

                     <p className="mt-1 text-sm text-slate-500">

                        Default: All Classes and All Sections

                     </p>

                  </div>


                  <span className="text-xs font-bold text-slate-400">

                     STEP 01 · FILTER STUDENTS

                  </span>

               </div>


               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div>

                     <label className="mb-2 block text-sm font-bold text-slate-600">

                        Class

                     </label>

                     <select

                        value={className}

                        onChange={(e) => handleClassChange(e.target.value)}

                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

                     >

                        <option value="all">All Classes</option>

                        {classes.map((item) => (

                           <option key={item} value={item}>

                              {item}

                           </option>

                        ))}

                     </select>

                  </div>


                  <div>

                     <label className="mb-2 block text-sm font-bold text-slate-600">

                        Section

                     </label>

                     <select

                        value={section}

                        onChange={(e) => handleSectionChange(e.target.value)}

                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

                     >

                        <option value="all">All Sections</option>

                        {sections.map((item) => (

                           <option key={item} value={item}>

                              {item}

                           </option>

                        ))}

                     </select>

                  </div>


                  <div>

                     <label className="mb-2 block text-sm font-bold text-slate-600">

                        Attendance Date

                     </label>

                     <input

                        type="date"

                        value={date}

                        max={today()}

                        onChange={(e) => handleDateChange(e.target.value)}

                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

                     />

                  </div>


                  <div className="flex items-end">

                     <button

                        onClick={() =>

                           loadAttendance(className, section, date)

                        }

                        disabled={loading}

                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"

                     >

                        {loading ? "Loading..." : "🔍 Load Students"}

                     </button>

                  </div>

               </div>

            </section>


            {/* SUMMARY */}

            <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">

               <SummaryCard icon="👥" title="Total Students" value={counts.total} color="blue" />

               <SummaryCard icon="✓" title="Present" value={counts.present} color="emerald" />

               <SummaryCard icon="✕" title="Absent" value={counts.absent} color="rose" />

               <SummaryCard icon="◷" title="Late" value={counts.late} color="amber" />

               <SummaryCard icon="⌛" title="Not Marked" value={counts.notMarked} color="slate" />

            </div>


            {/* STUDENT TABLE */}

            <section className="attendance-enter overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

               <div className="border-b border-slate-100 p-5 sm:p-7">

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                     <div>

                        <p className="text-xs font-black uppercase tracking-widest text-blue-600">

                           STEP 02 · MARK ATTENDANCE

                        </p>

                        <h3 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">

                           Student Attendance List

                        </h3>

                        <p className="mt-1 text-sm text-slate-500">

                           {loaded

                              ? `${className === "all" ? "All Classes" : `Class ${className}`} · ${section === "all" ? "All Sections" : `Section ${section}`} · ${date}`

                              : "Loading students..."}

                        </p>

                     </div>


                     {loaded && students.length > 0 && (

                        <div className="flex flex-wrap gap-2">

                           <button

                              onClick={() => markAll("present")}

                              className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"

                           >

                              ✓ All Present

                           </button>


                           <button

                              onClick={() => markAll("absent")}

                              className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-black text-rose-700 transition hover:bg-rose-100"

                           >

                              ✕ All Absent

                           </button>


                           <button

                              onClick={exportCSV}

                              className="rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-200"

                           >

                              ↓ Export CSV

                           </button>

                        </div>

                     )}

                  </div>


                  {loaded && students.length > 0 && (

                     <>

                        <div className="mt-6 flex flex-col gap-3 md:flex-row">

                           <input

                              value={search}

                              onChange={(e) => setSearch(e.target.value)}

                              placeholder="Search name, ID, roll number or class..."

                              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

                           />


                           <select

                              value={filter}

                              onChange={(e) => setFilter(e.target.value)}

                              className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100"

                           >

                              <option value="all">All Students</option>

                              <option value="present">Present</option>

                              <option value="absent">Absent</option>

                              <option value="late">Late</option>

                              <option value="notMarked">Not Marked</option>

                           </select>

                        </div>


                        <div className="mt-5">

                           <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">

                              <span>Attendance marking progress</span>

                              <span>{completion}%</span>

                           </div>


                           <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                              <div

                                 className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"

                                 style={{ width: `${completion}%` }}

                              />

                           </div>

                        </div>

                     </>

                  )}

               </div>


               {!loaded ? (

                  <div className="px-5 py-20 text-center">

                     <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">

                        📋

                     </div>

                     <h4 className="mt-5 text-xl font-black text-slate-800">

                        Loading Attendance...

                     </h4>

                     <p className="mt-2 text-sm text-slate-500">

                        Please wait while students are loaded.

                     </p>

                  </div>

               ) : students.length === 0 ? (

                  <div className="px-5 py-16 text-center">

                     <div className="text-5xl">👨‍🎓</div>

                     <h4 className="mt-4 text-xl font-black">

                        No Students Found

                     </h4>

                     <p className="mt-2 text-sm text-slate-500">

                        Check your Student records and try again.

                     </p>

                  </div>

               ) : filteredStudents.length === 0 ? (

                  <div className="py-12 text-center text-slate-500">

                     No matching students found.

                  </div>

               ) : (

                  <>

                     {/* DESKTOP TABLE */}

                     <div className="hidden overflow-x-auto lg:block">

                        <table className="w-full min-w-[1050px] text-left">

                           <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                              <tr>

                                 <th className="px-6 py-4">Student</th>

                                 <th className="px-5 py-4">Class</th>

                                 <th className="px-5 py-4">Section</th>

                                 <th className="px-5 py-4">Roll No.</th>

                                 <th className="px-5 py-4">Student ID</th>

                                 <th className="px-5 py-4">Attendance Status</th>

                                 <th className="px-5 py-4">Remarks</th>

                              </tr>

                           </thead>


                           <tbody className="divide-y divide-slate-100">

                              {filteredStudents.map((student) => (

                                 <tr

                                    key={student._id}

                                    className="transition hover:bg-blue-50/40"

                                 >

                                    <td className="px-6 py-4">

                                       <div className="flex items-center gap-3">

                                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 font-black text-blue-700">

                                             {student.name.charAt(0).toUpperCase()}

                                          </div>

                                          <span className="font-bold text-slate-800">

                                             {student.name}

                                          </span>

                                       </div>

                                    </td>


                                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">

                                       {student.className || "—"}

                                    </td>


                                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">

                                       {student.section || "—"}

                                    </td>


                                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">

                                       {student.rollNumber || "—"}

                                    </td>


                                    <td className="px-5 py-4 text-sm text-slate-500">

                                       {student.studentId || "—"}

                                    </td>


                                    <td className="px-5 py-4">

                                       <StatusButtons

                                          value={student.status}

                                          onChange={(status) =>

                                             updateStudent(student._id, { status })

                                          }

                                       />

                                    </td>


                                    <td className="px-5 py-4">

                                       <input

                                          value={student.remarks}

                                          onChange={(e) =>

                                             updateStudent(student._id, {

                                                remarks: e.target.value,

                                             })

                                          }

                                          placeholder="Optional remarks"

                                          className="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"

                                       />

                                    </td>

                                 </tr>

                              ))}

                           </tbody>

                        </table>

                     </div>


                     {/* MOBILE / TABLET CARDS */}

                     <div className="space-y-4 p-4 sm:p-5 lg:hidden">

                        {filteredStudents.map((student) => (

                           <div

                              key={student._id}

                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"

                           >

                              <div className="mb-4 flex items-center gap-3">

                                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-lg font-black text-blue-700">

                                    {student.name.charAt(0).toUpperCase()}

                                 </div>


                                 <div className="min-w-0">

                                    <h4 className="truncate font-black text-slate-800">

                                       {student.name}

                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">

                                       Class: {student.className || "—"} · Section:{" "}

                                       {student.section || "—"}

                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">

                                       Roll: {student.rollNumber || "—"} · ID:{" "}

                                       {student.studentId || "—"}

                                    </p>

                                 </div>

                              </div>


                              <StatusButtons

                                 value={student.status}

                                 onChange={(status) =>

                                    updateStudent(student._id, { status })

                                 }

                              />


                              <input

                                 value={student.remarks}

                                 onChange={(e) =>

                                    updateStudent(student._id, {

                                       remarks: e.target.value,

                                    })

                                 }

                                 placeholder="Optional remarks..."

                                 className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"

                              />

                           </div>

                        ))}

                     </div>


                     {/* SAVE FOOTER */}

                     <div className="sticky bottom-0 flex flex-col gap-4 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5">

                        <div>

                           <p className="font-black text-slate-900">

                              {counts.total} Students

                           </p>

                           <p className="mt-1 text-xs text-slate-500">

                              {counts.notMarked} students still not marked

                           </p>

                        </div>


                        <button

                           onClick={saveAttendance}

                           disabled={

                              saving ||

                              loading ||

                              counts.total === 0 ||

                              counts.notMarked > 0

                           }

                           className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3.5 font-black text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"

                        >

                           {saving ? "Saving Attendance..." : "✓ Save Attendance"}

                        </button>

                     </div>

                  </>

               )}

            </section>


            <footer className="py-8 text-center text-xs text-slate-400">

               School Management · Admin Attendance Center

            </footer>

         </main>

      </div>

   );

}


// =====================================================

// SUMMARY CARD

// =====================================================


function SummaryCard({ icon, title, value, color }) {

   const styles = {

      blue: "bg-blue-50 text-blue-700",

      emerald: "bg-emerald-50 text-emerald-700",

      rose: "bg-rose-50 text-rose-700",

      amber: "bg-amber-50 text-amber-700",

      slate: "bg-slate-100 text-slate-600",

   };


   return (

      <div className="attendance-enter rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-5">

         <div

            className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black ${styles[color]}`}

         >

            {icon}

         </div>


         <p className="mt-4 text-xs font-bold text-slate-500 sm:text-sm">

            {title}

         </p>


         <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">

            {value}

         </p>

      </div>

   );

}


// =====================================================

// STATUS BUTTONS

// =====================================================


function StatusButtons({ value, onChange }) {

   const styles = {

      present:

         value === "present"

            ? "bg-emerald-600 text-white border-emerald-600 shadow-md"

            : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50",


      absent:

         value === "absent"

            ? "bg-rose-600 text-white border-rose-600 shadow-md"

            : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50",


      late:

         value === "late"

            ? "bg-amber-500 text-white border-amber-500 shadow-md"

            : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50",

   };


   return (

      <div className="flex flex-wrap gap-2">

         {statusOptions.map((option) => (

            <button

               key={option.value}

               type="button"

               onClick={() => onChange(option.value)}

               aria-pressed={value === option.value}

               className={`rounded-lg border px-3 py-2 text-xs font-black transition ${styles[option.value]}`}

            >

               {option.icon} {option.label}

            </button>

         ))}

      </div>

   );

}
