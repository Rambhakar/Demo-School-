import { useCallback, useEffect, useMemo, useState } from "react";

import {

   Search, Save, CheckCircle2, Edit3, BookOpen, Users, Award,

   TrendingUp, ChevronDown, RefreshCw, MessageSquare, Mail,

   Smartphone, ClipboardCheck, GraduationCap, XCircle, Filter,

   Trophy, ChartNoAxesCombined, Sparkles

} from "lucide-react";



const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
   .replace(/\/+$/, "")
   .replace(/\/api$/i, "");



const getToken = () =>

   localStorage.getItem("schoolToken") ||

   sessionStorage.getItem("schoolToken") ||

   localStorage.getItem("token");



const api = async (url, options = {}) => {

   const token = getToken();

   if (!token) throw new Error("Teacher login session nahi mili.");



   const response = await fetch(`${API_URL}${url}`, {

      ...options,

      headers: {

         ...(options.body ? { "Content-Type": "application/json" } : {}),

         Authorization: `Bearer ${token}`,

         ...(options.headers || {}),

      },

   });



   const data = await response.json().catch(() => ({}));

   if (!response.ok || data.success === false) {

      throw new Error(data.message || "Server request failed.");

   }

   return data;

};



const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));



const EXAM_OPTIONS = [

   "First Test",

   "Class Test",

   "Unit Test 1",

   "Unit Test 2",

   "Mid Term Examination",

   "Half Yearly Examination",

   "Pre Board Examination",

   "Annual Examination",

   "Final Examination",

];



const NOTIFICATION_OPTIONS = [

   { value: "both", label: "SMS + Email" },

   { value: "sms", label: "SMS Only" },

   { value: "email", label: "Email Only" },

   { value: "none", label: "Don't Notify" },

];



