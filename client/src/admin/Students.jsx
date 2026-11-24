
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL = (
   import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "").replace(/\/api$/i, "");

const getToken = () => {
   return (
      localStorage.getItem("schoolToken") ||
      sessionStorage.getItem("schoolToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      ""
   ).trim();
};

const apiRequest = async (url, options = {}) => {
   const token = getToken();

   if (!token) {
      throw new Error("Login session nahi mili. Please login again.");
   }

   const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
         Accept: "application/json",
         ...(options.body ? { "Content-Type": "application/json" } : {}),
         Authorization: `Bearer ${token}`,
         ...options.headers,
      },
   });

   const text = await response.text();
   let data = {};

   try {
      data = text ? JSON.parse(text) : {};
   } catch {
      data = { message: text || "Invalid server response" };
   }

   if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
   }

   if (!response.ok) {
      throw new Error(
         data?.message || `API Error ${response.status}: ${response.statusText}`
      );
   }

   return data;
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeStudent = (item) => {
   if (!item) return null;

   if (item.student) {
      return {
         ...item.student,
         user: item.student.user || item.user || null,
      };
   }

   return {
      ...item,
      user: item.user || null,
   };
};

const getId = (student) => student?._id || "";

const getClassNumber = (student) => {
   const value = String(student?.className || "");
   return value.match(/\d+/)?.[0] || "";
};

const getStream = (student) =>
   String(student?.stream || student?.academicStream || "General").trim() ||
   "General";

const getSubjects = (student) => {
   const raw =
      student?.assignedSubjects ||
      student?.subjects ||
      student?.subjectIds ||
      [];

   if (!Array.isArray(raw)) return [];

   return raw
      .map((item) => {
         if (typeof item === "string") return item;

         return (
            item?.name ||
            item?.subjectName ||
            item?.code ||
            item?.subject ||
            item?.title ||
            ""
         );
      })
      .filter(Boolean);
};

const getStudentStatus = (student) =>
   student?.isActive === false ? "Inactive" : "Active";

