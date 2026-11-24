import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";



// =====================================================

// API CONFIG

// =====================================================



const API_URL = (
   import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "").replace(/\/api$/i, "");



// =====================================================

// AUTH

// =====================================================



const getToken = () =>

   localStorage.getItem("schoolToken") ||

   sessionStorage.getItem("schoolToken") ||

   localStorage.getItem("token") ||

   sessionStorage.getItem("token");



// =====================================================

// DATE HELPERS

// =====================================================



const formatDate = (dateValue) => {

   if (!dateValue) return "-";



   const date = new Date(dateValue);



   if (Number.isNaN(date.getTime())) return "-";



   return date.toLocaleDateString("en-IN", {

      day: "2-digit",

      month: "short",

      year: "numeric",

   });

};



const getDay = (dateValue) => {

   if (!dateValue) return "-";



   const date = new Date(dateValue);



   if (Number.isNaN(date.getTime())) return "-";



   return date.toLocaleDateString("en-IN", {

      weekday: "long",

   });

};



const getMonthOptions = () => {

   const options = [];

   const currentDate = new Date();



   for (let i = 0; i < 12; i++) {

      const date = new Date(

         currentDate.getFullYear(),

         currentDate.getMonth() - i,

         1

      );



      const month = String(date.getMonth() + 1).padStart(2, "0");

      const year = date.getFullYear();



      options.push({

         value: `${month}-${year}`,

         label: date.toLocaleDateString("en-IN", {

            month: "long",

            year: "numeric",

         }),

      });

   }



   return options;

};



const monthOptions = getMonthOptions();



// =====================================================

// STATUS HELPERS

// =====================================================



const normalizeStatus = (status) =>

   String(status || "").toLowerCase().trim();



const getStatusStyle = (status) => {

   const normalized = normalizeStatus(status);



   if (normalized === "present") {

      return {

         badge: "bg-emerald-100 text-emerald-700 border-emerald-200",

         dot: "bg-emerald-500",

         icon: "✓",

      };

   }



   if (normalized === "absent") {

      return {

         badge: "bg-rose-100 text-rose-700 border-rose-200",

         dot: "bg-rose-500",

         icon: "✕",

      };

   }



   if (normalized === "late") {

      return {

         badge: "bg-amber-100 text-amber-700 border-amber-200",

         dot: "bg-amber-500",

         icon: "◷",

      };

   }



   return {

      badge: "bg-slate-100 text-slate-600 border-slate-200",

      dot: "bg-slate-400",

      icon: "•",

   };

};



// =====================================================

// MAIN COMPONENT

// =====================================================



