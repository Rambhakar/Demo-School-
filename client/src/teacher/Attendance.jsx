

import { useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {

   ArrowLeft, LayoutDashboard, CalendarCheck2, GraduationCap,

   CalendarDays, ShieldCheck, RefreshCw, Search, Users,

   CheckCircle2, XCircle, Clock3, Save, ClipboardCheck,

   BookOpen, AlertCircle, Check, UserRound, Activity,

   TrendingUp

} from "lucide-react";



const API_URL = (

   import.meta.env.VITE_API_URL || "http://localhost:5000"

).replace(/\/+$/, "").replace(/\/api$/i, "");



const getToken = () =>

   localStorage.getItem("schoolToken") ||

   sessionStorage.getItem("schoolToken") ||

   localStorage.getItem("token") ||

   sessionStorage.getItem("token");



const getToday = () => {

   const d = new Date();

   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

};



const getAcademicYear = () => {

   const d = new Date();

   const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;

   return `${y}-${String(y + 1).slice(-2)}`;

};



async function api(url, options = {}) {

   const token = getToken();

   if (!token) throw new Error("Login session nahi mili. Please login again.");



   const response = await fetch(`${API_URL}${url}`, {

      ...options,

      headers: {

         ...(options.body ? { "Content-Type": "application/json" } : {}),

         Authorization: `Bearer ${token}`,

         ...options.headers,

      },

   });



   let data = {};

   try {

      data = await response.json();

   } catch {

      data = {};

   }



   if (!response.ok || data.success === false) {

      throw new Error(data.message || data.error || `Request failed (${response.status})`);

   }

   return data;

}



const getTeacher = (data) =>

   data?.teacher || data?.data?.teacher || data?.data || data || {};



const getStudentRows = (data) => {

   const rows = data?.students || data?.data?.students || [];

   if (!Array.isArray(rows)) return [];



   return rows.map((row) => {

      const student = row?.student || row;

      return {

         ...student,

         _id: student?._id || student?.id,

         attendanceRecord: row?.attendance || null,

      };

   }).filter((s) => s?._id);

};



const getStudentName = (s) =>

   s?.name ||

   s?.fullName ||

   s?.user?.name ||

   s?.personalInfo?.name ||

   s?.studentName ||

   "Student Name Not Available";



const getId = (s) => String(s?._id || s?.id || s?.studentId || "");



const statusConfig = {

   present: {

      label: "Present",

      short: "P",

      active: "bg-emerald-500 text-white border-emerald-400",

      inactive: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",

   },

   absent: {

      label: "Absent",

      short: "A",

      active: "bg-rose-500 text-white border-rose-400",

      inactive: "border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",

   },

   late: {

      label: "Late",

      short: "L",

      active: "bg-amber-500 text-white border-amber-400",

      inactive: "border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",

   },

};



export default function TeacherAttendance() {

   const [profile, setProfile] = useState(null);

   const [assignments, setAssignments] = useState([]);

   const [className, setClassName] = useState("");

   const [section, setSection] = useState("");

   const [date, setDate] = useState(getToday());

   const [students, setStudents] = useState([]);

   const [attendance, setAttendance] = useState({});

   const [search, setSearch] = useState("");



   const [loadingProfile, setLoadingProfile] = useState(true);

   const [loading, setLoading] = useState(false);

   const [saving, setSaving] = useState(false);

   const [error, setError] = useState("");

   const [message, setMessage] = useState("");



   // Teacher profile and assigned classes

   const loadProfile = useCallback(async () => {

      try {

         setLoadingProfile(true);

         setError("");



         const data = await api("/api/teacher/profile");

         const teacher = getTeacher(data);

         setProfile(teacher);



         const year = getAcademicYear();

         const assigned = Array.isArray(teacher.teachingAssignments)

            ? teacher.teachingAssignments.filter((item) =>

               item.isActive !== false &&

               (!item.academicYear || item.academicYear === year) &&

               String(item.className || "").trim()

            )

            : [];



         setAssignments(assigned);



         const uniqueClasses = [

            ...new Set(assigned.map((item) => String(item.className).trim())),

         ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));



         setClassName((old) =>

            uniqueClasses.includes(old) ? old : uniqueClasses[0] || ""

         );

      } catch (err) {

         setError(err.message || "Teacher profile load nahi hui.");

      } finally {

         setLoadingProfile(false);

      }

   }, []);



   useEffect(() => {

      loadProfile();

   }, [loadProfile]);



   const classes = useMemo(

      () => [...new Set(assignments.map((a) => String(a.className).trim()))]

         .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),

      [assignments]

   );



   const selectedAssignments = useMemo(

      () => assignments.filter((a) => String(a.className).trim() === className),

      [assignments, className]

   );



   const allSectionsAssigned = useMemo(

      () => selectedAssignments.some(

         (a) => !Array.isArray(a.sections) || a.sections.length === 0

      ),

      [selectedAssignments]

   );



   const sections = useMemo(() => {

      if (allSectionsAssigned) return [];

      return [

         ...new Set(

            selectedAssignments.flatMap((a) =>

               Array.isArray(a.sections)

                  ? a.sections.map((s) => String(s).trim().toUpperCase())

                  : []

            )

         ),

      ].filter(Boolean).sort();

   }, [selectedAssignments, allSectionsAssigned]);



   useEffect(() => {

      if (!className || allSectionsAssigned) {

         setSection("");

         return;

      }

      setSection((old) => sections.includes(old) ? old : sections[0] || "");

   }, [className, allSectionsAssigned, sections]);



   const validSelection = Boolean(

      className && (allSectionsAssigned || (section && sections.includes(section)))

   );



   // Load students and their existing attendance

   const loadAttendance = useCallback(async () => {

      if (!validSelection || !date) {

         setStudents([]);

         setAttendance({});

         return;

      }



      try {

         setLoading(true);

         setError("");

         setMessage("");



         const params = new URLSearchParams({ className, date });

         if (section) params.set("section", section);



         const data = await api(`/api/attendance/class?${params.toString()}`);

         const list = getStudentRows(data);



         setStudents(list);



         const records = {};

         list.forEach((student) => {

            const id = getId(student);

            const saved = student.attendanceRecord;

            if (id && saved) {

               records[id] = {

                  status: saved.status || "",

                  remarks: saved.remarks || "",

               };

            }

         });



         setAttendance(records);

      } catch (err) {

         setStudents([]);

         setAttendance({});

         setError(err.message || "Students load nahi ho sake.");

      } finally {

         setLoading(false);

      }

   }, [className, section, date, validSelection]);



   useEffect(() => {

      loadAttendance();

   }, [loadAttendance]);



   const setStatus = (id, status) => {

      setAttendance((old) => ({

         ...old,

         [id]: { ...(old[id] || {}), status },

      }));

      setError("");

      setMessage("");

   };



   const setRemark = (id, remarks) => {

      setAttendance((old) => ({

         ...old,

         [id]: { ...(old[id] || {}), remarks },

      }));

   };



   const markAll = (status) => {

      const updated = { ...attendance };

      students.forEach((student) => {

         const id = getId(student);

         if (id) updated[id] = { ...(updated[id] || {}), status };

      });

      setAttendance(updated);

      setError("");

      setMessage("");

   };



   const filteredStudents = useMemo(() => {

      const q = search.trim().toLowerCase();

      if (!q) return students;



      return students.filter((s) =>

         getStudentName(s).toLowerCase().includes(q) ||

         String(s.studentId || "").toLowerCase().includes(q) ||

         String(s.rollNumber || "").toLowerCase().includes(q)

      );

   }, [students, search]);



   // Daily attendance summary

   const presentCount = students.filter((s) => attendance[getId(s)]?.status === "present").length;

   const absentCount = students.filter((s) => attendance[getId(s)]?.status === "absent").length;

   const lateCount = students.filter((s) => attendance[getId(s)]?.status === "late").length;



   const totalStudents = students.length;

   const totalAttendance = presentCount + lateCount;

   const markedCount = presentCount + absentCount + lateCount;

   const unmarkedCount = totalStudents - markedCount;



   const attendancePercentage = totalStudents

      ? Math.round((totalAttendance / totalStudents) * 100)

      : 0;



   const markingPercentage = totalStudents

      ? Math.round((markedCount / totalStudents) * 100)

      : 0;



   // Save attendance using the backend's required format

   const saveAttendance = async () => {

      if (!validSelection) {

         setError("Pehle assigned class aur section select karein.");

         return;

      }



      if (!students.length) {

         setError("Is class mein koi student nahi mila.");

         return;

      }



      const attendanceData = students.map((student) => {

         const studentId = getId(student);

         const record = attendance[studentId];



         if (!studentId || !record?.status) return null;



         return {

            studentId,

            status: record.status,

            remarks: record.remarks || "",

         };

      }).filter(Boolean);



      if (attendanceData.length !== students.length) {

         setError(`${students.length - attendanceData.length} students ki attendance mark nahi hui hai.`);

         return;

      }



      try {

         setSaving(true);

         setError("");

         setMessage("");



         const payload = { date, attendance: attendanceData };



         // Backend expects className and section together or neither.

         if (section) {

            payload.className = className;

            payload.section = section;

         }



         const result = await api("/api/attendance", {

            method: "POST",

            body: JSON.stringify(payload),

         });



         setMessage(result.message || `Attendance saved for ${attendanceData.length} students.`);

         await loadAttendance();

      } catch (err) {

         setError(err.message || "Attendance save nahi ho saki.");

      } finally {

         setSaving(false);

      }

   };



   if (loadingProfile) {

      return (

         <div className="min-h-screen flex items-center justify-center bg-[#080d1b] text-white">

            <div className="text-center">

               <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />

               <p className="mt-4 text-sm text-slate-300">Teacher profile load ho rahi hai...</p>

            </div>

         </div>

      );

   }



   return (

      <div className="min-h-screen bg-[#080d1b] text-white">

         <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">



            {/ PREMIUM HEADER /}

            <header className="relative mb-7 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#192747] via-[#111a31] to-[#0b1223] shadow-2xl">

               <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />

               <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />



               <div className="relative p-5 sm:p-8">

                  <div className="mb-9 flex flex-wrap items-center justify-between gap-4">

                     <Link

                        to="/teacher/dashboard"

                        className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-slate-200 transition hover:-translate-y-1 hover:bg-indigo-500/20">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white">

                           <ArrowLeft className="h-5 w-5" />

                        </span>

                        <span>

                           <span className="block">Back to Dashboard</span>

                           <span className="mt-0.5 block text-[10px] text-slate-400">Teacher Workspace</span>

                        </span>

                     </Link>



                     <span className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-xs font-bold text-emerald-300">

                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                        Portal Active

                     </span>

                  </div>



                  <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

                     <div className="max-w-2xl">

                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">

                           <GraduationCap className="h-4 w-4" />

                           Teacher Workspace

                        </div>



                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

                           Attendance

                           <span className="mt-1 block bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">

                              Management

                           </span>

                        </h1>



                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">

                           Manage your assigned classes, monitor daily attendance,

                           track student presence and securely save records.

                        </p>



                        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-300">

                           <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5">

                              <CalendarCheck2 className="h-4 w-4 text-indigo-300" />

                              Daily Attendance

                           </span>

                           <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5">

                              <ShieldCheck className="h-4 w-4 text-emerald-300" />

                              Assigned Classes Only

                           </span>

                        </div>

                     </div>



                     <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[350px]">

                        <InfoCard icon={LayoutDashboard} label="Academic Year" value={getAcademicYear()} />

                        <InfoCard

                           icon={CalendarDays}

                           label="Today's Date"

                           value={new Date().toLocaleDateString("en-IN", {

                              day: "2-digit", month: "short", year: "numeric",

                           })}

                        />

                     </div>

                  </div>

               </div>

            </header>



            {/ TEACHER PROFILE /}

            <section className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center">

               <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">

                     <UserRound className="h-6 w-6" />

                  </div>

                  <div>

                     <p className="text-xs text-slate-500">Logged in teacher</p>

                     <h2 className="mt-1 font-bold">

                        {profile?.name || profile?.fullName || profile?.user?.name || "Teacher"}

                     </h2>

                     <p className="mt-1 text-xs text-slate-400">

                        {assignments.length} active teaching assignments

                     </p>

                  </div>

               </div>



               <button

                  type="button"

                  onClick={loadProfile}

                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10">

                  <RefreshCw className="h-4 w-4" /> Refresh Profile

               </button>

            </section>



            {error && <Notice type="error" text={error} />}

            {message && <Notice type="success" text={message} />}



            {classes.length === 0 ? (

               <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">

                  <BookOpen className="mx-auto h-12 w-12 text-indigo-300" />

                  <h2 className="mt-5 text-xl font-bold">No Class Assigned</h2>

                  <p className="mt-2 text-sm text-slate-400">

                     Admin ne abhi aapko koi active class assign nahi ki hai.

                  </p>

                  <Link to="/teacher/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold">

                     <LayoutDashboard className="h-4 w-4" /> Back to Dashboard

                  </Link>

               </div>

            ) : (

               <>

                  {/ FILTERS /}

                  <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">

                     <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <div>

                           <h2 className="text-lg font-bold">Select Class & Date</h2>

                           <p className="mt-1 text-xs text-slate-400">Only admin-assigned classes are available.</p>

                        </div>

                        <button

                           onClick={loadAttendance}

                           disabled={loading || !validSelection}

                           className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-40">

                           <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh

                        </button>

                     </div>



                     <div className="grid gap-4 md:grid-cols-3">

                        <FilterField label="Assigned Class">

                           <select

                              value={className}

                              onChange={(e) => {

                                 setClassName(e.target.value);

                                 setSearch("");

                              }}

                              className="field">

                              {classes.map((c) => <option key={c} value={c}>Class {c}</option>)}

                           </select>

                        </FilterField>



                        <FilterField label="Assigned Section">

                           <select

                              value={allSectionsAssigned ? "" : section}

                              onChange={(e) => setSection(e.target.value)}

                              disabled={allSectionsAssigned || !sections.length}

                              className="field disabled:opacity-60">

                              {allSectionsAssigned

                                 ? <option value="">All Sections</option>

                                 : sections.map((s) => <option key={s} value={s}>Section {s}</option>)

                              }

                           </select>

                           <p className="mt-1 text-xs text-slate-500">

                              {allSectionsAssigned ? "You are assigned to all sections." : "Only assigned sections are shown."}

                           </p>

                        </FilterField>



                        <FilterField label="Attendance Date">

                           <input

                              type="date"

                              value={date}

                              max={getToday()}

                              onChange={(e) => setDate(e.target.value)}

                              className="field"

                           />

                        </FilterField>

                     </div>

                  </section>



                  {/ PROFESSIONAL ATTENDANCE OVERVIEW /}

                  <section className="mb-6">

                     <div className="mb-4 flex flex-wrap items-end justify-between gap-3">

                        <div>

                           <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Daily Overview</p>

                           <h2 className="mt-1 text-xl font-black">Attendance Summary</h2>

                           <p className="mt-1 text-xs text-slate-400">

                              {className ? `Class ${className}` : "Selected class"} {section ? `· Section ${section}` : "· All assigned sections"} · {date}

                           </p>

                        </div>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">

                           Selected date report

                        </span>

                     </div>



                     <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">

                        <StatCard label="Total Students" value={totalStudents} icon={Users} color="indigo" />

                        <StatCard label="Total Attendance" value={totalAttendance} icon={Activity} color="cyan" />

                        <StatCard label="Present" value={presentCount} icon={CheckCircle2} color="emerald" />

                        <StatCard label="Absent" value={absentCount} icon={XCircle} color="rose" />

                        <StatCard label="Late" value={lateCount} icon={Clock3} color="amber" />

                        <StatCard label="Not Marked" value={unmarkedCount} icon={ClipboardCheck} color="slate" />

                     </div>

                  </section>



                  {/ ATTENDANCE PERCENTAGE /}

                  <section className="mb-6 grid gap-4 lg:grid-cols-2">

                     <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-violet-500/[0.04] p-5">

                        <div className="flex items-center justify-between gap-3">

                           <div>

                              <p className="text-sm font-bold">Attendance Percentage</p>

                              <p className="mt-1 text-xs text-slate-400">Present + Late students</p>

                           </div>

                           <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-300">

                              <TrendingUp className="h-5 w-5" />

                           </div>

                        </div>

                        <div className="mt-5 flex items-end justify-between">

                           <p className="text-4xl font-black text-white">{attendancePercentage}%</p>

                           <p className="text-xs text-slate-400">{totalAttendance} / {totalStudents} students</p>

                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">

                           <div

                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"

                              style={{ width: `${attendancePercentage}%` }}

                           />

                        </div>

                     </div>



                     <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                        <div className="flex items-center justify-between gap-3">

                           <div>

                              <p className="text-sm font-bold">Marking Progress</p>

                              <p className="mt-1 text-xs text-slate-400">Students whose status has been selected</p>

                           </div>

                           <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300">

                              <ClipboardCheck className="h-5 w-5" />

                           </div>

                        </div>

                        <div className="mt-5 flex items-end justify-between">

                           <p className="text-4xl font-black text-white">{markingPercentage}%</p>

                           <p className="text-xs text-slate-400">{markedCount} / {totalStudents} marked</p>

                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">

                           <div

                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"

                              style={{ width: `${markingPercentage}%` }}

                           />

                        </div>

                     </div>

                  </section>



                  {/ STUDENT ATTENDANCE TABLE /}

                  <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl">

                     <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                           <h2 className="text-xl font-bold">

                              Class {className}{section ? ` - Section ${section}` : " - All Sections"}

                           </h2>

                           <p className="mt-1 text-xs text-slate-400">Attendance for {date}</p>

                        </div>

                        <div className="relative w-full lg:max-w-sm">

                           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                           <input

                              value={search}

                              onChange={(e) => setSearch(e.target.value)}

                              placeholder="Search name, ID or roll number..."

                              className="field pl-10"

                           />

                        </div>

                     </div>



                     <div className="flex flex-wrap gap-2 border-b border-white/10 p-5">

                        <button onClick={() => markAll("present")} disabled={loading || !students.length} className="rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40">

                           ✓ Mark All Present

                        </button>

                        <button onClick={() => markAll("absent")} disabled={loading || !students.length} className="rounded-xl bg-rose-500/15 px-4 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-500/25 disabled:opacity-40">

                           ✕ Mark All Absent

                        </button>

                        <button onClick={() => markAll("late")} disabled={loading || !students.length} className="rounded-xl bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/25 disabled:opacity-40">

                           ◷ Mark All Late

                        </button>

                        <button

                           onClick={saveAttendance}

                           disabled={saving || loading || !students.length || !validSelection || markedCount !== totalStudents}

                           className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 disabled:opacity-40">

                           <Save className="h-4 w-4" />

                           {saving ? "Saving..." : "Save Attendance"}

                        </button>

                     </div>



                     {loading ? (

                        <div className="p-16 text-center">

                           <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />

                           <p className="mt-4 text-sm text-slate-400">Students aur attendance load ho rahi hai...</p>

                        </div>

                     ) : !validSelection ? (

                        <div className="p-12 text-center text-slate-400">Valid assigned section select karein.</div>

                     ) : filteredStudents.length === 0 ? (

                        <div className="p-14 text-center">

                           <Users className="mx-auto h-12 w-12 text-slate-600" />

                           <h3 className="mt-4 text-lg font-bold">No Students Found</h3>

                           <p className="mt-2 text-sm text-slate-400">Is class aur section mein students nahi mile.</p>

                        </div>

                     ) : (

                        <div className="overflow-x-auto">

                           <table className="w-full min-w-[850px]">

                              <thead className="bg-white/[0.03]">

                                 <tr className="text-left text-xs uppercase tracking-wider text-slate-400">

                                    <th className="px-5 py-4">#</th>

                                    <th className="px-5 py-4">Student</th>

                                    <th className="px-5 py-4">Roll No.</th>

                                    {!section && <th className="px-5 py-4">Section</th>}

                                    <th className="px-5 py-4">Attendance</th>

                                    <th className="px-5 py-4">Remarks</th>

                                 </tr>

                              </thead>

                              <tbody className="divide-y divide-white/[0.06]">

                                 {filteredStudents.map((student, index) => {

                                    const id = getId(student);

                                    const current = attendance[id] || {};



                                    return (

                                       <tr key={id} className="transition hover:bg-white/[0.03]">

                                          <td className="px-5 py-4 text-sm text-slate-500">{index + 1}</td>

                                          <td className="px-5 py-4">

                                             <p className="font-semibold text-white">{getStudentName(student)}</p>

                                             <p className="mt-1 text-xs text-slate-500">{student.studentId || id}</p>

                                          </td>

                                          <td className="px-5 py-4 text-sm text-slate-300">{student.rollNumber || "-"}</td>

                                          {!section && <td className="px-5 py-4 text-sm text-slate-300">{student.section || "-"}</td>}

                                          <td className="px-5 py-4">

                                             <div className="flex gap-2">

                                                {Object.entries(statusConfig).map(([key, config]) => (

                                                   <button

                                                      key={key}

                                                      type="button"

                                                      onClick={() => setStatus(id, key)}

                                                      title={config.label}

                                                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${current.status === key ? config.active : config.inactive

                                                         }`}>

                                                      {config.short}

                                                   </button>

                                                ))}

                                             </div>

                                             <p className="mt-1 text-[10px] text-slate-500">

                                                {current.status ? statusConfig[current.status]?.label : "Not marked"}

                                             </p>

                                          </td>

                                          <td className="px-5 py-4">

                                             <input

                                                value={current.remarks || ""}

                                                onChange={(e) => setRemark(id, e.target.value)}

                                                placeholder="Optional remark"

                                                className="field min-w-[160px] text-xs"

                                             />

                                          </td>

                                       </tr>

                                    );

                                 })}

                              </tbody>

                           </table>

                        </div>

                     )}



                     {!loading && students.length > 0 && (

                        <div className="flex flex-col gap-3 border-t border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">

                           <div className="text-xs text-slate-400">

                              <span className="font-bold text-white">{markedCount}</span> marked

                              <span className="mx-2">·</span>

                              <span className="font-bold text-amber-300">{unmarkedCount}</span> remaining

                           </div>

                           <button

                              onClick={saveAttendance}

                              disabled={saving || markedCount !== totalStudents}

                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-40">

                              <Save className="h-4 w-4" />

                              {saving ? "Saving Attendance..." : "Save Attendance"}

                           </button>

                        </div>

                     )}

                  </section>



                  <p className="mt-6 text-center text-xs text-slate-500">

                     Attendance summary is calculated for the selected class, section and date.

                  </p>

               </>

            )}

         </div>

      </div>

   );

}



/ REUSABLE COMPONENTS /



function InfoCard({ icon: Icon, label, value }) {

   return (

      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">

         <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">

               <Icon className="h-5 w-5" />

            </div>

            <div>

               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>

               <p className="mt-1 text-lg font-extrabold text-white">{value}</p>

            </div>

         </div>

      </div>

   );

}



function FilterField({ label, children }) {

   return (

      <div>

         <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">

            {label}

         </label>

         {children}

      </div>

   );

}



function StatCard({ label, value, icon: Icon, color }) {

   const colors = {

      indigo: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",

      cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",

      emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",

      rose: "text-rose-300 bg-rose-500/10 border-rose-500/20",

      amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",

      slate: "text-slate-300 bg-slate-500/10 border-slate-500/20",

   };



   return (

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">

         <div className="flex items-center justify-between gap-2">

            <span className="text-xs font-medium text-slate-400">{label}</span>

            <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colors[color]}`}>

               <Icon className="h-4 w-4" />

            </span>

         </div>

         <p className="mt-4 text-3xl font-black text-white">{value}</p>

      </div>

   );

}



function Notice({ type, text }) {

   const success = type === "success";

   return (

      <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${success

         ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"

         : "border-rose-500/30 bg-rose-500/10 text-rose-300"

         }`}>

         {success

            ? <Check className="mt-0.5 h-5 w-5 shrink-0" />

            : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

         }

         <span>{text}</span>

      </div>

   );

}