const INITIAL_EDIT_FORM = {
   name: "",
   email: "",
   phone: "",
   className: "",
   stream: "General",
   section: "",
   rollNumber: "",
   fatherName: "",
   motherName: "",
   city: "",
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Students() {
   const navigate = useNavigate();
   const [params, setParams] = useSearchParams();

   /* DATA */

   const [students, setStudents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");

   /* FILTERS */

   const [search, setSearch] = useState("");
   const [selectedClass, setSelectedClass] = useState("");
   const [selectedStream, setSelectedStream] = useState("All");
   const [selectedStatus, setSelectedStatus] = useState("All");
   const [sortBy, setSortBy] = useState("name");

   /* SELECTION */

   const [selectedStudent, setSelectedStudent] = useState(null);
   const [selectedIds, setSelectedIds] = useState([]);

   /* EDIT */

   const [showEditModal, setShowEditModal] = useState(false);
   const [editStudent, setEditStudent] = useState(null);
   const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);
   const [saving, setSaving] = useState(false);

   /* DELETE */

   const [deletingId, setDeletingId] = useState(null);
   const [bulkDeleting, setBulkDeleting] = useState(false);

   /* URL PARAMETERS */

   const classFromUrl = params.get("className") || "";
   const studentFromUrl = params.get("studentId") || "";

   /* =========================================================
      LOAD STUDENTS
   ========================================================= */

   const loadStudents = useCallback(async (showRefresh = false) => {
      if (showRefresh) {
         setRefreshing(true);
      } else {
         setLoading(true);
      }

      setError("");

      try {
         const data = await apiRequest("/api/admin/students");

         if (data?.success === false) {
            throw new Error(data.message || "Students API failed.");
         }

         let rows = [];

         if (Array.isArray(data?.students)) {
            rows = data.students;
         } else if (Array.isArray(data?.data?.students)) {
            rows = data.data.students;
         } else if (Array.isArray(data?.data)) {
            rows = data.data;
         } else if (Array.isArray(data)) {
            rows = data;
         }

         const normalized = rows.map(normalizeStudent).filter(Boolean);

         setStudents(normalized);

         setSelectedIds((previous) =>
            previous.filter((id) => normalized.some((s) => getId(s) === id))
         );

         setSelectedStudent((previous) => {
            if (!previous) return null;

            return (
               normalized.find((s) => getId(s) === getId(previous)) || null
            );
         });

         if (studentFromUrl) {
            const found = normalized.find(
               (student) =>
                  String(student._id) === String(studentFromUrl) ||
                  String(student.studentId || "").toLowerCase() ===
                  String(studentFromUrl).toLowerCase()
            );

            if (found) setSelectedStudent(found);
         }

         setSuccess(
            showRefresh
               ? `Data refreshed successfully. ${normalized.length} students loaded.`
               : ""
         );
      } catch (err) {
         setError(err.message || "Students load nahi ho pa rahe.");
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   }, [studentFromUrl]);

   useEffect(() => {
      loadStudents();
   }, [loadStudents]);

   /* URL CLASS FILTER */

   useEffect(() => {
      if (classFromUrl) {
         setSearch(classFromUrl);
         setSelectedClass(classFromUrl);
      }
   }, [classFromUrl]);

   /* =========================================================
      FILTER DATA
   ========================================================= */

   const availableClasses = useMemo(() => {
      const classes = new Set();

      students.forEach((student) => {
         const number = getClassNumber(student);
         if (number) classes.add(number);
      });

      return [...classes].sort((a, b) => Number(a) - Number(b));
   }, [students]);

   const availableStreams = useMemo(() => {
      return [...new Set(students.map(getStream))].sort();
   }, [students]);

   const visibleStudents = useMemo(() => {
      const query = search.trim().toLowerCase();

      const filtered = students.filter((student) => {
         const classNumber = getClassNumber(student);

         if (selectedClass && classNumber !== selectedClass) return false;

         if (
            selectedStream !== "All" &&
            getStream(student).toLowerCase() !== selectedStream.toLowerCase()
         ) {
            return false;
         }

         if (
            selectedStatus !== "All" &&
            getStudentStatus(student) !== selectedStatus
         ) {
            return false;
         }

         if (!query) return true;

         const values = [
            student.name,
            student.studentId,
            student.user?.userId,
            student.rollNumber,
            student.section,
            student.fatherName,
            student.motherName,
            student.email,
            student.phone,
            student.className,
            getStream(student),
         ];

         return values.some((value) =>
            String(value || "").toLowerCase().includes(query)
         );
      });

      return filtered.sort((a, b) => {
         if (sortBy === "class") {
            return Number(getClassNumber(a)) - Number(getClassNumber(b));
         }

         if (sortBy === "newest") {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
         }

         return String(a.name || "").localeCompare(String(b.name || ""));
      });
   }, [
      students,
      search,
      selectedClass,
      selectedStream,
      selectedStatus,
      sortBy,
   ]);

   /* =========================================================
      STATISTICS
   ========================================================= */

   const totalStudents = students.length;

   const activeStudents = students.filter(
      (s) => s.isActive !== false
   ).length;

   const inactiveStudents = totalStudents - activeStudents;

   const selectedCount = selectedIds.length;

   /* =========================================================
      CLASS FILTER
   ========================================================= */

   const openClass = (className) => {
      const number =
         String(className).match(/\d+/)?.[0] || String(className);

      setSearch("");
      setSelectedClass(number);
      setSelectedStudent(null);
      setSelectedIds([]);

      setParams({ className: number });
   };

   /* =========================================================
      STUDENT DETAILS
   ========================================================= */

   const openStudent = (student) => {
      setSelectedStudent(student);

      const id = student?._id || student?.studentId;

      if (id) {
         setParams({ studentId: id });
      }
   };

   const closeDetails = () => {
      setSelectedStudent(null);
      setParams({});
   };

   /* =========================================================
      SEARCH
   ========================================================= */

   const handleSearch = () => {
      const query = search.trim();

      if (!query) {
         clearFilters();
         return;
      }

      const digits = query.match(/\d+/)?.[0];

      if (digits) {
         const matchingClass = students.some(
            (student) => getClassNumber(student) === digits
         );

         if (
            matchingClass &&
            /^(class\s*)?\d+(st|nd|rd|th)?$/i.test(query)
         ) {
            openClass(digits);
            return;
         }
      }

      const q = query.toLowerCase();

      const found = students.find((student) => {
         const values = [
            student.name,
            student.studentId,
            student.user?.userId,
            student.rollNumber,
            student.email,
         ];

         return values.some((value) =>
            String(value || "").toLowerCase().includes(q)
         );
      });

      if (found) openStudent(found);
   };

   const clearFilters = () => {
      setSearch("");
      setSelectedClass("");
      setSelectedStream("All");
      setSelectedStatus("All");
      setSelectedIds([]);
      setSelectedStudent(null);
      setParams({});
   };

   /* =========================================================
      SELECT STUDENTS
   ========================================================= */

   const toggleStudentSelection = (id) => {
      setSelectedIds((previous) =>
         previous.includes(id)
            ? previous.filter((item) => item !== id)
            : [...previous, id]
      );
   };

   const toggleSelectAll = () => {
      const visibleIds = visibleStudents.map(getId).filter(Boolean);

      const allSelected =
         visibleIds.length > 0 &&
         visibleIds.every((id) => selectedIds.includes(id));

      if (allSelected) {
         setSelectedIds((previous) =>
            previous.filter((id) => !visibleIds.includes(id))
         );
      } else {
         setSelectedIds((previous) => [
            ...new Set([...previous, ...visibleIds]),
         ]);
      }
   };

   /* =========================================================
      EDIT STUDENT
   ========================================================= */

   const openEditModal = (student) => {
      setEditStudent(student);

      setEditForm({
         name: student.name || "",
         email: student.email || "",
         phone: student.phone || "",
         className: student.className || "",
         stream: getStream(student),
         section: student.section || "",
         rollNumber: student.rollNumber || "",
         fatherName: student.fatherName || "",
         motherName: student.motherName || "",
         city: student.city || "",
      });

      setError("");
      setSuccess("");
      setShowEditModal(true);
   };

   const closeEditModal = () => {
      if (saving) return;

      setShowEditModal(false);
      setEditStudent(null);
      setEditForm(INITIAL_EDIT_FORM);
   };

   const handleEditChange = (e) => {
      const { name, value } = e.target;

      setEditForm((previous) => ({
         ...previous,
         [name]: value,
      }));
   };

   const saveStudent = async (e) => {
      e.preventDefault();

      if (!editStudent?._id) {
         setError("Student ID nahi mila.");
         return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {
         const payload = {
            name: editForm.name.trim(),
            email: editForm.email.trim(),
            phone: editForm.phone.trim(),
            className: editForm.className.trim(),
            stream: editForm.stream.trim(),
            section: editForm.section.trim().toUpperCase(),
            rollNumber: editForm.rollNumber.trim(),
            fatherName: editForm.fatherName.trim(),
            motherName: editForm.motherName.trim(),
            city: editForm.city.trim(),
         };

         const data = await apiRequest(
            `/api/admin/students/${editStudent._id}`,
            {
               method: "PUT",
               body: JSON.stringify(payload),
            }
         );

         setSuccess(data?.message || "Student updated successfully.");
         setShowEditModal(false);
         setEditStudent(null);

         await loadStudents(true);
      } catch (err) {
         setError(err.message || "Student update nahi ho paaya.");
      } finally {
         setSaving(false);
      }
   };

   /* =========================================================
      DELETE STUDENT
   ========================================================= */

   const deleteStudent = async (student) => {
      if (!student?._id) {
         setError("Student ID nahi mila.");
         return;
      }

      const confirmed = window.confirm(
         `Kya aap ${student.name || "is student"} ko permanently delete karna chahte hain?`
      );

      if (!confirmed) return;

      setDeletingId(student._id);
      setError("");
      setSuccess("");

      try {
         const data = await apiRequest(
            `/api/admin/students/${student._id}`,
            { method: "DELETE" }
         );

         setStudents((previous) =>
            previous.filter((item) => getId(item) !== student._id)
         );

         setSelectedIds((previous) =>
            previous.filter((id) => id !== student._id)
         );

         if (getId(selectedStudent) === student._id) {
            closeDetails();
         }

         setSuccess(data?.message || "Student deleted successfully.");
      } catch (err) {
         setError(err.message || "Student delete nahi ho paaya.");
      } finally {
         setDeletingId(null);
      }
   };

   /* =========================================================
      BULK DELETE
   ========================================================= */

   const deleteSelectedStudents = async () => {
      if (!selectedIds.length) return;

      const confirmed = window.confirm(
         `Aap ${selectedIds.length} students ko delete karne wale hain. Kya aap sure hain?`
      );

      if (!confirmed) return;

      setBulkDeleting(true);
      setError("");
      setSuccess("");

      try {
         const results = await Promise.allSettled(
            selectedIds.map((id) =>
               apiRequest(`/api/admin/students/${id}`, {
                  method: "DELETE",
               })
            )
         );

         const deletedIds = selectedIds.filter(
            (_, index) => results[index].status === "fulfilled"
         );

         const failedCount = results.length - deletedIds.length;

         setStudents((previous) =>
            previous.filter((student) => !deletedIds.includes(getId(student)))
         );

         setSelectedIds([]);

         if (
            selectedStudent &&
            deletedIds.includes(getId(selectedStudent))
         ) {
            closeDetails();
         }

         setSuccess(
            `${deletedIds.length} students deleted successfully.` +
            (failedCount ? ` ${failedCount} could not be deleted.` : "")
         );

         if (failedCount) {
            setError("Kuch students delete nahi ho paaye. Please retry.");
         }
      } finally {
         setBulkDeleting(false);
      }
   };

   /* =========================================================
      EXPORT CSV
   ========================================================= */

   const exportCSV = () => {
      if (!visibleStudents.length) {
         setError("Export karne ke liye students nahi hain.");
         return;
      }

      const headers = [
         "Name",
         "Student ID",
         "Class",
         "Stream",
         "Section",
         "Roll Number",
         "Phone",
         "Email",
         "Father Name",
         "Mother Name",
         "City",
         "Status",
         "Subjects",
      ];

      const escapeCSV = (value) =>
         `"${String(value ?? "").replace(/"/g, '""')}"`;

      const rows = visibleStudents.map((student) => [
         student.name,
         student.studentId || student.user?.userId,
         student.className,
         getStream(student),
         student.section,
         student.rollNumber,
         student.phone,
         student.email,
         student.fatherName,
         student.motherName,
         student.city,
         getStudentStatus(student),
         getSubjects(student).join(", "),
      ]);

      const csv = [
         headers.map(escapeCSV).join(","),
         ...rows.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
         type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "school-students.csv";
      link.click();

      URL.revokeObjectURL(url);
   };

   /* =========================================================
      LOADING SCREEN
   ========================================================= */

   if (loading) {
      return (
         <div className="students-dark min-h-screen flex items-center justify-center bg-[#050510] text-white">
            <style>{`
          @keyframes spinStudent {
            to { transform: rotate(360deg); }
          }
          @keyframes loadPulse {
            0%,100% { opacity: .4; }
            50% { opacity: 1; }
          }
        `}</style>

            <div className="text-center">
               <div
                  className="mx-auto h-20 w-20 rounded-3xl border-4 border-violet-400/20 border-t-cyan-400"
                  style={{ animation: "spinStudent 1s linear infinite" }}
               />
               <h2 className="mt-7 text-2xl font-black">
                  Loading Students
               </h2>
               <p className="mt-2 text-sm text-slate-400">
                  School database connect ho raha hai...
               </p>
               <p
                  className="mt-4 text-xs font-bold text-cyan-300"
                  style={{ animation: "loadPulse 1.2s infinite" }}
               >
                  PLEASE WAIT
               </p>
            </div>
         </div>
      );
   }

   /* =========================================================
      MAIN UI
   ========================================================= */

   return (
      <div className="students-dark min-h-screen overflow-hidden bg-[#050510] p-3 text-white sm:p-5 md:p-8">

         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .students-dark {
          font-family: Inter, sans-serif;
          isolation: isolate;
          position: relative;
        }

        .students-dark * { box-sizing: border-box; }

        .student-grid {
          position: fixed;
          inset: 0;
          z-index: -3;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(139,92,246,.05) 1px, transparent 1px),
            linear-gradient(90deg,rgba(139,92,246,.05) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom,black,transparent 95%);
        }

        .student-orb {
          position: fixed;
          z-index: -2;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          filter: blur(110px);
          opacity: .2;
          pointer-events: none;
          animation: studentFloat 12s ease-in-out infinite alternate;
        }

        .student-orb.one {
          top: -180px;
          left: -120px;
          background: #7c3aed;
        }

        .student-orb.two {
          top: 30%;
          right: -180px;
          background: #0891b2;
          animation-delay: -4s;
        }

        .student-orb.three {
          bottom: -200px;
          left: 35%;
          background: #db2777;
          animation-delay: -7s;
        }

        @keyframes studentFloat {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(55px,45px) scale(1.18); }
        }

        @keyframes studentEnter {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes studentPop {
          from { opacity: 0; transform: translateY(15px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes studentGlow {
          0%,100% { box-shadow: 0 0 12px rgba(139,92,246,.12); }
          50% { box-shadow: 0 0 30px rgba(34,211,238,.2); }
        }

        @keyframes studentShine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes studentSpin {
          to { transform: rotate(360deg); }
        }

        .student-enter {
          animation: studentEnter .6s cubic-bezier(.2,.8,.2,1) both;
        }

        .student-glass {
          background: linear-gradient(145deg,rgba(21,21,43,.95),rgba(9,9,24,.96));
          border: 1px solid rgba(148,163,184,.15);
          box-shadow: 0 18px 55px rgba(0,0,0,.25);
          backdrop-filter: blur(18px);
        }

        .student-glass:hover {
          border-color: rgba(139,92,246,.35);
        }

        .student-gradient {
          color: transparent;
          background: linear-gradient(90deg,#c4b5fd,#67e8f9,#f0abfc,#c4b5fd);
          background-size: 250% auto;
          background-clip: text;
          -webkit-background-clip: text;
          animation: studentShine 7s linear infinite;
        }

        .student-stat {
          position: relative;
          overflow: hidden;
          transition: .3s ease;
        }

        .student-stat:hover {
          transform: translateY(-6px);
          border-color: rgba(103,232,249,.4);
        }

        .student-stat::after {
          content: "";
          position: absolute;
          top: -50px;
          right: -45px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--stat-glow);
          filter: blur(40px);
          opacity: .45;
        }

        .student-input {
          width: 100%;
          border: 1px solid rgba(148,163,184,.2);
          border-radius: 13px;
          background: rgba(4,7,20,.85);
          color: white;
          padding: 12px 14px;
          outline: none;
          transition: .25s ease;
        }

        .student-input::placeholder { color: #64748b; }

        .student-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139,92,246,.15);
        }

        .student-input option {
          background: #101024;
          color: white;
        }

        .student-label {
          display: block;
          margin-bottom: 8px;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .student-button {
          transition: transform .2s ease, filter .2s ease, box-shadow .2s ease;
        }

        .student-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.12);
          box-shadow: 0 10px 25px rgba(124,58,237,.2);
        }

        .student-button:active { transform: scale(.97); }

        .student-row { transition: .25s ease; }

        .student-row:hover {
          background: rgba(139,92,246,.07);
        }

        .student-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .student-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(#8b5cf6,#06b6d4);
          border-radius: 20px;
        }

        .student-modal-backdrop {
          background: rgba(0,0,0,.78);
          backdrop-filter: blur(10px);
        }

        .student-modal {
          animation: studentPop .3s ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          *,*::before,*::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

         <div className="student-grid" />
         <div className="student-orb one" />
         <div className="student-orb two" />
         <div className="student-orb three" />

         <div className="relative mx-auto max-w-[1550px]">

            {/* HEADER */}

            <header className="student-enter mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
               <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-violet-200">
                     <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                     Sunrise Public School
                     <span className="text-slate-600">/</span>
                     Admin Panel
                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                     Student <span className="student-gradient">Management</span>
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                     Manage student profiles, academic details, records and
                     registrations from one powerful dashboard.
                  </p>
               </div>

               <div className="flex flex-wrap gap-3">
                  <button
                     onClick={() => navigate("/admin/dashboard")}
                     className="student-button rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-300"
                  >
                     ← Dashboard
                  </button>

                  <button
                     onClick={() => loadStudents(true)}
                     disabled={refreshing}
                     title="Refresh Students Data"
                     className="student-button flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-200 disabled:opacity-50"
                  >
                     <span
                        className="text-lg"
                        style={
                           refreshing
                              ? { animation: "studentSpin .8s linear infinite" }
                              : {}
                        }
                     >
                        ↻
                     </span>
                     {refreshing ? "Refreshing..." : "Refresh"}
                  </button>

                  <button
                     onClick={exportCSV}
                     className="student-button rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-black text-white"
                  >
                     ↓ Export CSV
                  </button>
               </div>
            </header>

            {/* ALERTS */}

            {error && (
               <div className="student-enter mb-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
                  <span>⚠️</span>
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError("")}>✕</button>
               </div>
            )}

            {success && (
               <div className="student-enter mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
                  <span>✓</span>
                  <span className="flex-1">{success}</span>
                  <button onClick={() => setSuccess("")}>✕</button>
               </div>
            )}

            {/* STATISTICS */}

            <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
               <StatCard
                  icon="🎓"
                  label="Total Students"
                  value={totalStudents}
                  glow="rgba(139,92,246,.8)"
                  gradient="from-violet-600 to-fuchsia-500"
               />

               <StatCard
                  icon="✅"
                  label="Active Students"
                  value={activeStudents}
                  glow="rgba(16,185,129,.8)"
                  gradient="from-emerald-500 to-cyan-500"
               />

               <StatCard
                  icon="⏸️"
                  label="Inactive Students"
                  value={inactiveStudents}
                  glow="rgba(249,115,22,.8)"
                  gradient="from-orange-500 to-amber-500"
               />

               <StatCard
                  icon="📊"
                  label="Filtered Results"
                  value={visibleStudents.length}
                  glow="rgba(6,182,212,.8)"
                  gradient="from-cyan-500 to-blue-600"
               />
            </section>

            {/* QUICK CLASS CARDS */}

            <section className="student-enter mb-7">
               <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                     <h2 className="text-lg font-black text-white">
                        Quick Class Access
                     </h2>
                     <p className="mt-1 text-xs text-slate-500">
                        Select any class to filter students.
                     </p>
                  </div>

                  <button
                     onClick={() => {
                        setSelectedClass("");
                        setSearch("");
                        setParams({});
                     }}
                     className="text-xs font-black text-cyan-300 hover:text-white"
                  >
                     Show All →
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
                  {(availableClasses.length
                     ? availableClasses
                     : Array.from({ length: 12 }, (_, i) => String(i + 1))
                  ).map((cls, index) => {
                     const count = students.filter(
                        (s) => getClassNumber(s) === cls
                     ).length;

                     return (
                        <button
                           key={cls}
                           onClick={() => openClass(cls)}
                           className={`student-button rounded-2xl border p-4 text-left ${selectedClass === cls
                              ? "border-violet-400/60 bg-violet-500/20"
                              : "border-white/10 bg-white/[.035] hover:border-cyan-400/40"
                              }`}
                           style={{ animationDelay: `${index * 30}ms` }}
                        >
                           <p className="text-xs font-bold text-slate-400">CLASS</p>
                           <p className="mt-1 text-2xl font-black text-white">{cls}</p>
                           <p className="mt-1 text-[10px] font-bold text-cyan-300">
                              {count} Students
                           </p>
                        </button>
                     );
                  })}
               </div>
            </section>

            {/* FILTER PANEL */}

            <section className="student-glass mb-6 rounded-3xl p-5 md:p-6">
               <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                     <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">
                        Smart Search
                     </p>
                     <h2 className="mt-1 text-xl font-black text-white">
                        Find Students
                     </h2>
                  </div>

                  <button
                     onClick={clearFilters}
                     className="student-button self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300 sm:self-auto"
                  >
                     ✕ Clear All Filters
                  </button>
               </div>

               <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <div className="xl:col-span-2">
                     <label className="student-label">Search Student</label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2">
                           🔍
                        </span>

                        <input
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === "Enter") handleSearch();
                           }}
                           placeholder="Name, ID, Roll, Father..."
                           className="student-input pl-11"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="student-label">Class</label>
                     <select
                        className="student-input"
                        value={selectedClass}
                        onChange={(e) => {
                           setSelectedClass(e.target.value);
                           setSelectedStudent(null);
                        }}
                     >
                        <option value="">All Classes</option>
                        {availableClasses.map((cls) => (
                           <option key={cls} value={cls}>
                              Class {cls}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="student-label">Stream</label>
                     <select
                        className="student-input"
                        value={selectedStream}
                        onChange={(e) => setSelectedStream(e.target.value)}
                     >
                        <option value="All">All Streams</option>
                        {availableStreams.map((stream) => (
                           <option key={stream} value={stream}>
                              {stream}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <label className="student-label">Status</label>
                     <select
                        className="student-input"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                     >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                     </select>
                  </div>
               </div>

               <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                     onClick={handleSearch}
                     className="student-button rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-black text-white"
                  >
                     🔎 Search
                  </button>

                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-500">
                        Sort:
                     </span>

                     <select
                        className="student-input min-w-[145px] py-2 text-xs"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                     >
                        <option value="name">Name A-Z</option>
                        <option value="class">Class</option>
                        <option value="newest">Newest First</option>
                     </select>
                  </div>

                  <p className="ml-auto text-xs font-bold text-slate-400">
                     {visibleStudents.length} results found
                  </p>
               </div>
            </section>

            {/* STUDENT DETAILS */}

            {selectedStudent && (
               <section className="student-glass student-enter mb-6 rounded-3xl p-5 md:p-7">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-3xl">
                           🎓
                        </div>

                        <div>
                           <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                              Student Profile
                           </p>
                           <h2 className="mt-1 text-2xl font-black text-white">
                              {selectedStudent.name || "Student"}
                           </h2>
                           <p className="mt-1 text-xs text-slate-400">
                              {selectedStudent.studentId ||
                                 selectedStudent.user?.userId ||
                                 "No ID"}
                           </p>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-2">
                        <button
                           onClick={() => openEditModal(selectedStudent)}
                           className="student-button rounded-xl bg-blue-500/15 px-4 py-2 text-xs font-black text-blue-200"
                        >
                           ✏️ Edit
                        </button>

                        <button
                           onClick={() => deleteStudent(selectedStudent)}
                           disabled={deletingId === getId(selectedStudent)}
                           className="student-button rounded-xl bg-red-500/15 px-4 py-2 text-xs font-black text-red-200 disabled:opacity-50"
                        >
                           {deletingId === getId(selectedStudent)
                              ? "Deleting..."
                              : "🗑 Delete"}
                        </button>

                        <button
                           onClick={closeDetails}
                           className="student-button rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300"
                        >
                           ✕ Close
                        </button>
                     </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                     <DetailBox
                        label="Class"
                        value={selectedStudent.className}
                     />
                     <DetailBox
                        label="Stream"
                        value={getStream(selectedStudent)}
                     />
                     <DetailBox
                        label="Section"
                        value={selectedStudent.section}
                     />
                     <DetailBox
                        label="Roll Number"
                        value={selectedStudent.rollNumber}
                     />
                     <DetailBox
                        label="Phone"
                        value={selectedStudent.phone}
                     />
                     <DetailBox
                        label="Email"
                        value={selectedStudent.email}
                     />
                     <DetailBox
                        label="Father Name"
                        value={selectedStudent.fatherName}
                     />
                     <DetailBox
                        label="Mother Name"
                        value={selectedStudent.motherName}
                     />
                     <DetailBox
                        label="City"
                        value={selectedStudent.city}
                     />
                     <DetailBox
                        label="Status"
                        value={getStudentStatus(selectedStudent)}
                     />
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-5">
                     <div className="flex items-center justify-between gap-3">
                        <div>
                           <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                              Assigned Subjects
                           </p>
                           <p className="mt-1 text-xs text-slate-500">
                              Subjects currently stored in student record.
                           </p>
                        </div>

                        <span className="rounded-full bg-violet-500/15 px-3 py-2 text-xs font-black text-violet-200">
                           {getSubjects(selectedStudent).length} Subjects
                        </span>
                     </div>

                     <div className="mt-4 flex flex-wrap gap-2">
                        {getSubjects(selectedStudent).length ? (
                           getSubjects(selectedStudent).map((subject, index) => (
                              <span
                                 key={`${subject}-${index}`}
                                 className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100"
                              >
                                 📚 {subject}
                              </span>
                           ))
                        ) : (
                           <span className="text-sm text-amber-300">
                              No subjects assigned.
                           </span>
                        )}
                     </div>
                  </div>
               </section>
            )}

            {/* BULK ACTIONS */}

            {selectedCount > 0 && (
               <div className="student-enter mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
                  <p className="text-sm font-black text-violet-100">
                     ✓ {selectedCount} Students Selected
                  </p>

                  <div className="flex flex-wrap gap-2">
                     <button
                        onClick={() => setSelectedIds([])}
                        className="student-button rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-slate-200"
                     >
                        Clear Selection
                     </button>

                     <button
                        onClick={deleteSelectedStudents}
                        disabled={bulkDeleting}
                        className="student-button rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                     >
                        {bulkDeleting ? "Deleting..." : "🗑 Delete Selected"}
                     </button>
                  </div>
               </div>
            )}

            {/* STUDENTS TABLE */}

            <section className="student-glass animate-enter overflow-hidden rounded-3xl">
               <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center md:p-6">
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                        Student Directory
                     </p>
                     <h2 className="mt-1 text-xl font-black text-white">
                        {selectedClass
                           ? `Class ${selectedClass} Students`
                           : "All Students"}
                     </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                     <button
                        onClick={toggleSelectAll}
                        className="student-button rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300"
                     >
                        ☑ Select Visible
                     </button>

                     <button
                        onClick={() => loadStudents(true)}
                        disabled={refreshing}
                        className="student-button rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-200"
                     >
                        ↻ Refresh List
                     </button>
                  </div>
               </div>

               {visibleStudents.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                     <div className="text-6xl">🎓</div>
                     <h3 className="mt-4 text-xl font-black text-white">
                        No Students Found
                     </h3>
                     <p className="mt-2 max-w-sm text-sm text-slate-400">
                        Search change karein ya filters clear karke dobara try karein.
                     </p>
                     <button
                        onClick={clearFilters}
                        className="student-button mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-black text-white"
                     >
                        Show All Students
                     </button>
                  </div>
               ) : (
                  <div className="student-scroll overflow-x-auto">
                     <table className="w-full min-w-[1200px] text-left">
                        <thead className="bg-white/[.035] text-[10px] uppercase tracking-widest text-slate-400">
                           <tr>
                              <th className="px-5 py-5">
                                 <input
                                    type="checkbox"
                                    checked={
                                       visibleStudents.length > 0 &&
                                       visibleStudents.every((s) =>
                                          selectedIds.includes(getId(s))
                                       )
                                    }
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 accent-violet-500"
                                 />
                              </th>
                              <th className="px-4 py-5">Student</th>
                              <th className="px-4 py-5">Student ID</th>
                              <th className="px-4 py-5">Class</th>
                              <th className="px-4 py-5">Stream</th>
                              <th className="px-4 py-5">Section</th>
                              <th className="px-4 py-5">Subjects</th>
                              <th className="px-4 py-5">Roll No.</th>
                              <th className="px-4 py-5">Status</th>
                              <th className="px-4 py-5 text-right">Actions</th>
                           </tr>
                        </thead>

                        <tbody>
                           {visibleStudents.map((student, index) => {
                              const id = getId(student);
                              const isSelected = selectedIds.includes(id);
                              const isActive = student.isActive !== false;

                              return (
                                 <tr
                                    key={id || index}
                                    className="student-row border-t border-white/[.07]"
                                 >
                                    <td className="px-5 py-5">
                                       <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => toggleStudentSelection(id)}
                                          className="h-4 w-4 accent-violet-500"
                                       />
                                    </td>

                                    <td className="px-4 py-5">
                                       <button
                                          onClick={() => openStudent(student)}
                                          className="flex items-center gap-3 text-left"
                                       >
                                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-lg font-black text-white">
                                             {(student.name || "S").charAt(0).toUpperCase()}
                                          </div>

                                          <div>
                                             <p className="font-black text-white hover:text-cyan-300">
                                                {student.name || "Unknown Student"}
                                             </p>
                                             <p className="mt-1 max-w-[180px] truncate text-[11px] text-slate-500">
                                                {student.email || "Email unavailable"}
                                             </p>
                                          </div>
                                       </button>
                                    </td>

                                    <td className="px-4 py-5">
                                       <span className="rounded-lg border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-200">
                                          {student.studentId ||
                                             student.user?.userId ||
                                             "-"}
                                       </span>
                                    </td>

                                    <td className="px-4 py-5">
                                       <button
                                          onClick={() => openClass(student.className)}
                                          className="rounded-lg bg-violet-500/15 px-3 py-2 text-xs font-black text-violet-200 hover:bg-violet-500/30"
                                       >
                                          Class {student.className || "-"}
                                       </button>
                                    </td>

                                    <td className="px-4 py-5 text-xs font-bold text-slate-300">
                                       {getStream(student)}
                                    </td>

                                    <td className="px-4 py-5 text-sm font-bold text-slate-300">
                                       {student.section || "-"}
                                    </td>

                                    <td className="px-4 py-5">
                                       <div className="flex max-w-[210px] flex-wrap gap-1">
                                          {getSubjects(student).slice(0, 2).map((subject, i) => (
                                             <span
                                                key={`${subject}-${i}`}
                                                className="rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-200"
                                             >
                                                {subject}
                                             </span>
                                          ))}

                                          {getSubjects(student).length > 2 && (
                                             <span className="rounded-md bg-violet-500/15 px-2 py-1 text-[10px] font-black text-violet-200">
                                                +{getSubjects(student).length - 2}
                                             </span>
                                          )}

                                          {!getSubjects(student).length && (
                                             <span className="text-xs text-amber-300">
                                                Not assigned
                                             </span>
                                          )}
                                       </div>
                                    </td>

                                    <td className="px-4 py-5 text-sm font-bold text-slate-300">
                                       {student.rollNumber || "-"}
                                    </td>

                                    <td className="px-4 py-5">
                                       <span
                                          className={`rounded-full px-3 py-2 text-[10px] font-black ${isActive
                                             ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                             : "border border-orange-400/20 bg-orange-400/10 text-orange-300"
                                             }`}
                                       >
                                          {isActive ? "● Active" : "● Inactive"}
                                       </span>
                                    </td>

                                    <td className="px-4 py-5">
                                       <div className="flex justify-end gap-2">
                                          <button
                                             onClick={() => openStudent(student)}
                                             title="View Student"
                                             className="student-button rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-200"
                                          >
                                             View
                                          </button>

                                          <button
                                             onClick={() => openEditModal(student)}
                                             title="Edit Student"
                                             className="student-button rounded-lg border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-xs font-black text-blue-200"
                                          >
                                             ✏️
                                          </button>

                                          <button
                                             onClick={() => deleteStudent(student)}
                                             disabled={deletingId === id}
                                             title="Delete Student"
                                             className="student-button rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-black text-red-200 disabled:opacity-50"
                                          >
                                             {deletingId === id ? "..." : "🗑"}
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               )}

               <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 px-5 py-4 text-xs font-bold text-slate-500">
                  <span>
                     Showing {visibleStudents.length} of {totalStudents} students
                  </span>
                  <span>Sunrise Public School • Student Portal</span>
               </div>
            </section>

            {/* EDIT MODAL */}

            {showEditModal && (
               <div
                  className="student-modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6"
                  onMouseDown={(e) => {
                     if (e.target === e.currentTarget) closeEditModal();
                  }}
               >
                  <div className="student-modal student-glass my-auto w-full max-w-3xl rounded-3xl">
                     <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-7">
                        <div>
                           <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                              Student Profile
                           </p>
                           <h2 className="mt-1 text-2xl font-black text-white">
                              Edit Student
                           </h2>
                           <p className="mt-1 text-xs text-slate-400">
                              Update student information.
                           </p>
                        </div>

                        <button
                           onClick={closeEditModal}
                           disabled={saving}
                           className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300"
                        >
                           ✕
                        </button>
                     </div>

                     <form onSubmit={saveStudent} className="p-5 sm:p-7">
                        <div className="grid gap-4 sm:grid-cols-2">
                           <EditField
                              label="Student Name"
                              name="name"
                              value={editForm.name}
                              onChange={handleEditChange}
                              required
                           />

                           <EditField
                              label="Email"
                              name="email"
                              type="email"
                              value={editForm.email}
                              onChange={handleEditChange}
                           />

                           <EditField
                              label="Phone"
                              name="phone"
                              value={editForm.phone}
                              onChange={handleEditChange}
                           />

                           <EditField
                              label="Class"
                              name="className"
                              value={editForm.className}
                              onChange={handleEditChange}
                           />

                           <div>
                              <label className="student-label">Stream</label>
                              <select
                                 className="student-input"
                                 name="stream"
                                 value={editForm.stream}
                                 onChange={handleEditChange}
                              >
                                 {[
                                    "General",
                                    "Science",
                                    "Bio",
                                    "Maths",
                                    "Commerce",
                                    "Arts",
                                 ].map((stream) => (
                                    <option key={stream} value={stream}>
                                       {stream}
                                    </option>
                                 ))}
                              </select>
                           </div>

                           <EditField
                              label="Section"
                              name="section"
                              value={editForm.section}
                              onChange={handleEditChange}
                           />

                           <EditField
                              label="Roll Number"
                              name="rollNumber"
                              value={editForm.rollNumber}
                              onChange={handleEditChange}
                           />

                           <EditField
                              label="Father Name"
                              name="fatherName"
                              value={editForm.fatherName}
                              onChange={handleEditChange}
                           />

                           <EditField
                              label="Mother Name"
                              name="motherName"
                              value={editForm.motherName}
                              onChange={handleEditChange}
                           />

                           <EditField
                              label="City"
                              name="city"
                              value={editForm.city}
                              onChange={handleEditChange}
                           />
                        </div>

                        <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                           <button
                              type="submit"
                              disabled={saving}
                              className="student-button rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-7 py-3 font-black text-white disabled:opacity-50"
                           >
                              {saving ? "⏳ Saving..." : "💾 Save Changes"}
                           </button>

                           <button
                              type="button"
                              onClick={closeEditModal}
                              disabled={saving}
                              className="student-button rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-slate-300"
                           >
                              Cancel
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            )}

            {/* FOOTER */}

            <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-white/10 py-6 text-center sm:flex-row sm:text-left">
               <p className="text-xs font-bold text-slate-500">
                  © 2026 Sunrise Public School • Admin Dashboard
               </p>
               <p className="text-xs font-bold text-slate-500">
                  Student Management System
                  <span className="ml-2 text-cyan-300">● Online</span>
               </p>
            </footer>
         </div>
      </div>
   );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function StatCard({ icon, label, value, glow, gradient }) {
   return (
      <div
         className="student-glass student-stat student-enter rounded-2xl p-5"
         style={{ "--stat-glow": glow }}
      >
         <div className="relative z-10 flex items-center justify-between gap-3">
            <div>
               <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {label}
               </p>
               <p className="mt-2 text-4xl font-black text-white">
                  {value}
               </p>
               <div
                  className={`mt-3 h-1 w-16 rounded-full bg-gradient-to-r ${gradient}`}
               />
            </div>

            <div
               className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-lg`}
            >
               {icon}
            </div>
         </div>
      </div>
   );
}

function DetailBox({ label, value }) {
   return (
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
         <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {label}
         </p>
         <p className="mt-2 break-words text-sm font-bold text-slate-200">
            {value || "-"}
         </p>
      </div>
   );
}

function EditField({
   label,
   name,
   value,
   onChange,
   type = "text",
   required = false,
}) {
   return (
      <div>
         <label className="student-label">{label}</label>
         <input
            className="student-input"
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={`Enter ${label.toLowerCase()}`}
         />
      </div>
   );
}