export default function Attendance() {

   const [selectedMonth, setSelectedMonth] = useState("All");

   const [selectedStatus, setSelectedStatus] = useState("All");

   const [search, setSearch] = useState("");



   const [attendance, setAttendance] = useState([]);



   const [summary, setSummary] = useState({

      total: 0,

      present: 0,

      absent: 0,

      late: 0,

      percentage: 0,

   });



   const [student, setStudent] = useState(null);



   const [loading, setLoading] = useState(true);

   const [refreshing, setRefreshing] = useState(false);

   const [error, setError] = useState("");



   // ===================================================

   // LOAD ATTENDANCE

   // ===================================================



   const loadAttendance = async (isRefresh = false) => {

      try {

         if (isRefresh) {

            setRefreshing(true);

         } else {

            setLoading(true);

         }



         setError("");



         const token = getToken();



         if (!token) {

            setError("Login session nahi mili. Please login again.");

            return;

         }



         let url = `${API_URL}/api/attendance/my`;



         if (selectedMonth !== "All") {

            const [month, year] = selectedMonth.split("-");



            url += `?month=${Number(month)}&year=${Number(year)}`;

         }



         const response = await fetch(url, {

            method: "GET",

            headers: {

               Authorization: `Bearer ${token}`,

            },

         });



         const data = await response.json();



         if (!response.ok) {

            if (response.status === 401 || response.status === 403) {

               setError(

                  "Login session expire ho gayi hai. Please login again."

               );

            } else {

               setError(

                  data.message || "Attendance load nahi ho saki."

               );

            }



            return;

         }



         if (!data.success) {

            setError(

               data.message || "Attendance load nahi ho saki."

            );

            return;

         }



         setStudent(data.student || null);



         setSummary({

            total: Number(data.summary?.total || 0),

            present: Number(data.summary?.present || 0),

            absent: Number(data.summary?.absent || 0),

            late: Number(data.summary?.late || 0),

            percentage: Math.min(

               Math.max(Number(data.summary?.percentage || 0), 0),

               100

            ),

         });



         setAttendance(

            Array.isArray(data.attendance) ? data.attendance : []

         );

      } catch (err) {

         console.error("Student attendance error:", err);

         setError("Server se connection nahi ho paaya.");

      } finally {

         setLoading(false);

         setRefreshing(false);

      }

   };



   useEffect(() => {

      loadAttendance();

   }, [selectedMonth]);



   // ===================================================

   // SUMMARY VALUES

   // ===================================================



   const totalClasses = summary.total;

   const presentCount = summary.present;

   const absentCount = summary.absent;

   const lateCount = summary.late;

   const attendancePercentage = summary.percentage;



   const remainingCount = Math.max(

      totalClasses - presentCount - absentCount - lateCount,

      0

   );



   // ===================================================

   // FILTER + SEARCH

   // ===================================================



   const filteredAttendance = useMemo(() => {

      return [...attendance]

         .filter((item) => {

            const status = normalizeStatus(item.status);



            const matchesStatus =

               selectedStatus === "All" ||

               status === selectedStatus.toLowerCase();



            const searchableText = [

               formatDate(item.date),

               getDay(item.date),

               item.status,

               item.remarks,

            ]

               .join(" ")

               .toLowerCase();



            const matchesSearch = searchableText.includes(

               search.toLowerCase().trim()

            );



            return matchesStatus && matchesSearch;

         })

         .sort(

            (a, b) => new Date(b.date) - new Date(a.date)

         );

   }, [attendance, selectedStatus, search]);



   // ===================================================

   // CSV EXPORT

   // ===================================================



   const exportCSV = () => {

      if (filteredAttendance.length === 0) {

         alert("Export karne ke liye attendance records nahi hain.");

         return;

      }



      const rows = [

         ["Date", "Day", "Status", "Remarks"],

         ...filteredAttendance.map((item) => [

            formatDate(item.date),

            getDay(item.date),

            item.status || "",

            item.remarks || "",

         ]),

      ];



      const csvContent = rows

         .map((row) =>

            row

               .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)

               .join(",")

         )

         .join("\n");



      const blob = new Blob(

         ["\uFEFF" + csvContent],

         { type: "text/csv;charset=utf-8;" }

      );



      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");



      link.href = url;

      link.download = `Attendance_Report_${student?.studentId || "Student"}.csv`;



      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);



      URL.revokeObjectURL(url);

   };



   // ===================================================

   // PRINT

   // ===================================================



   const printReport = () => {

      window.print();

   };



   // ===================================================

   // CLEAR FILTERS

   // ===================================================



   const clearFilters = () => {

      setSearch("");

      setSelectedStatus("All");

      setSelectedMonth("All");

   };



   // ===================================================

   // LOADING SCREEN

   // ===================================================



   if (loading) {

      return (

         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-violet-900 to-slate-950">

            <div className="text-center text-white">

               <div className="relative w-24 h-24 mx-auto">

                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-pink-500 to-cyan-400 animate-spin" />

                  <div className="absolute inset-1 rounded-3xl bg-indigo-950 flex items-center justify-center text-4xl">

                     📊

                  </div>

               </div>



               <h2 className="mt-7 text-2xl font-black">

                  Attendance Portal

               </h2>



               <p className="mt-2 text-indigo-200 animate-pulse">

                  Loading your attendance...

               </p>

            </div>

         </div>

      );

   }



   // ===================================================

   // MAIN UI

   // ===================================================



   return (

      <div className="min-h-screen overflow-x-hidden bg-[#f5f6ff] text-slate-800">



         {/* BACKGROUND DECORATION */}



         <div className="fixed inset-0 pointer-events-none overflow-hidden">

            <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-violet-300/20 blur-3xl" />

            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-pink-300/10 blur-3xl" />

         </div>



         {/* HEADER */}



         <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white shadow-sm print:hidden">

            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-5">



               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">



                  <div>

                     <Link

                        to="/student/dashboard"

                        className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-indigo-700 transition mb-3"

                     >

                        <span>←</span>

                        Back to Dashboard

                     </Link>



                     <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-violet-200">

                           📊

                        </div>



                        <div>

                           <p className="text-xs uppercase tracking-[3px] font-bold text-violet-500">

                              Student Portal

                           </p>



                           <h1 className="text-2xl sm:text-3xl font-black text-slate-900">

                              My Attendance

                           </h1>



                           <p className="text-sm text-slate-500 mt-1">

                              Track your attendance and academic presence.

                           </p>

                        </div>

                     </div>



                     {student && (

                        <div className="mt-4 flex flex-wrap gap-2">

                           <span className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-bold">

                              👤 {student.name}

                           </span>



                           <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">

                              🆔 {student.studentId}

                           </span>



                           <span className="px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold">

                              🏫 Class {student.className}

                              {student.section ? ` - ${student.section}` : ""}

                           </span>

                        </div>

                     )}

                  </div>



                  {/* HEADER ACTIONS */}



                  <div className="flex flex-wrap gap-3">

                     <button

                        onClick={() => loadAttendance(true)}

                        disabled={refreshing}

                        className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 hover:-translate-y-1 transition disabled:opacity-50"

                     >

                        {refreshing ? "⏳ Loading..." : "↻ Refresh"}

                     </button>



                     <button

                        onClick={printReport}

                        className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:-translate-y-1 transition"

                     >

                        🖨️ Print

                     </button>



                     <button

                        onClick={exportCSV}

                        className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-200 hover:-translate-y-1 transition"

                     >

                        📥 Export CSV

                     </button>

                  </div>

               </div>

            </div>

         </header>



         {/* MAIN CONTENT */}



         <main className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">



            {/* ERROR */}



            {error && (

               <div className="mb-7 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                     <div>

                        <p className="font-black">

                           ⚠️ Attendance Error

                        </p>

                        <p className="mt-1 text-sm">{error}</p>

                     </div>



                     <button

                        onClick={() => loadAttendance()}

                        className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700"

                     >

                        Try Again

                     </button>

                  </div>

               </div>

            )}



            {/* HERO BANNER */}



            <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#312078] via-[#5637bd] to-[#087eaa] p-6 sm:p-9 text-white shadow-2xl shadow-violet-200 mb-8">



               <div className="absolute -right-12 -top-20 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl" />

               <div className="absolute right-40 bottom-[-100px] w-64 h-64 rounded-full bg-pink-400/20 blur-3xl" />



               <div className="absolute right-8 top-5 text-[100px] sm:text-[150px] opacity-10 animate-pulse">

                  📈

               </div>



               <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">

                  <div className="max-w-2xl">

                     <span className="inline-flex px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest">

                        ✨ YOUR ATTENDANCE OVERVIEW

                     </span>



                     <h2 className="mt-5 text-3xl sm:text-4xl font-black">

                        Your Presence,

                        <span className="block text-cyan-300">

                           Your Progress! 🚀

                        </span>

                     </h2>



                     <p className="mt-4 text-sm sm:text-base leading-7 text-indigo-100 max-w-xl">

                        Stay consistent, attend your classes and keep

                        building a strong academic record. Check your

                        attendance history anytime.

                     </p>

                  </div>



                  <div className="relative shrink-0 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 min-w-[220px]">

                     <p className="text-xs uppercase tracking-widest text-indigo-100 font-bold">

                        Overall Attendance

                     </p>



                     <h3 className="text-5xl font-black mt-3 text-cyan-300">

                        {attendancePercentage}%

                     </h3>



                     <div className="h-2.5 rounded-full bg-white/20 overflow-hidden mt-5">

                        <div

                           className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-1000"

                           style={{ width: `${attendancePercentage}%` }}

                        />

                     </div>



                     <p className="mt-3 text-xs text-indigo-100">

                        {presentCount} present out of {totalClasses} classes

                     </p>

                  </div>

               </div>

            </section>



            {/* SUMMARY CARDS */}



            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">



               <SummaryCard

                  title="Attendance"

                  value={`${attendancePercentage}%`}

                  subtitle="Overall percentage"

                  icon="📊"

                  gradient="from-blue-500 to-indigo-600"

                  light="bg-blue-50"

               />



               <SummaryCard

                  title="Total Classes"

                  value={totalClasses}

                  subtitle="Recorded classes"

                  icon="🏫"

                  gradient="from-violet-500 to-purple-600"

                  light="bg-violet-50"

               />



               <SummaryCard

                  title="Present"

                  value={presentCount}

                  subtitle="Days attended"

                  icon="✅"

                  gradient="from-emerald-400 to-teal-600"

                  light="bg-emerald-50"

               />



               <SummaryCard

                  title="Absent"

                  value={absentCount}

                  subtitle="Days missed"

                  icon="❌"

                  gradient="from-rose-400 to-pink-600"

                  light="bg-rose-50"

               />



               <SummaryCard

                  title="Late"

                  value={lateCount}

                  subtitle="Late arrivals"

                  icon="⏰"

                  gradient="from-amber-400 to-orange-600"

                  light="bg-amber-50"

               />

            </section>



            {/* ATTENDANCE ANALYTICS */}



            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">



               <div className="lg:col-span-2 bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-indigo-100/30 p-6 sm:p-8">

                  <div className="flex items-center justify-between gap-3 mb-7">

                     <div>

                        <h2 className="text-xl font-black text-slate-900">

                           Attendance Analytics

                        </h2>

                        <p className="text-sm text-slate-500 mt-1">

                           Your attendance distribution

                        </p>

                     </div>



                     <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">

                        📈

                     </div>

                  </div>



                  <div className="space-y-6">

                     <ProgressRow

                        title="Present"

                        value={presentCount}

                        total={totalClasses}

                        color="bg-gradient-to-r from-emerald-400 to-teal-500"

                        textColor="text-emerald-600"

                     />



                     <ProgressRow

                        title="Absent"

                        value={absentCount}

                        total={totalClasses}

                        color="bg-gradient-to-r from-rose-400 to-pink-500"

                        textColor="text-rose-600"

                     />



                     <ProgressRow

                        title="Late"

                        value={lateCount}

                        total={totalClasses}

                        color="bg-gradient-to-r from-amber-400 to-orange-500"

                        textColor="text-amber-600"

                     />



                     {remainingCount > 0 && (

                        <ProgressRow

                           title="Other / Unmarked"

                           value={remainingCount}

                           total={totalClasses}

                           color="bg-gradient-to-r from-slate-400 to-slate-500"

                           textColor="text-slate-600"

                        />

                     )}

                  </div>

               </div>



               {/* ATTENDANCE INSIGHT */}



               <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#16143c] to-[#39217c] text-white p-7 shadow-xl">

                  <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-fuchsia-500/20 blur-3xl" />



                  <div className="relative">

                     <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">

                        💡

                     </div>



                     <h3 className="mt-6 text-xl font-black">

                        Attendance Insight

                     </h3>



                     <p className="mt-3 text-sm text-indigo-200 leading-7">

                        {totalClasses === 0

                           ? "Abhi attendance records available nahi hain. Jab school attendance mark karega, yahan aapki progress dikhegi."

                           : attendancePercentage >= 90

                              ? "Excellent! Aapki attendance bahut achhi hai. Isi consistency ko maintain rakhein."

                              : attendancePercentage >= 75

                                 ? "Good progress! Regular classes attend karte rahein aur apni attendance maintain rakhein."

                                 : attendancePercentage >= 60

                                    ? "Aapki attendance improve ho sakti hai. Regular classes attend karne ki koshish karein."

                                    : "Aapki attendance kam hai. School ke saath apni attendance situation discuss karein."}

                     </p>



                     <div className="mt-7 p-4 rounded-2xl bg-white/10 border border-white/10">

                        <p className="text-xs text-indigo-200">

                           Your attendance percentage

                        </p>

                        <p className="text-3xl font-black mt-1 text-cyan-300">

                           {attendancePercentage}%

                        </p>

                     </div>

                  </div>

               </div>

            </section>



            {/* FILTER PANEL */}



            <section className="bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-indigo-100/30 p-5 sm:p-7 mb-7 print:hidden">



               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">

                  <div>

                     <h2 className="text-xl font-black text-slate-900">

                        Attendance Records

                     </h2>

                     <p className="text-sm text-slate-500 mt-1">

                        Search, filter and manage your attendance history.

                     </p>

                  </div>



                  <button

                     onClick={clearFilters}

                     className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"

                  >

                     ↺ Clear Filters

                  </button>

               </div>



               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">



                  {/* SEARCH */}



                  <div>

                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">

                        Search Records

                     </label>



                     <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

                           🔍

                        </span>



                        <input

                           type="text"

                           value={search}

                           onChange={(e) => setSearch(e.target.value)}

                           placeholder="Search date or remarks..."

                           className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"

                        />

                     </div>

                  </div>



                  {/* MONTH FILTER */}



                  <div>

                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">

                        Select Month

                     </label>



                     <select

                        value={selectedMonth}

                        onChange={(e) => setSelectedMonth(e.target.value)}

                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"

                     >

                        <option value="All">All Records</option>



                        {monthOptions.map((month) => (

                           <option key={month.value} value={month.value}>

                              {month.label}

                           </option>

                        ))}

                     </select>

                  </div>



                  {/* STATUS FILTER */}



                  <div>

                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">

                        Filter By Status

                     </label>



                     <select

                        value={selectedStatus}

                        onChange={(e) => setSelectedStatus(e.target.value)}

                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"

                     >

                        <option value="All">All Status</option>

                        <option value="present">Present</option>

                        <option value="absent">Absent</option>

                        <option value="late">Late</option>

                     </select>

                  </div>

               </div>



               <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-5 border-t border-slate-100">

                  <p className="text-sm text-slate-500">

                     Showing{" "}

                     <span className="font-black text-violet-600">

                        {filteredAttendance.length}

                     </span>{" "}

                     of {attendance.length} records

                  </p>



                  <div className="flex flex-wrap gap-2 text-xs font-bold">

                     <span className="px-3 py-2 rounded-full bg-emerald-50 text-emerald-700">

                        Present: {presentCount}

                     </span>



                     <span className="px-3 py-2 rounded-full bg-rose-50 text-rose-700">

                        Absent: {absentCount}

                     </span>



                     <span className="px-3 py-2 rounded-full bg-amber-50 text-amber-700">

                        Late: {lateCount}

                     </span>

                  </div>

               </div>

            </section>



            {/* ATTENDANCE TABLE */}



            <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-xl shadow-indigo-100/30">



               <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div>

                     <h2 className="text-xl font-black text-slate-900">

                        Daily Attendance History

                     </h2>

                     <p className="mt-1 text-sm text-slate-500">

                        Your daily attendance records and remarks.

                     </p>

                  </div>



                  <span className="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-xs font-black">

                     📅 {filteredAttendance.length} Records

                  </span>

               </div>



               {/* DESKTOP TABLE */}



               <div className="hidden md:block overflow-x-auto">

                  <table className="w-full">

                     <thead className="bg-slate-50">

                        <tr>

                           <th className="px-6 py-5 text-left text-xs uppercase tracking-wider font-black text-slate-500">

                              Date

                           </th>



                           <th className="px-6 py-5 text-left text-xs uppercase tracking-wider font-black text-slate-500">

                              Day

                           </th>



                           <th className="px-6 py-5 text-left text-xs uppercase tracking-wider font-black text-slate-500">

                              Status

                           </th>



                           <th className="px-6 py-5 text-left text-xs uppercase tracking-wider font-black text-slate-500">

                              Remarks

                           </th>

                        </tr>

                     </thead>



                     <tbody className="divide-y divide-slate-100">

                        {filteredAttendance.map((item, index) => (

                           <AttendanceTableRow

                              key={item._id || `${item.date}-${index}`}

                              item={item}

                           />

                        ))}

                     </tbody>

                  </table>

               </div>



               {/* MOBILE CARDS */}



               <div className="md:hidden p-4 space-y-3">

                  {filteredAttendance.map((item, index) => (

                     <AttendanceMobileCard

                        key={item._id || `${item.date}-${index}`}

                        item={item}

                     />

                  ))}

               </div>



               {/* EMPTY STATE */}



               {filteredAttendance.length === 0 && (

                  <div className="py-16 px-5 text-center">

                     <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center text-4xl">

                        📋

                     </div>



                     <h3 className="mt-5 text-xl font-black text-slate-800">

                        No Attendance Records Found

                     </h3>



                     <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">

                        Aapke selected filters ke according koi attendance

                        record nahi mila. Filters clear karke dobara check karein.

                     </p>



                     <button

                        onClick={clearFilters}

                        className="mt-5 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-lg hover:scale-105 transition"

                     >

                        Clear All Filters

                     </button>

                  </div>

               )}

            </section>



            {/* FOOTER */}



            <footer className="mt-8 py-6 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 print:hidden">

               <p>

                  © {new Date().getFullYear()} StudentHub. All rights reserved.

               </p>



               <p className="font-bold text-violet-600">

                  Learn • Grow • Succeed ✨

               </p>

            </footer>

         </main>



         {/* PRINT STYLES */}



         <style>{`

        @media print {

          body {

            background: white !important;

          }



          header,

          footer,

          button,

          select,

          input,

          .print\\\\:hidden {

            display: none !important;

          }



          main {

            max-width: 100% !important;

            padding: 10px !important;

          }



          section {

            box-shadow: none !important;

            break-inside: avoid;

          }



          .hidden.md\\\\:block {

            display: block !important;

          }



          .md\\\\:hidden {

            display: none !important;

          }



          table {

            width: 100% !important;

          }

        }

      `}</style>

      </div>

   );

}



