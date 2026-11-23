
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () =>
   (
      localStorage.getItem("schoolToken") ||
      sessionStorage.getItem("schoolToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      ""
   ).trim();

const gradeFromPercentage = (p) => {
   if (p >= 90) return "A+";
   if (p >= 80) return "A";
   if (p >= 70) return "B+";
   if (p >= 60) return "B";
   if (p >= 50) return "C";
   if (p >= 33) return "D";
   return "F";
};

const calculate = (marks = {}, subjects = []) => {
   const values = subjects
      .map((s) => marks?.[s.key])
      .filter((v) => v !== "" && v !== null && v !== undefined)
      .map(Number)
      .filter(Number.isFinite);

   const total = values.reduce((a, b) => a + b, 0);
   const percentage = values.length
      ? Number((total / (values.length * 100) * 100).toFixed(2))
      : 0;

   return {
      total,
      percentage,
      grade: gradeFromPercentage(percentage),
      resultStatus: percentage >= 33 ? "Pass" : "Fail",
   };
};

export default function AdminResults() {
   const navigate = useNavigate();

   const [students, setStudents] = useState([]);
   const [subjects, setSubjects] = useState([]);
   const [classes, setClasses] = useState([]);
   const [sections, setSections] = useState([]);

   const [selectedClass, setSelectedClass] = useState("");
   const [selectedSection, setSelectedSection] = useState("All");
   const [selectedExam, setSelectedExam] = useState("Annual Examination");
   const [academicYear, setAcademicYear] = useState("2026-27");

   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("All");

   const [channel, setChannel] = useState({
      sms: false,
      whatsapp: false,
      email: false,
   });

   const [recipients, setRecipients] = useState({
      student: true,
      parent: true,
   });

   const [editingId, setEditingId] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");
   const [message, setMessage] = useState("");
   const [preview, setPreview] = useState(false);

   const exams = [
      "Unit Test 1",
      "Unit Test 2",
      "Half Yearly Examination",
      "Annual Examination",
      "Final Examination",
   ];

   const api = useCallback(async (endpoint, options = {}) => {
      const token = getToken();
      if (!token) throw new Error("Login token nahi mila. Dobara login karein.");

      const response = await fetch(`${API_URL}${endpoint}`, {
         ...options,
         headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...(options.headers || {}),
         },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
         throw new Error(data.message || "Request complete nahi hui.");
      }
      return data;
   }, []);

   const loadResults = useCallback(async () => {
      try {
         setLoading(true);
         setError("");

         const query = new URLSearchParams();
         if (selectedClass) query.set("className", selectedClass);
         if (selectedSection !== "All") query.set("section", selectedSection);
         if (selectedExam) query.set("exam", selectedExam);
         if (academicYear) query.set("academicYear", academicYear);

         const data = await api(`/api/results?${query.toString()}`);

         const list = Array.isArray(data.students)
            ? data.students
            : Array.isArray(data.results)
               ? data.results
               : [];

         setStudents(
            list.map((student) => ({
               ...student,
               marks: student.marks || {},
               grade: student.grade || "",
               resultStatus: student.resultStatus || "",
            }))
         );

         setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
         setClasses(Array.isArray(data.classes) ? data.classes : []);
         setSections(Array.isArray(data.sections) ? data.sections : []);
      } catch (err) {
         setError(err.message);
         setStudents([]);
      } finally {
         setLoading(false);
      }
   }, [api, selectedClass, selectedSection, selectedExam, academicYear]);

   useEffect(() => {
      loadResults();
   }, [loadResults]);

   const updateStudent = (studentId, changes) => {
      setStudents((current) =>
         current.map((student) =>
            String(student._id) === String(studentId)
               ? { ...student, ...changes }
               : student
         )
      );
   };

   const updateMark = (student, subjectKey, value) => {
      if (value !== "" && (Number(value) < 0 || Number(value) > 100)) return;

      updateStudent(student._id, {
         marks: {
            ...(student.marks || {}),
            [subjectKey]: value === "" ? "" : Number(value),
         },
         grade: "",
         resultStatus: "",
      });
   };

   const getStats = (student) => {
      const calculated = calculate(student.marks, subjects);
      return {
         ...calculated,
         grade: student.grade || calculated.grade,
         resultStatus: student.resultStatus || calculated.resultStatus,
      };
   };

   const filteredStudents = useMemo(() => {
      const q = search.trim().toLowerCase();

      return students.filter((student) => {
         const matchesSearch = !q || [
            student.name,
            student.studentId,
            student.rollNumber,
            student.className,
            student.section,
         ].filter(Boolean).join(" ").toLowerCase().includes(q);

         const status = getStats(student).resultStatus;
         const matchesStatus = statusFilter === "All" || status === statusFilter;

         return matchesSearch && matchesStatus;
      });
   }, [students, search, statusFilter, subjects]);

   const changeChannel = (key) => {
      setChannel((current) => ({ ...current, [key]: !current[key] }));
   };

   const changeRecipient = (key) => {
      setRecipients((current) => ({ ...current, [key]: !current[key] }));
   };

   const saveResults = async () => {
      try {
         setSaving(true);
         setError("");
         setMessage("");

         if (!filteredStudents.length) {
            throw new Error("Save karne ke liye students nahi mile.");
         }

         const selectedChannels = Object.keys(channel).filter((key) => channel[key]);
         const selectedRecipients = Object.keys(recipients).filter(
            (key) => recipients[key]
         );

         if (selectedChannels.length && !selectedRecipients.length) {
            throw new Error("Student ya Parent recipient select karein.");
         }

         const mode = selectedChannels.length
            ? selectedChannels.join(",")
            : "none";

         const payload = filteredStudents.map((student) => {
            const stats = getStats(student);

            return {
               studentId: student._id || student.studentId,
               exam: selectedExam,
               academicYear,
               marks: student.marks || {},
               grade: stats.grade,
               resultStatus: stats.resultStatus,
               notify: {
                  mode,
                  channels: selectedChannels,
                  recipients: selectedRecipients,
               },
            };
         });

         const data = await api("/api/results/bulk", {
            method: "POST",
            body: JSON.stringify({ results: payload }),
         });

         const notifications = data.notifications || {};
         setMessage(
            `Results save ho gaye. Messages sent: ${notifications.sent || 0}. Failed: ${notifications.failed || 0}.`
         );

         setEditingId(null);
         setPreview(false);
         await loadResults();
      } catch (err) {
         setError(err.message || "Results save nahi ho paaye.");
      } finally {
         setSaving(false);
      }
   };

   const totalStudents = students.length;
   const passed = students.filter(
      (s) => getStats(s).resultStatus === "Pass"
   ).length;
   const failed = students.filter(
      (s) => getStats(s).resultStatus === "Fail"
   ).length;

   const selectedChannels = Object.keys(channel).filter((key) => channel[key]);
   const selectedRecipients = Object.keys(recipients).filter(
      (key) => recipients[key]
   );

   return (
      <div className="min-h-screen bg-[#f4f6fc] p-4 text-slate-800 sm:p-6 lg:p-8">
         <div className="mx-auto max-w-[1600px] space-y-6">

            <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#11183d] via-indigo-900 to-violet-700 p-6 text-white shadow-xl sm:p-8">
               <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
               <div className="relative flex flex-wrap items-end justify-between gap-5">
                  <div>
                     <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="mb-5 text-sm font-semibold text-indigo-200 hover:text-white"
                     >
                        ← Back to Dashboard
                     </button>
                     <p className="text-xs font-bold tracking-[.25em] text-cyan-200">
                        ACADEMIC MANAGEMENT
                     </p>
                     <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                        Results Management
                     </h1>
                     <p className="mt-2 max-w-xl text-sm text-indigo-100">
                        Edit subject marks, set grades and send results to students and parents.
                     </p>
                  </div>
                  <button
                     onClick={loadResults}
                     className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/20"
                  >
                     ↻ Refresh
                  </button>
               </div>
            </header>

            {error && (
               <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error}
               </div>
            )}
            {message && (
               <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                  {message}
               </div>
            )}

            <section className="grid gap-4 sm:grid-cols-3">
               <Stat title="Total Students" value={totalStudents} />
               <Stat title="Passed" value={passed} />
               <Stat title="Failed" value={failed} />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
               <div className="mb-5">
                  <h2 className="text-lg font-black">Exam Filters</h2>
                  <p className="mt-1 text-sm text-slate-400">
                     All Classes aur All Sections se shuru karein.
                  </p>
               </div>

               <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Field label="Class">
                     <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="control"
                     >
                        <option value="">All Classes</option>
                        {classes.map((item) => (
                           <option key={item} value={item}>{item}</option>
                        ))}
                     </select>
                  </Field>

                  <Field label="Section">
                     <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="control"
                     >
                        <option value="All">All Sections</option>
                        {sections.map((item) => (
                           <option key={item} value={item}>{item}</option>
                        ))}
                     </select>
                  </Field>

                  <Field label="Examination">
                     <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="control"
                     >
                        {exams.map((exam) => (
                           <option key={exam} value={exam}>{exam}</option>
                        ))}
                     </select>
                  </Field>

                  <Field label="Academic Year">
                     <input
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        placeholder="2026-27"
                        className="control"
                     />
                  </Field>
               </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
               <div className="mb-4">
                  <h2 className="text-lg font-black">Result Notification Settings</h2>
                  <p className="mt-1 text-sm text-slate-400">
                     Select karein result kis channel se aur kisko bhejna hai.
                  </p>
               </div>

               <div className="grid gap-3 sm:grid-cols-3">
                  <CheckOption
                     checked={channel.sms}
                     onChange={() => changeChannel("sms")}
                     title="SMS"
                     description="Mobile text message"
                  />
                  <CheckOption
                     checked={channel.whatsapp}
                     onChange={() => changeChannel("whatsapp")}
                     title="WhatsApp"
                     description="WhatsApp message"
                  />
                  <CheckOption
                     checked={channel.email}
                     onChange={() => changeChannel("email")}
                     title="Email"
                     description="Detailed result email"
                  />
               </div>

               <div className="mt-5 flex flex-wrap gap-5 border-t border-slate-100 pt-5">
                  <CheckOption
                     checked={recipients.student}
                     onChange={() => changeRecipient("student")}
                     title="Send to Student"
                  />
                  <CheckOption
                     checked={recipients.parent}
                     onChange={() => changeRecipient("parent")}
                     title="Send to Parent"
                  />
               </div>

               <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  Koi channel select nahi karenge to result sirf save hoga, notification nahi jayega.
                  WhatsApp ke liye WhatsApp Business/Twilio configuration zaroori hai.
               </p>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
               <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
                  <div>
                     <h2 className="text-lg font-black">Student Marks Register</h2>
                     <p className="mt-1 text-sm text-slate-400">
                        Har subject ka mark alag edit karein. Maximum 100 marks per subject.
                     </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student..."
                        className="control min-w-48"
                     />
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="control"
                     >
                        <option value="All">All Results</option>
                        <option value="Pass">Passed</option>
                        <option value="Fail">Failed</option>
                     </select>
                  </div>
               </div>

               {loading ? (
                  <div className="p-16 text-center font-semibold text-slate-400">
                     Loading students...
                  </div>
               ) : !filteredStudents.length ? (
                  <div className="p-16 text-center text-slate-400">
                     Is filter mein students nahi mile.
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full min-w-[1100px] text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                           <tr>
                              <th className="px-4 py-4">Student</th>
                              <th className="px-4 py-4">Class</th>
                              {subjects.map((subject) => (
                                 <th key={subject.key} className="px-3 py-4">
                                    {subject.label || subject.name}
                                 </th>
                              ))}
                              <th className="px-4 py-4">Total</th>
                              <th className="px-4 py-4">Percentage</th>
                              <th className="px-4 py-4">Grade</th>
                              <th className="px-4 py-4">Pass / Fail</th>
                              <th className="px-4 py-4">Edit</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {filteredStudents.map((student) => {
                              const stats = getStats(student);
                              const isEditing = editingId === student._id;

                              return (
                                 <tr key={student._id || student.studentId} className="hover:bg-indigo-50/40">
                                    <td className="px-4 py-4">
                                       <p className="font-bold">{student.name}</p>
                                       <p className="text-xs text-slate-400">
                                          {student.studentId || student.rollNumber || ""}
                                       </p>
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                       {student.className} {student.section ? `- ${student.section}` : ""}
                                    </td>

                                    {subjects.map((subject) => (
                                       <td key={subject.key} className="px-3 py-3">
                                          {isEditing ? (
                                             <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={student.marks?.[subject.key] ?? ""}
                                                onChange={(e) =>
                                                   updateMark(student, subject.key, e.target.value)
                                                }
                                                className="w-20 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-2 text-center font-bold outline-none focus:border-indigo-500"
                                             />
                                          ) : (
                                             <span className="font-semibold">
                                                {student.marks?.[subject.key] ?? "—"}
                                             </span>
                                          )}
                                       </td>
                                    ))}

                                    <td className="px-4 py-4 font-black">{stats.total}</td>
                                    <td className="px-4 py-4 font-bold text-indigo-700">
                                       {stats.percentage}%
                                    </td>

                                    <td className="px-4 py-4">
                                       {isEditing ? (
                                          <select
                                             value={student.grade || stats.grade}
                                             onChange={(e) =>
                                                updateStudent(student._id, { grade: e.target.value })
                                             }
                                             className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold"
                                          >
                                             {["A+", "A", "B+", "B", "C", "D", "F"].map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                             ))}
                                          </select>
                                       ) : (
                                          <span className="rounded-lg bg-indigo-50 px-3 py-2 font-black text-indigo-700">
                                             {stats.grade}
                                          </span>
                                       )}
                                    </td>

                                    <td className="px-4 py-4">
                                       {isEditing ? (
                                          <div className="flex flex-col gap-2">
                                             <label className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                                                <input
                                                   type="radio"
                                                   name={`status-${student._id}`}
                                                   checked={(student.resultStatus || stats.resultStatus) === "Pass"}
                                                   onChange={() =>
                                                      updateStudent(student._id, { resultStatus: "Pass" })
                                                   }
                                                />
                                                Pass
                                             </label>
                                             <label className="flex items-center gap-2 text-xs font-bold text-red-700">
                                                <input
                                                   type="radio"
                                                   name={`status-${student._id}`}
                                                   checked={(student.resultStatus || stats.resultStatus) === "Fail"}
                                                   onChange={() =>
                                                      updateStudent(student._id, { resultStatus: "Fail" })
                                                   }
                                                />
                                                Fail
                                             </label>
                                          </div>
                                       ) : (
                                          <span className={`rounded-full px-3 py-1 text-xs font-black ${stats.resultStatus === "Pass"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-700"
                                             }`}>
                                             {stats.resultStatus}
                                          </span>
                                       )}
                                    </td>

                                    <td className="px-4 py-4">
                                       <button
                                          onClick={() => setEditingId(isEditing ? null : student._id)}
                                          className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 hover:bg-indigo-600 hover:text-white"
                                       >
                                          {isEditing ? "Done" : "Edit"}
                                       </button>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               )}

               <div className="flex flex-col justify-between gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-400">
                     {filteredStudents.length} student(s) shown. Marks are editable student-wise.
                  </p>
                  <div className="flex flex-wrap gap-2">
                     <button
                        onClick={() => setPreview(true)}
                        disabled={!filteredStudents.length || saving}
                        className="rounded-xl border border-indigo-200 px-5 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                     >
                        Preview & Save
                     </button>
                  </div>
               </div>
            </section>

            {preview && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                  <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                     <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black">Confirm Result Update</h2>
                        <button onClick={() => setPreview(false)} className="text-xl">×</button>
                     </div>

                     <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
                        <Info label="Exam" value={selectedExam} />
                        <Info label="Academic Year" value={academicYear} />
                        <Info label="Students" value={filteredStudents.length} />
                        <Info
                           label="Channels"
                           value={selectedChannels.length ? selectedChannels.join(", ") : "Save only"}
                        />
                        <Info
                           label="Recipients"
                           value={selectedRecipients.length ? selectedRecipients.join(" + ") : "None"}
                        />
                     </div>

                     <p className="mt-4 text-xs leading-5 text-slate-500">
                        Selected students ke current marks, grade aur Pass/Fail status save honge.
                        Notification channel select kiya hai to selected recipients ko message bhejne ki koshish hogi.
                     </p>

                     <div className="mt-6 flex gap-3">
                        <button
                           onClick={() => setPreview(false)}
                           className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-bold"
                        >
                           Go Back
                        </button>
                        <button
                           onClick={saveResults}
                           disabled={saving}
                           className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-black text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                           {saving ? "Saving..." : "Confirm & Save"}
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>

         <style>{`
        .control {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          padding: 12px 14px;
          font-size: 13px;
          font-weight: 650;
          outline: none;
        }
        .control:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px #6366f11a;
        }
      `}</style>
      </div>
   );
}

function Stat({ title, value }) {
   return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
         <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
         <p className="mt-2 text-3xl font-black text-slate-800">{value}</p>
      </div>
   );
}

function Field({ label, children }) {
   return (
      <label className="block">
         <span className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-400">
            {label}
         </span>
         {children}
      </label>
   );
}

function CheckOption({ checked, onChange, title, description }) {
   return (
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40">
         <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="mt-1 h-4 w-4 accent-indigo-600"
         />
         <span>
            <span className="block text-sm font-black">{title}</span>
            {description && (
               <span className="mt-1 block text-xs text-slate-400">{description}</span>
            )}
         </span>
      </label>
   );
}

function Info({ label, value }) {
   return (
      <div className="flex items-center justify-between gap-3">
         <span className="text-slate-500">{label}</span>
         <span className="text-right font-bold capitalize">{value}</span>
      </div>
   );
}