const getClassNumber = (value) => {

   const text = String(value || "").trim().toLowerCase();

   const match = text.match(/\b(1[0-2]|[1-9])\b/);

   if (match) return match[1];



   const ordinal = text.match(

      /\b(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\b/

   );



   if (!ordinal) return "";

   return ordinal[1].replace(/st|nd|rd|th/, "");

};



const isStudentInSelectedClass = (student, selectedClass) => {

   if (!selectedClass) return true;

   return getClassNumber(student?.className) === String(selectedClass);

};



const getClassDisplayName = (classNumber) =>

   classNumber ? `Class ${classNumber}` : "All Classes";



const getSubjectKey = (subject) =>

   subject.key ||

   subject._id ||

   subject.code ||

   subject.name?.toLowerCase().replace(/[^a-z0-9]+/g, "_") ||

   "";



const getSubjectLabel = (subject) =>

   subject.label || subject.name || subject.subjectName || subject.code || "Subject";



const getStudentId = (student) => student._id || student.studentId;



const getMarkEntry = (student, subject) => {

   const value = student?.marks?.[subject.key];



   if (value && typeof value === "object") {

      return {

         obtained: value.obtained ?? "",

         maxMarks: Number(value.maxMarks || subject.maxMarks || 100),

      };

   }



   return {

      obtained: value === "" || value === undefined ? "" : Number(value || 0),

      maxMarks: Number(subject.maxMarks || 100),

   };

};



const getSubjectMax = (student, subject) =>

   getMarkEntry(student, subject).maxMarks;



const getSubjectObtained = (student, subject) => {

   const value = getMarkEntry(student, subject).obtained;

   return value === "" ? 0 : Number(value || 0);

};



const getTotal = (student, subjects) =>

   subjects.reduce((sum, subject) => sum + getSubjectObtained(student, subject), 0);



const getMaxMarks = (student, subjects) =>

   subjects.reduce((sum, subject) => sum + getSubjectMax(student, subject), 0);



const getPercentage = (student, subjects) => {

   const maximum = getMaxMarks(student, subjects);

   if (!maximum) return "0.0";

   return ((getTotal(student, subjects) / maximum) * 100).toFixed(1);

};



const getGrade = (percentage) => {

   const value = Number(percentage);

   if (value >= 90) return "A+";

   if (value >= 80) return "A";

   if (value >= 70) return "B+";

   if (value >= 60) return "B";

   if (value >= 50) return "C";

   if (value >= 33) return "D";

   return "F";

};



const getSubjectPercentage = (student, subject) => {

   const entry = getMarkEntry(student, subject);

   if (!entry.maxMarks || entry.obtained === "") return 0;

   return (Number(entry.obtained) / entry.maxMarks) * 100;

};



const getSubjectGrade = (student, subject) =>

   getGrade(getSubjectPercentage(student, subject));



const isSubjectPassed = (student, subject) =>

   getSubjectPercentage(student, subject) >= 33;



const isPassed = (student, subjects) =>

   subjects.length > 0 &&

   subjects.every(

      (subject) =>

         getMarkEntry(student, subject).obtained !== "" &&

         isSubjectPassed(student, subject)

   );



const isPending = (student, subjects) =>

   subjects.some((subject) => getMarkEntry(student, subject).obtained === "");



const gradeColor = (grade) => {

   if (grade === "A+" || grade === "A")

      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

   if (grade === "B+" || grade === "B")

      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

   if (grade === "C" || grade === "D")

      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

   return "border-rose-400/20 bg-rose-400/10 text-rose-300";

};



function StatCard({ icon: Icon, title, value, color, delay = 0 }) {

   return (

      <div

         style={{ animationDelay: `${delay}ms` }}

         className="animate-[rise_.55s_ease_both] rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-white/20"

      >

         <div className="flex items-center justify-between gap-3">

            <div>

               <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">

                  {title}

               </p>

               <p className="mt-2 text-3xl font-black text-white">{value}</p>

            </div>

            <div className={`rounded-2xl p-3 ${color}`}>

               <Icon size={23} />

            </div>

         </div>

      </div>

   );

}



function FilterSelect({ label, value, onChange, options, placeholder }) {

   return (

      <div>

         <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">

            {label}

         </label>

         <div className="relative">

            <select

               value={value}

               onChange={(e) => onChange(e.target.value)}

               className="w-full appearance-none rounded-xl border border-white/10 bg-[#15182a] px-4 py-3 pr-10 text-sm font-bold text-white outline-none focus:border-violet-400"

            >

               <option value="">{placeholder}</option>

               {options.map((option) => (

                  <option key={option} value={option}>

                     {label === "Class" ? `Class ${option}` : `Section ${option}`}

                  </option>

               ))}

            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

         </div>

      </div>

   );

}



function SubjectCard({ subject, students, index }) {

   const entries = students

      .map((student) => ({

         obtained: getMarkEntry(student, subject).obtained,

         max: getSubjectMax(student, subject),

         percentage: getSubjectPercentage(student, subject),

      }))

      .filter((entry) => entry.obtained !== "");



   const average = entries.length

      ? (

         entries.reduce((sum, entry) => sum + entry.percentage, 0) /

         entries.length

      ).toFixed(1)

      : "0.0";



   const highest = entries.length

      ? Math.max(...entries.map((entry) => entry.percentage)).toFixed(1)

      : "0.0";



   const passed = entries.filter((entry) => entry.percentage >= 33).length;

   const failed = entries.length - passed;



   return (

      <div

         style={{ animationDelay: `${index * 65}ms` }}

         className="animate-[rise_.55s_ease_both] rounded-2xl border border-white/10 bg-[#15182a] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40"

      >

         <div className="flex items-center gap-3">

            <div className="rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 p-3 text-white">

               <BookOpen size={20} />

            </div>

            <div>

               <h3 className="font-black text-white">{subject.label}</h3>

               <p className="text-xs text-slate-400">Subject performance</p>

            </div>

         </div>



         <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-white/[0.045] p-3">

               <p className="text-[10px] font-bold uppercase text-slate-500">

                  Average %

               </p>

               <p className="mt-1 text-2xl font-black text-white">{average}%</p>

            </div>

            <div className="rounded-xl bg-white/[0.045] p-3">

               <p className="text-[10px] font-bold uppercase text-slate-500">

                  Highest %

               </p>

               <p className="mt-1 text-2xl font-black text-cyan-300">{highest}%</p>

            </div>

         </div>



         <div className="mt-4 flex justify-between text-xs">

            <span className="font-bold text-emerald-300">Passed: {passed}</span>

            <span className="font-bold text-rose-300">Failed: {failed}</span>

         </div>



         <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">

            <div

               className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700"

               style={{

                  width: `${entries.length ? (passed / entries.length) * 100 : 0}%`,

               }}

            />

         </div>

      </div>

   );

}



export default function TeacherResults() {

   const [students, setStudents] = useState([]);

   const [teacherStudents, setTeacherStudents] = useState([]);

   const [subjects, setSubjects] = useState([]);



   const [selectedClass, setSelectedClass] = useState("");

   const [selectedSection, setSelectedSection] = useState("");

   const [selectedExam, setSelectedExam] = useState("Annual Examination");

   const [academicYear, setAcademicYear] = useState("2026-27");

   const [search, setSearch] = useState("");



   const [editingId, setEditingId] = useState(null);

   const [loading, setLoading] = useState(true);

   const [saving, setSaving] = useState(false);

   const [refreshing, setRefreshing] = useState(false);

   const [message, setMessage] = useState("");

   const [error, setError] = useState("");

   const [notifyMode, setNotifyMode] = useState("both");



   const loadResults = useCallback(async (refresh = false) => {

      try {

         if (refresh) setRefreshing(true);

         else setLoading(true);



         setError("");

         setMessage("");



         const teacherData = await api("/api/teacher/students");

         const allTeacherStudents = Array.isArray(teacherData.students)

            ? teacherData.students

            : Array.isArray(teacherData.data?.students)

               ? teacherData.data.students

               : [];



         setTeacherStudents(allTeacherStudents);



         const scopedStudents = allTeacherStudents

            .filter((student) => isStudentInSelectedClass(student, selectedClass))

            .filter(

               (student) =>

                  !selectedSection ||

                  String(student.section || "").trim() === selectedSection

            );



         const query = new URLSearchParams();

         if (selectedClass) query.set("className", selectedClass);

         if (selectedSection) query.set("section", selectedSection);

         if (selectedExam) query.set("exam", selectedExam);

         if (academicYear) query.set("academicYear", academicYear);



         const ids = scopedStudents.map((student) => student._id).filter(Boolean);

         if (ids.length) query.set("studentIds", ids.join(","));



         const data = await api(`/api/results?${query.toString()}`);



         const resultStudents = Array.isArray(data.students)

            ? data.students

            : Array.isArray(data.results)

               ? data.results

               : [];



         setStudents(

            resultStudents.length

               ? resultStudents

               : scopedStudents.map((student) => ({

                  ...student,

                  marks: student.marks || {},

               }))

         );



         const resultSubjects = Array.isArray(data.subjects)

            ? data.subjects

               .map((subject) => ({

                  ...subject,

                  key: getSubjectKey(subject),

                  label: getSubjectLabel(subject),

               }))

               .filter((subject) => subject.key)

            : [];



         setSubjects(resultSubjects);

      } catch (err) {

         console.error("Teacher Results Load Error:", err);

         setError(err.message || "Results load nahi ho paaye.");

         setStudents([]);

         setSubjects([]);

      } finally {

         setLoading(false);

         setRefreshing(false);

      }

   }, [selectedClass, selectedSection, selectedExam, academicYear]);



   useEffect(() => {

      loadResults();

   }, [loadResults]);



   const sections = useMemo(() => {

      const classStudents = teacherStudents.filter((student) =>

         isStudentInSelectedClass(student, selectedClass)

      );



      return [

         ...new Set(

            classStudents

               .map((student) => String(student.section || "").trim())

               .filter(Boolean)

         ),

      ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

   }, [teacherStudents, selectedClass]);



   const filteredStudents = useMemo(() => {

      const query = search.trim().toLowerCase();

      if (!query) return students;



      return students.filter((student) =>

         [

            student.name,

            student.studentId,

            student.rollNumber,

            student.className,

            student.section,

            student.fatherName,

         ]

            .filter(Boolean)

            .join(" ")

            .toLowerCase()

            .includes(query)

      );

   }, [students, search]);



   const classAverage = useMemo(() => {

      if (!filteredStudents.length || !subjects.length) return "0.0";

      const total = filteredStudents.reduce(

         (sum, student) => sum + Number(getPercentage(student, subjects)),

         0

      );

      return (total / filteredStudents.length).toFixed(1);

   }, [filteredStudents, subjects]);



   const passedStudents = filteredStudents.filter(

      (student) => !isPending(student, subjects) && isPassed(student, subjects)

   ).length;



   const pendingStudents = filteredStudents.filter((student) =>

      isPending(student, subjects)

   ).length;



   const failedStudents = filteredStudents.length - passedStudents - pendingStudents;



   const updateMarks = (studentId, subjectKey, field, value) => {

      setStudents((current) =>

         current.map((student) => {

            if (String(getStudentId(student)) !== String(studentId)) return student;



            const previous = student.marks?.[subjectKey];

            const oldEntry =

               previous && typeof previous === "object"

                  ? previous

                  : { obtained: previous ?? "", maxMarks: 100 };



            let nextValue = value;

            if (value !== "") {

               nextValue = Number(value);

               if (!Number.isFinite(nextValue) || nextValue < 0) nextValue = 0;

            }



            const updated = {

               ...oldEntry,

               [field]: nextValue,

            };



            if (field === "maxMarks" && Number(nextValue) <= 0 && nextValue !== "") {

               updated.maxMarks = 1;

            }



            if (

               updated.obtained !== "" &&

               Number(updated.obtained) > Number(updated.maxMarks)

            ) {

               updated.obtained = updated.maxMarks;

            }



            return {

               ...student,

               marks: {

                  ...(student.marks || {}),

                  [subjectKey]: updated,

               },

            };

         })

      );

      setMessage("");

   };



   const saveResults = async () => {

      try {

         setSaving(true);

         setError("");

         setMessage("");



         if (!filteredStudents.length) {

            throw new Error("Save karne ke liye students nahi mile.");

         }

         if (!subjects.length) {

            throw new Error("Is class ke subjects load nahi hue.");

         }



         const payload = filteredStudents.map((student) => ({

            studentId: student._id || student.studentId,

            exam: selectedExam,

            academicYear,

            className: student.className || selectedClass,

            section: student.section || selectedSection,

            marks: subjects.reduce((result, subject) => {

               const entry = getMarkEntry(student, subject);

               result[subject.key] = {

                  obtained: entry.obtained === "" ? null : Number(entry.obtained),

                  maxMarks: Number(entry.maxMarks || 100),

               };

               return result;

            }, {}),

            notify: { mode: notifyMode },

         }));



         const data = await api("/api/results/bulk", {

            method: "POST",

            body: JSON.stringify({ results: payload }),

         });



         const notifications = data.notifications || {};

         setMessage(

            `Results save ho gaye. ${notifications.sent || 0} parent notification(s) sent, ${notifications.failed || 0} failed.`

         );



         setEditingId(null);

         await loadResults(true);

      } catch (err) {

         console.error("Save Result Error:", err);

         setError(err.message || "Results save nahi ho paaye.");

      } finally {

         setSaving(false);

      }

   };



   const handleClassChange = (value) => {

      setSelectedClass(value);

      setSelectedSection("");

   };



   if (loading) {

      return (

         <div className="flex min-h-screen items-center justify-center bg-[#090b14] text-white">

            <div className="text-center">

               <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-violet-500/20 border-t-cyan-400" />

               <p className="mt-5 text-sm font-bold text-slate-300">

                  Loading examination results...

               </p>

               <p className="mt-1 text-xs text-slate-500">Please wait</p>

            </div>

         </div>

      );

   }



   return (

      <div className="relative min-h-screen overflow-hidden bg-[#090b14] text-white">

         <style>{`

        @keyframes rise {

          from { opacity: 0; transform: translateY(18px); }

          to { opacity: 1; transform: translateY(0); }

        }

        @keyframes float {

          0%,100% { transform: translateY(0); }

          50% { transform: translateY(-16px); }

        }

        @keyframes shine {

          from { background-position: 0% 50%; }

          to { background-position: 200% 50%; }

        }

        .gradient-text {

          background: linear-gradient(90deg,#a78bfa,#22d3ee,#f0abfc);

          background-size: 200% auto;

          -webkit-background-clip: text;

          background-clip: text;

          color: transparent;

          animation: shine 5s linear infinite;

        }

        .result-scroll::-webkit-scrollbar { height: 8px; width: 8px; }

        .result-scroll::-webkit-scrollbar-thumb {

          background: #45416c; border-radius: 20px;

        }

        .result-scroll::-webkit-scrollbar-track { background: #111426; }

      `}</style>



         <div className="pointer-events-none absolute inset-0 overflow-hidden">

            <div

               className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-violet-700/20 blur-[120px]"

               style={{ animation: "float 9s ease-in-out infinite" }}

            />

            <div

               className="absolute -right-40 top-[30%] h-[450px] w-[450px] rounded-full bg-cyan-600/10 blur-[130px]"

               style={{ animation: "float 11s ease-in-out infinite" }}

            />

            <div className="absolute bottom-0 left-[35%] h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[120px]" />

         </div>



         <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090b14]/85 backdrop-blur-2xl">

            <div className="mx-auto flex max-w-[1800px] flex-col justify-between gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center xl:px-8">

               <div>

                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">

                     <GraduationCap size={17} />

                     Teacher Workspace

                     <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] text-emerald-300">

                        EXAM CENTER

                     </span>

                  </p>

                  <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">

                     Examination <span className="gradient-text">Results</span>

                  </h1>

                  <p className="mt-1 text-xs text-slate-400 sm:text-sm">

                     Manage marks, subject performance and parent notifications.

                  </p>

               </div>



               <div className="flex flex-wrap gap-2">

                  <button

                     onClick={() => loadResults(true)}

                     disabled={refreshing}

                     className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 disabled:opacity-50"

                  >

                     <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

                     Refresh

                  </button>

                  <button

                     onClick={saveResults}

                     disabled={saving || !filteredStudents.length || !subjects.length}

                     className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5 disabled:opacity-50"

                  >

                     {saving ? (

                        <>

                           <RefreshCw size={16} className="animate-spin" />

                           Saving...

                        </>

                     ) : (

                        <>

                           <Save size={16} />

                           Save & Notify Parents

                        </>

                     )}

                  </button>

               </div>

            </div>

         </header>



         <main className="relative z-10 mx-auto max-w-[1800px] space-y-6 px-4 py-6 sm:px-6 xl:px-8">

            {error && (

               <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm font-semibold text-rose-200">

                  <XCircle className="mt-0.5 shrink-0" size={19} />

                  {error}

               </div>

            )}



            {message && (

               <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-200">

                  <CheckCircle2 className="mt-0.5 shrink-0" size={19} />

                  {message}

               </div>

            )}



            <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#24204b] via-[#17182f] to-[#101827] p-5 shadow-2xl sm:p-7">

               <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-[80px]" />

               <div className="relative">

                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                     <div>

                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">

                           <Filter size={14} />

                           Result Configuration

                        </p>

                        <h2 className="mt-1 text-xl font-black">Examination Setup</h2>

                     </div>

                     <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold text-slate-300">

                        Academic Year: <span className="text-cyan-300">{academicYear}</span>

                     </div>

                  </div>



                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                     <FilterSelect

                        label="Class"

                        value={selectedClass}

                        onChange={handleClassChange}

                        options={CLASS_OPTIONS}

                        placeholder="All Classes"

                     />

                     <FilterSelect

                        label="Section"

                        value={selectedSection}

                        onChange={setSelectedSection}

                        options={sections}

                        placeholder="All Sections"

                     />



                     <div>

                        <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">

                           Examination

                        </label>

                        <select

                           value={selectedExam}

                           onChange={(e) => setSelectedExam(e.target.value)}

                           className="w-full rounded-xl border border-white/10 bg-[#15182a] px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-400"

                        >

                           {EXAM_OPTIONS.map((exam) => (

                              <option key={exam} value={exam}>{exam}</option>

                           ))}

                        </select>

                     </div>



                     <div>

                        <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">

                           Academic Year

                        </label>

                        <select

                           value={academicYear}

                           onChange={(e) => setAcademicYear(e.target.value)}

                           className="w-full rounded-xl border border-white/10 bg-[#15182a] px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-400"

                        >

                           {["2025-26", "2026-27", "2027-28", "2028-29"].map((year) => (

                              <option key={year} value={year}>{year}</option>

                           ))}

                        </select>

                     </div>

                  </div>



                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">

                     <div className="relative">

                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

                        <input

                           value={search}

                           onChange={(e) => setSearch(e.target.value)}

                           placeholder="Search student name, ID, roll number..."

                           className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-3 pl-12 pr-4 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"

                        />

                     </div>



                     <div>

                        <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">

                           Parent Notification

                        </label>

                        <select

                           value={notifyMode}

                           onChange={(e) => setNotifyMode(e.target.value)}

                           className="w-full rounded-xl border border-white/10 bg-[#15182a] px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-400"

                        >

                           {NOTIFICATION_OPTIONS.map((option) => (

                              <option key={option.value} value={option.value}>

                                 {option.label}

                              </option>

                           ))}

                        </select>

                     </div>

                  </div>

               </div>

            </section>



            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">

               <div className="mb-3 flex items-center gap-2">

                  <ClipboardCheck className="text-cyan-300" size={19} />

                  <h3 className="text-sm font-black">Examination Types</h3>

               </div>

               <div className="flex gap-2 overflow-x-auto pb-1">

                  {EXAM_OPTIONS.map((exam) => (

                     <button

                        key={exam}

                        onClick={() => setSelectedExam(exam)}

                        className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition ${selectedExam === exam

                           ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg"

                           : "border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white"

                           }`}

                     >

                        {exam}

                     </button>

                  ))}

               </div>

            </section>



            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.045] p-4">

               <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">

                     <Users size={20} />

                  </div>

                  <div>

                     <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">

                        Current Selection

                     </p>

                     <p className="mt-1 text-sm font-black text-white">

                        {getClassDisplayName(selectedClass)} ·{" "}

                        {selectedSection ? `Section ${selectedSection}` : "All Sections"}

                     </p>

                  </div>

               </div>

               <div className="flex flex-wrap gap-2">

                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold text-slate-300">

                     {selectedExam}

                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold text-slate-300">

                     {academicYear}

                  </span>

               </div>

            </section>



            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

               <StatCard icon={Users} title="Students" value={filteredStudents.length} color="bg-violet-400/10 text-violet-300" />

               <StatCard icon={TrendingUp} title="Class Average" value={`${classAverage}%`} color="bg-cyan-400/10 text-cyan-300" delay={60} />

               <StatCard icon={CheckCircle2} title="Passed" value={passedStudents} color="bg-emerald-400/10 text-emerald-300" delay={120} />

               <StatCard icon={XCircle} title="Failed" value={failedStudents} color="bg-rose-400/10 text-rose-300" delay={180} />

               <StatCard icon={Award} title="Pending" value={pendingStudents} color="bg-amber-400/10 text-amber-300" delay={240} />

            </section>



            <section className="space-y-4">

               <div className="flex flex-wrap items-end justify-between gap-3">

                  <div>

                     <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">

                        <ChartNoAxesCombined size={14} />

                        Subject Analytics

                     </p>

                     <h2 className="mt-1 text-xl font-black">

                        Every Subject <span className="gradient-text">Performance</span>

                     </h2>

                     <p className="mt-1 text-xs text-slate-500">

                        Subject-wise percentage, average and pass/fail count.

                     </p>

                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-400">

                     {subjects.length} subjects available

                  </span>

               </div>



               {subjects.length ? (

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                     {subjects.map((subject, index) => (

                        <SubjectCard

                           key={subject.key}

                           subject={subject}

                           students={filteredStudents}

                           index={index}

                        />

                     ))}

                  </div>

               ) : (

                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5 text-sm text-amber-200">

                     Is class/exam ke liye subjects API se nahi aaye. Backend ke

                     /api/results response mein subjects array hona chahiye.

                  </div>

               )}

            </section>



            <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111426]/90 shadow-2xl">

               <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                     <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-lg font-black">{selectedExam}</h2>

                        <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[10px] font-black text-violet-300">

                           {academicYear}

                        </span>

                     </div>

                     <p className="mt-1 text-xs text-slate-400">

                        {getClassDisplayName(selectedClass)} ·{" "}

                        {selectedSection ? `Section ${selectedSection}` : "All Sections"}

                     </p>

                  </div>



                  <div className="flex flex-wrap gap-2 text-[10px] font-black">

                     <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-3 py-2 text-cyan-300">

                        <MessageSquare size={13} /> Parent Alerts

                     </span>

                     <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 px-3 py-2 text-blue-300">

                        <Mail size={13} /> Email

                     </span>

                     <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/10 px-3 py-2 text-violet-300">

                        <Smartphone size={13} /> SMS

                     </span>

                  </div>

               </div>



               <div className="result-scroll overflow-x-auto">

                  <table className="w-full min-w-[1450px] text-left">

                     <thead className="bg-white/[0.035]">

                        <tr className="border-b border-white/10">

                           <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400">Roll</th>

                           <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400">Student</th>



                           {subjects.map((subject) => (

                              <th

                                 key={subject.key}

                                 className="px-4 py-4 text-center text-[10px] font-black uppercase text-cyan-300"

                              >

                                 {subject.label}

                                 <span className="mt-1 block text-[9px] font-bold text-slate-500">

                                    Set max marks

                                 </span>

                              </th>

                           ))}



                           <th className="px-4 py-4 text-center text-[10px] font-black uppercase text-slate-400">Total</th>

                           <th className="px-4 py-4 text-center text-[10px] font-black uppercase text-slate-400">%</th>

                           <th className="px-4 py-4 text-center text-[10px] font-black uppercase text-slate-400">Grade</th>

                           <th className="px-4 py-4 text-center text-[10px] font-black uppercase text-slate-400">Result</th>

                           <th className="px-5 py-4 text-center text-[10px] font-black uppercase text-slate-400">Action</th>

                        </tr>

                     </thead>



                     <tbody className="divide-y divide-white/[0.06]">

                        {filteredStudents.length ? (

                           filteredStudents.map((student, index) => {

                              const total = getTotal(student, subjects);

                              const maximum = getMaxMarks(student, subjects);

                              const percentage = getPercentage(student, subjects);

                              const grade = getGrade(percentage);

                              const editing = editingId === getStudentId(student);

                              const pending = isPending(student, subjects);

                              const passed = !pending && isPassed(student, subjects);



                              return (

                                 <tr

                                    key={getStudentId(student) || index}

                                    style={{ animationDelay: `${index * 25}ms` }}

                                    className="animate-[rise_.35s_ease_both] transition hover:bg-white/[0.035]"

                                 >

                                    <td className="px-5 py-4 font-black text-slate-300">

                                       {student.rollNumber || "-"}

                                    </td>



                                    <td className="px-5 py-4">

                                       <div className="flex min-w-[210px] items-center gap-3">

                                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-black text-white">

                                             {student.name?.charAt(0)?.toUpperCase() || "S"}

                                          </div>

                                          <div>

                                             <p className="font-black text-white">{student.name || "Student"}</p>

                                             <p className="mt-0.5 text-[10px] text-slate-500">

                                                ID: {student.studentId || "-"}

                                             </p>

                                             <p className="mt-0.5 text-[10px] font-bold text-cyan-300">

                                                {student.className || "-"} · Section {student.section || "-"}

                                             </p>

                                          </div>

                                       </div>

                                    </td>



                                    {subjects.map((subject) => {

                                       const entry = getMarkEntry(student, subject);

                                       const subjectGrade = getSubjectGrade(student, subject);

                                       const subjectPassed = isSubjectPassed(student, subject);



                                       return (

                                          <td key={subject.key} className="px-4 py-4 text-center">

                                             {editing ? (

                                                <div className="flex min-w-[120px] flex-col items-center gap-2">

                                                   <label className="text-[9px] font-bold uppercase text-cyan-300">

                                                      Maximum

                                                   </label>

                                                   <input

                                                      type="number"

                                                      min="1"

                                                      value={entry.maxMarks}

                                                      onChange={(e) =>

                                                         updateMarks(

                                                            getStudentId(student),

                                                            subject.key,

                                                            "maxMarks",

                                                            e.target.value

                                                         )

                                                      }

                                                      className="w-24 rounded-lg border border-cyan-400/30 bg-[#20243a] px-2 py-2 text-center text-xs font-bold text-cyan-300 outline-none focus:border-cyan-400"

                                                   />



                                                   <label className="text-[9px] font-bold uppercase text-violet-300">

                                                      Obtained

                                                   </label>

                                                   <input

                                                      type="number"

                                                      min="0"

                                                      max={entry.maxMarks}

                                                      value={entry.obtained}

                                                      onChange={(e) =>

                                                         updateMarks(

                                                            getStudentId(student),

                                                            subject.key,

                                                            "obtained",

                                                            e.target.value

                                                         )

                                                      }

                                                      placeholder="Marks"

                                                      className="w-24 rounded-lg border border-violet-400/40 bg-[#20243a] px-2 py-2 text-center text-sm font-black text-white outline-none focus:border-cyan-400"

                                                   />

                                                </div>

                                             ) : (

                                                <div className="flex min-w-[75px] flex-col items-center gap-1">

                                                   <span

                                                      className={`text-sm font-black ${subjectPassed

                                                         ? "text-emerald-300"

                                                         : "text-rose-300"

                                                         }`}

                                                   >

                                                      {entry.obtained === ""

                                                         ? "-"

                                                         : entry.obtained}/{entry.maxMarks}

                                                   </span>

                                                   <span

                                                      className={`rounded-md border px-1.5 py-0.5 text-[9px] font-black ${gradeColor(subjectGrade)}`}

                                                   >

                                                      {entry.obtained === "" ? "Pending" : subjectGrade}

                                                   </span>

                                                </div>

                                             )}

                                          </td>

                                       );

                                    })}



                                    <td className="px-4 py-4 text-center">

                                       <span className="font-black text-white">

                                          {total}/{maximum}

                                       </span>

                                    </td>



                                    <td className="px-4 py-4 text-center">

                                       <span className="font-black text-cyan-300">

                                          {percentage}%

                                       </span>

                                    </td>



                                    <td className="px-4 py-4 text-center">

                                       <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-black ${gradeColor(grade)}`}>

                                          {grade}

                                       </span>

                                    </td>



                                    <td className="px-4 py-4 text-center">

                                       {pending ? (

                                          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[10px] font-black text-amber-300">

                                             PENDING

                                          </span>

                                       ) : (

                                          <span

                                             className={`rounded-full px-3 py-1 text-[10px] font-black ${passed

                                                ? "bg-emerald-400/10 text-emerald-300"

                                                : "bg-rose-400/10 text-rose-300"

                                                }`}

                                          >

                                             {passed ? "PASSED" : "FAILED"}

                                          </span>

                                       )}

                                    </td>



                                    <td className="px-5 py-4 text-center">

                                       <button

                                          onClick={() =>

                                             setEditingId(editing ? null : getStudentId(student))

                                          }

                                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-black transition ${editing

                                             ? "bg-emerald-500 text-white"

                                             : "border border-violet-400/20 bg-violet-400/10 text-violet-300 hover:bg-violet-400/20"

                                             }`}

                                       >

                                          {editing ? (

                                             <>

                                                <CheckCircle2 size={14} />

                                                Done

                                             </>

                                          ) : (

                                             <>

                                                <Edit3 size={14} />

                                                Edit Marks

                                             </>

                                          )}

                                       </button>

                                    </td>

                                 </tr>

                              );

                           })

                        ) : (

                           <tr>

                              <td

                                 colSpan={subjects.length + 7}

                                 className="px-5 py-20 text-center"

                              >

                                 <Users className="mx-auto text-slate-600" size={42} />

                                 <p className="mt-4 font-black text-slate-200">

                                    No students found

                                 </p>

                                 <p className="mt-1 text-xs text-slate-500">

                                    Class, section ya search change karke dekhein.

                                 </p>

                              </td>

                           </tr>

                        )}

                     </tbody>

                  </table>

               </div>



               <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.025] px-5 py-4">

                  <p className="text-xs text-slate-400">

                     {filteredStudents.length} students · {subjects.length} subjects

                  </p>

                  <p className="text-xs font-bold text-cyan-300">

                     Total and percentage are calculated automatically

                  </p>

               </div>

            </section>



            <section className="rounded-2xl border border-violet-400/15 bg-gradient-to-r from-violet-500/[0.08] to-cyan-500/[0.06] p-5">

               <div className="flex items-start gap-3">

                  <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">

                     <Sparkles size={21} />

                  </div>

                  <div>

                     <h3 className="font-black text-white">Automatic Result Calculation</h3>

                     <p className="mt-1 text-xs leading-6 text-slate-400">

                        Har subject ke maximum marks alag set kar sakte ho. Total marks,

                        maximum total, percentage, grade aur pass/fail automatically

                        calculate hote hain. Overall result mein kisi bhi subject mein

                        33% se kam hone par student fail hoga. Jab tak saare subject

                        marks enter nahi hote, result Pending rahega.

                     </p>

                  </div>

               </div>

            </section>



            <footer className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-center text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">

               <span>School Management System · Teacher Results</span>

               <span className="font-bold text-slate-400">

                  {selectedExam} · {academicYear}

               </span>

            </footer>

         </main>

      </div>

   );

}