// =====================================================

// SUMMARY CARD

// =====================================================



function SummaryCard({

   title,

   value,

   subtitle,

   icon,

   gradient,

   light,

}) {

   return (

      <div className="group relative overflow-hidden bg-white rounded-3xl p-5 border border-white shadow-lg shadow-indigo-100/40 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">

         <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${light} opacity-80 group-hover:scale-150 transition-transform duration-500`} />



         <div className="relative flex items-center justify-between gap-2">

            <div>

               <p className="text-sm font-semibold text-slate-500">

                  {title}

               </p>



               <h3 className="mt-3 text-3xl font-black text-slate-900">

                  {value}

               </h3>



               <p className="mt-2 text-xs text-slate-400">

                  {subtitle}

               </p>

            </div>



            <div className={`w-13 h-13 min-w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>

               {icon}

            </div>

         </div>



         <div className={`relative mt-5 h-1.5 rounded-full bg-gradient-to-r ${gradient} w-1/3 group-hover:w-full transition-all duration-500`} />

      </div>

   );

}



// =====================================================

// PROGRESS ROW

// =====================================================



function ProgressRow({

   title,

   value,

   total,

   color,

   textColor,

}) {

   const percentage =

      total > 0

         ? Math.min((value / total) * 100, 100)

         : 0;



   return (

      <div>

         <div className="flex items-center justify-between mb-2">

            <span className="text-sm font-bold text-slate-700">

               {title}

            </span>



            <span className={`text-sm font-black ${textColor}`}>

               {value} ({Math.round(percentage)}%)

            </span>

         </div>



         <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden">

            <div

               className={`h-full rounded-full ${color} transition-all duration-1000`}

               style={{ width: `${percentage}%` }}

            />

         </div>

      </div>

   );

}



// =====================================================

// DESKTOP TABLE ROW

// =====================================================



function AttendanceTableRow({ item }) {

   const style = getStatusStyle(item.status);



   return (

      <tr className="group hover:bg-violet-50/50 transition-colors">

         <td className="px-6 py-5 text-sm font-bold text-slate-800">

            {formatDate(item.date)}

         </td>



         <td className="px-6 py-5 text-sm text-slate-500">

            {getDay(item.date)}

         </td>



         <td className="px-6 py-5">

            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black ${style.badge}`}>

               <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />

               {item.status || "Unknown"}

            </span>

         </td>



         <td className="px-6 py-5 text-sm text-slate-500">

            {item.remarks || "No remarks"}

         </td>

      </tr>

   );

}



// =====================================================

// MOBILE ATTENDANCE CARD

// =====================================================



function AttendanceMobileCard({ item }) {

   const style = getStatusStyle(item.status);



   return (

      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm hover:shadow-md transition">

         <div className="flex items-center justify-between gap-3">

            <div>

               <p className="font-black text-slate-800">

                  {formatDate(item.date)}

               </p>



               <p className="text-xs text-slate-400 mt-1">

                  {getDay(item.date)}

               </p>

            </div>



            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black ${style.badge}`}>

               <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />

               {item.status || "Unknown"}

            </span>

         </div>



         <div className="mt-4 pt-3 border-t border-slate-100">

            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">

               Remarks

            </p>



            <p className="text-sm text-slate-600 mt-1">

               {item.remarks || "No remarks available"}

            </p>

         </div>

      </div>

   );

}
s