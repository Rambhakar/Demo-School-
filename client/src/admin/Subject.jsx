
import React, { useEffect, useMemo, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () =>
  (
    localStorage.getItem("schoolToken") ||
    sessionStorage.getItem("schoolToken") ||
    localStorage.getItem("token") ||
    ""
  ).trim();

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Login session nahi mili. Please login again.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
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
    localStorage.removeItem("schoolToken");
    localStorage.removeItem("schoolUser");
    sessionStorage.removeItem("schoolToken");
    sessionStorage.removeItem("schoolUser");
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `API Error ${response.status}`
    );
  }

  return data;
};

// =====================================================
// NORMALIZATION HELPERS
// =====================================================

const normalizeText = (value) =>
  String(value ?? "").trim().toLowerCase();

const normalizeClass = (value) => {
  const text = normalizeText(value);

  if (["nursery", "lkg", "ukg"].includes(text)) {
    return text;
  }

  const match = text.match(
    /(?:^|\D)(1[0-2]|[1-9])(?:st|nd|rd|th)?(?:\D|$)/i
  );

  return match ? match[1] : "";
};

const normalizeStream = (value) =>
  normalizeText(value || "General");

const normalizeSection = (value) =>
  normalizeText(value);

const normalizeYear = (value) =>
  normalizeText(value);

const getDefaultAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 3 ? year : year - 1;

  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

const getStudentId = (student) =>
  student?._id || student?.studentId || "";

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

// =====================================================
// SUBJECT ELIGIBILITY
// =====================================================

const isSubjectAllowed = (student, subject) => {
  if (!student || !subject || subject.isActive === false) {
    return false;
  }

  // 1. Class must match
  const studentClass = normalizeClass(
    student.className || student.class
  );

  const subjectClass = normalizeClass(subject.className);

  if (!studentClass || studentClass !== subjectClass) {
    return false;
  }

  // 2. Stream must match
  const studentStream = normalizeStream(student.stream);
  const subjectStream = normalizeStream(subject.stream);

  // General subject is common to every stream.
  // General student cannot receive a specific-stream subject.
  if (
    subjectStream !== "general" &&
    (studentStream === "general" ||
      studentStream !== subjectStream)
  ) {
    return false;
  }

  // 3. Section must match
  const studentSection = normalizeSection(student.section);
  const subjectSection = normalizeSection(subject.section);

  // Blank subject section means common to all sections.
  // A blank student section cannot receive section-specific subjects.
  if (
    subjectSection &&
    studentSection !== subjectSection
  ) {
    return false;
  }

  // 4. Academic year must match
  const studentYear = normalizeYear(
    student.academicYear || getDefaultAcademicYear()
  );

  const subjectYear = normalizeYear(
    subject.academicYear || getDefaultAcademicYear()
  );

  if (studentYear !== subjectYear) {
    return false;
  }

  return true;
};

// =====================================================
// INITIAL FORM
// =====================================================

const INITIAL_FORM = {
  name: "",
  code: "",
  teacher: "",
  room: "",
  classesPerWeek: 5,
  description: "",
  className: "",
  stream: "General",
  section: "",
  academicYear: getDefaultAcademicYear(),
  icon: "📚",
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentSubjectsLoading, setStudentSubjectsLoading] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("assign");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const [studentSearch, setStudentSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [assignedStudentSubjects, setAssignedStudentSubjects] =
    useState([]);

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      fetchSubjects(),
      fetchTeachers(),
      fetchStudents(),
    ]);

    const failed = results.find(
      (result) => result.status === "rejected"
    );

    if (failed) {
      setError(failed.reason?.message || "Data load nahi hua.");
    }

    setLoading(false);
  };

  const fetchSubjects = async () => {
    const data = await apiRequest("/api/subjects");
    setSubjects(Array.isArray(data?.subjects) ? data.subjects : []);
  };

  const fetchTeachers = async () => {
    const data = await apiRequest("/api/subjects/teachers");
    setTeachers(Array.isArray(data?.teachers) ? data.teachers : []);
  };

  const fetchStudents = async () => {
    setStudentLoading(true);

    try {
      const data = await apiRequest("/api/admin/students");

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

      setStudents(rows.map(normalizeStudent).filter(Boolean));
    } finally {
      setStudentLoading(false);
    }
  };

  // ===================================================
  // FORM
  // ===================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = editingId
        ? `/api/subjects/${editingId}`
        : "/api/subjects";

      const payload = {
        ...form,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        teacher: form.teacher || "",
        className: form.className.trim(),
        stream: form.stream.trim() || "General",
        section: form.section.trim().toUpperCase(),
        academicYear: form.academicYear.trim(),
        classesPerWeek: Number(form.classesPerWeek) || 0,
      };

      const data = await apiRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(
        data?.message || "Subject successfully saved."
      );

      resetForm();
      await fetchSubjects();
      setActiveTab("all");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject._id);

    setForm({
      name: subject.name || "",
      code: subject.code || "",
      teacher: subject.teacher?._id || "",
      room: subject.room || "",
      classesPerWeek: subject.classesPerWeek || 0,
      description: subject.description || "",
      className: subject.className || "",
      stream: subject.stream || "General",
      section: subject.section || "",
      academicYear:
        subject.academicYear || getDefaultAcademicYear(),
      icon: subject.icon || "📚",
    });

    setActiveTab("create");
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap is subject ko delete karna chahte hain?")) {
      return;
    }

    try {
      const data = await apiRequest(`/api/subjects/${id}`, {
        method: "DELETE",
      });

      setSuccess(data?.message || "Subject deleted.");
      await fetchSubjects();
    } catch (err) {
      setError(err.message);
    }
  };

  // ===================================================
  // STUDENT FILTERING
  // ===================================================

  const availableClasses = useMemo(() => {
    const classes = new Set();

    students.forEach((student) => {
      const cls = normalizeClass(
        student.className || student.class
      );

      if (cls) classes.add(cls);
    });

    const order = [
      "nursery",
      "lkg",
      "ukg",
      ...Array.from({ length: 12 }, (_, i) => String(i + 1)),
    ];

    return [...classes].sort(
      (a, b) => order.indexOf(a) - order.indexOf(b)
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    return students.filter((student) => {
      const cls = normalizeClass(
        student.className || student.class
      );

      if (selectedClass && cls !== selectedClass) {
        return false;
      }

      if (!query) return true;

      const values = [
        student.name,
        student.studentId,
        student.user?.userId,
        student.rollNumber,
        student.section,
        student.stream,
        student.className,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [students, studentSearch, selectedClass]);

  // ===================================================
  // STUDENT SUBJECTS
  // ===================================================

  const fetchStudentSubjects = async (student) => {
    if (!student) return;

    const id = getStudentId(student);
    if (!id) return;

    setStudentSubjectsLoading(true);

    try {
      const data = await apiRequest(
        `/api/subjects/student/${id}`
      );

      const assigned =
        data?.student?.assignedSubjects ||
        data?.assignedSubjects ||
        [];

      // Keep only subjects that actually belong to this student.
      const validAssigned = assigned.filter((subject) =>
        isSubjectAllowed(student, subject)
      );

      setAssignedStudentSubjects(validAssigned);

      setSelectedSubjects(
        validAssigned.map((subject) => subject._id).filter(Boolean)
      );
    } catch (err) {
      setAssignedStudentSubjects([]);
      setSelectedSubjects([]);
      setError(err.message || "Student subjects load nahi hue.");
    } finally {
      setStudentSubjectsLoading(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setSelectedSubjects([]);
    setAssignedStudentSubjects([]);
    setError("");
    setSuccess("");

    await fetchStudentSubjects(student);
  };

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((previous) =>
      previous.includes(subjectId)
        ? previous.filter((id) => id !== subjectId)
        : [...previous, subjectId]
    );
  };

  // ===================================================
  // ONLY ELIGIBLE SUBJECTS
  // ===================================================

  const studentClassSubjects = useMemo(() => {
    if (!selectedStudent) return [];

    return subjects.filter((subject) =>
      isSubjectAllowed(selectedStudent, subject)
    );
  }, [subjects, selectedStudent]);

  // Remove any old/stale selected ID that is not eligible.
  const eligibleSubjectIds = useMemo(
    () => new Set(studentClassSubjects.map((subject) => subject._id)),
    [studentClassSubjects]
  );

  const safeSelectedSubjects = selectedSubjects.filter((id) =>
    eligibleSubjectIds.has(id)
  );

  // ===================================================
  // SAVE ASSIGNMENT
  // ===================================================

  const handleAssignSubjects = async () => {
    if (!selectedStudent) {
      setError("Pehle student select karein.");
      return;
    }

    if (safeSelectedSubjects.length !== selectedSubjects.length) {
      setError(
        "Kuch selected subjects student ki class ya stream se match nahi karte. Please dobara selection karein."
      );
      return;
    }

    setAssigning(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest("/api/subjects/assign", {
        method: "PUT",
        body: JSON.stringify({
          studentId: getStudentId(selectedStudent),
          subjectIds: safeSelectedSubjects,
        }),
      });

      setSuccess(
        data?.message || "Subjects successfully assigned."
      );

      await fetchStudentSubjects(selectedStudent);
    } catch (err) {
      setError(err.message || "Subjects assign nahi ho paaye.");
    } finally {
      setAssigning(false);
    }
  };

  const clearSelection = () => {
    setSelectedSubjects([]);
  };

  // ===================================================
  // ALL SUBJECT SEARCH
  // ===================================================

  const filteredSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();

    if (!query) return subjects;

    return subjects.filter((subject) =>
      [
        subject.name,
        subject.code,
        subject.className,
        subject.stream,
        subject.section,
        subject.teacherName,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [subjects, subjectSearch]);

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080714] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-16 w-16 animate-spin rounded-full border-4 border-violet-400/20 border-t-cyan-400" />
          <h2 className="text-2xl font-black">
            Loading Subject Studio
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Students, subjects aur teachers load ho rahe hain...
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN DESIGN
  // ===================================================

  return (
    <div className="min-h-screen overflow-hidden bg-[#080714] px-3 py-6 text-white sm:px-5 md:px-8">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        .subject-enter {
          animation: fadeUp .45s ease both;
        }

        .subject-glass {
          background: linear-gradient(145deg,rgba(26,19,48,.94),rgba(10,11,28,.96));
          border: 1px solid rgba(167,139,250,.17);
          box-shadow: 0 20px 60px rgba(0,0,0,.25);
          backdrop-filter: blur(18px);
        }

        .subject-glass:hover {
          border-color: rgba(103,232,249,.35);
        }

        .subject-input {
          width: 100%;
          border: 1px solid rgba(148,163,184,.2);
          border-radius: 13px;
          padding: 13px 15px;
          color: white;
          background: rgba(5,7,22,.85);
          outline: none;
          transition: .2s;
        }

        .subject-input:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(139,92,246,.15);
        }

        .subject-input option {
          background: #151126;
          color: white;
        }

        .subject-label {
          display: block;
          margin-bottom: 9px;
          color: #c4b5fd;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .subject-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .subject-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(#a855f7,#06b6d4);
          border-radius: 20px;
        }

        .subject-card {
          transition: .2s ease;
        }

        .subject-card:hover {
          transform: translateY(-3px);
          border-color: rgba(103,232,249,.5);
        }

        @media(prefers-reduced-motion:reduce) {
          *,*::before,*::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none fixed -right-40 top-1/3 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-[1500px]">
        {/* HEADER */}

        <header className="subject-enter mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-violet-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              Sunrise Public School / Admin Studio
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Subject{" "}
              <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Create subjects, connect teachers and assign the
              correct curriculum to every student.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadAll}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/10"
            >
              ↻ Refresh Data
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab("create");
              }}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110"
            >
              + New Subject
            </button>
          </div>
        </header>

        {/* STATS */}

        <section className="mb-7 grid gap-4 sm:grid-cols-3">
          {[
            ["📚", "Total Subjects", subjects.length],
            ["👨‍🏫", "Total Teachers", teachers.length],
            ["🎓", "Total Students", students.length],
          ].map(([icon, label, value]) => (
            <div
              key={label}
              className="subject-glass subject-enter rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className="mt-2 text-4xl font-black">{value}</p>
                </div>
                <span className="text-4xl">{icon}</span>
              </div>
            </div>
          ))}
        </section>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
            <span>⚠️</span>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
            <span>✓</span>
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")}>✕</button>
          </div>
        )}

        {/* TABS */}

        <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[.035] p-2">
          {[
            ["create", "✨", "Create Subject"],
            ["all", "📖", "All Subjects"],
            ["assign", "🎓", "Student Assignment"],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-black transition ${activeTab === id
                  ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* CREATE SUBJECT */}

        {activeTab === "create" && (
          <section className="subject-glass subject-enter rounded-3xl p-5 md:p-8">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                Curriculum Builder
              </p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                {editingId ? "Edit Subject" : "Create New Subject"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Fill in the academic details below.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <FormInput
                  label="Subject Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Mathematics"
                  required
                />

                <FormInput
                  label="Subject Code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="MATH101"
                  required
                />

                <div>
                  <label className="subject-label">Class</label>
                  <select
                    className="subject-input"
                    name="className"
                    value={form.className}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {[
                      "Nursery",
                      "LKG",
                      "UKG",
                      ...Array.from({ length: 12 }, (_, i) => String(i + 1)),
                    ].map((cls) => (
                      <option key={cls} value={cls}>
                        {["Nursery", "LKG", "UKG"].includes(cls)
                          ? cls
                          : `Class ${cls}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="subject-label">Stream</label>
                  <select
                    className="subject-input"
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                  >
                    {[
                      "General",
                      "Science",
                      "Bio",
                      "Maths",
                      "Commerce",
                      "Arts",
                    ].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <FormInput
                  label="Section"
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  placeholder="Blank = All Sections"
                />

                <FormInput
                  label="Classroom"
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  placeholder="Room 101"
                />

                <FormInput
                  label="Classes Per Week"
                  name="classesPerWeek"
                  type="number"
                  min="0"
                  max="20"
                  value={form.classesPerWeek}
                  onChange={handleChange}
                />

                <FormInput
                  label="Academic Year"
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleChange}
                  placeholder="2026-27"
                  required
                />

                <FormInput
                  label="Subject Icon"
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  placeholder="📚"
                />

                <div className="md:col-span-2 xl:col-span-3">
                  <label className="subject-label">Assign Teacher</label>
                  <select
                    className="subject-input"
                    name="teacher"
                    value={form.teacher}
                    onChange={handleChange}
                  >
                    <option value="">No Teacher Assigned</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                        {teacher.teacherId ? ` (${teacher.teacherId})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 xl:col-span-3">
                  <label className="subject-label">Description</label>
                  <textarea
                    className="subject-input resize-none"
                    rows="4"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Write subject details..."
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-8 py-3.5 font-black text-white disabled:opacity-50"
                >
                  {saving
                    ? "⏳ Saving..."
                    : editingId
                      ? "💾 Update Subject"
                      : "✨ Create Subject"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 font-bold text-slate-300"
                >
                  ↺ Reset Form
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ALL SUBJECTS */}

        {activeTab === "all" && (
          <section className="subject-glass subject-enter overflow-hidden rounded-3xl">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:p-7">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                  Academic Library
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  All Subjects
                </h2>
              </div>

              <input
                className="subject-input w-full md:max-w-xs"
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                placeholder="🔍 Search subjects..."
              />
            </div>

            {filteredSubjects.length === 0 ? (
              <EmptyState
                icon="📚"
                title="No Subjects Found"
                description="Create your first subject to get started."
              />
            ) : (
              <div className="subject-scroll overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-white/[.035] text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-5">Subject</th>
                      <th className="px-6 py-5">Code</th>
                      <th className="px-6 py-5">Class / Stream</th>
                      <th className="px-6 py-5">Teacher</th>
                      <th className="px-6 py-5">Weekly</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubjects.map((subject) => (
                      <tr
                        key={subject._id}
                        className="border-t border-white/[.07] transition hover:bg-white/[.025]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-2xl">
                              {subject.icon || "📚"}
                            </span>
                            <div>
                              <p className="font-black">{subject.name}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {subject.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-xs font-black text-cyan-300">
                          {subject.code}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-bold">
                            Class {subject.className}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {subject.stream || "General"}
                            {subject.section
                              ? ` / ${subject.section}`
                              : " / All Sections"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {subject.academicYear || "-"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-300">
                          {subject.teacher?.name ||
                            subject.teacherName ||
                            "Not Assigned"}
                        </td>

                        <td className="px-6 py-5">
                          {subject.classesPerWeek || 0}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-black text-blue-200"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              onClick={() => handleDelete(subject._id)}
                              className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-white/10 px-6 py-4 text-xs font-bold text-slate-500">
              Showing {filteredSubjects.length} of {subjects.length} subjects
            </div>
          </section>
        )}

        {/* STUDENT ASSIGNMENT */}

        {activeTab === "assign" && (
          <section className="subject-glass subject-enter overflow-hidden rounded-3xl">
            <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 p-5 md:p-7">
              <p className="text-xs font-black uppercase tracking-widest text-fuchsia-300">
                Student Curriculum
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Student Subject Assignment
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Student select karein. System automatically uski
                class, stream, section aur academic year ke subjects
                filter karega.
              </p>
            </div>

            <div className="grid lg:grid-cols-[.85fr_1.15fr]">
              {/* STUDENT LIST */}

              <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r md:p-6">
                <label className="subject-label">Search Student</label>

                <input
                  className="subject-input mb-5"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Name / ID / Roll / Class..."
                />

                <p className="subject-label">Filter by Class</p>

                <div className="mb-5 flex flex-wrap gap-2">
                  <ClassButton
                    active={!selectedClass}
                    onClick={() => setSelectedClass("")}
                  >
                    All
                  </ClassButton>

                  {availableClasses.map((cls) => (
                    <ClassButton
                      key={cls}
                      active={selectedClass === cls}
                      onClick={() => setSelectedClass(cls)}
                    >
                      {["nursery", "lkg", "ukg"].includes(cls)
                        ? cls.toUpperCase()
                        : `Class ${cls}`}
                    </ClassButton>
                  ))}
                </div>

                <div className="subject-scroll max-h-[560px] space-y-2 overflow-y-auto pr-1">
                  {studentLoading ? (
                    <p className="p-8 text-center text-slate-400">
                      Loading students...
                    </p>
                  ) : filteredStudents.length === 0 ? (
                    <EmptyState
                      icon="🎓"
                      title="Student Not Found"
                      description="Try another search or class."
                    />
                  ) : (
                    filteredStudents.map((student) => {
                      const selected =
                        getStudentId(selectedStudent) ===
                        getStudentId(student);

                      return (
                        <button
                          key={getStudentId(student)}
                          type="button"
                          onClick={() => selectStudent(student)}
                          className={`subject-card w-full rounded-2xl border p-4 text-left ${selected
                              ? "border-cyan-400/50 bg-cyan-400/10"
                              : "border-white/10 bg-white/[.025]"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-xl">
                              🎓
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-black">
                                {student.name || "Student"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {student.studentId ||
                                  student.user?.userId ||
                                  "-"}
                              </p>

                              <p className="mt-1 text-xs text-cyan-300">
                                Class{" "}
                                {student.className || student.class || "-"}
                                {student.section
                                  ? ` - ${student.section}`
                                  : ""}
                                {" / "}
                                {student.stream || "General"}
                              </p>
                            </div>

                            {selected && (
                              <span className="text-xl text-cyan-300">
                                ✓
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <p className="mt-4 text-xs font-bold text-slate-500">
                  {filteredStudents.length} students found
                </p>
              </div>

              {/* ASSIGNMENT PANEL */}

              <div className="p-5 md:p-6">
                {!selectedStudent ? (
                  <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                    <div className="mb-5 text-7xl">👈</div>
                    <h3 className="text-xl font-black">
                      Select a Student
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-400">
                      Choose a student from the left panel to manage
                      their subjects.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* SELECTED STUDENT */}

                    <div className="mb-6 rounded-2xl border border-violet-400/20 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 text-2xl">
                          🎓
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                            Selected Student
                          </p>

                          <h3 className="mt-1 truncate text-xl font-black">
                            {selectedStudent.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            {selectedStudent.studentId ||
                              selectedStudent.user?.userId ||
                              "-"}
                            {" • "}
                            Class{" "}
                            {selectedStudent.className ||
                              selectedStudent.class}
                            {selectedStudent.section
                              ? ` - ${selectedStudent.section}`
                              : " - No Section"}
                          </p>

                          <p className="mt-1 text-xs text-cyan-300">
                            Stream: {selectedStudent.stream || "General"}
                            {" • "}
                            Year:{" "}
                            {selectedStudent.academicYear ||
                              getDefaultAcademicYear()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {studentSubjectsLoading ? (
                      <p className="p-10 text-center text-slate-400">
                        Loading student subjects...
                      </p>
                    ) : (
                      <>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-black">
                              Choose Subjects
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Only eligible subjects are displayed.
                            </p>
                          </div>

                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-200">
                            {safeSelectedSubjects.length} Selected
                          </span>
                        </div>

                        {/* FILTER SUMMARY */}

                        <div className="mb-5 flex flex-wrap gap-2">
                          {[
                            `Class ${selectedStudent.className || selectedStudent.class}`,
                            selectedStudent.stream || "General",
                            selectedStudent.section || "All Sections",
                            selectedStudent.academicYear ||
                            getDefaultAcademicYear(),
                          ].map((item) => (
                            <span
                              key={item}
                              className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs font-bold text-cyan-200"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        {/* SUBJECT CARDS */}

                        <div className="subject-scroll grid max-h-[440px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                          {studentClassSubjects.length === 0 ? (
                            <div className="col-span-full">
                              <EmptyState
                                icon="📚"
                                title="No Matching Subjects"
                                description="Is student ki class, stream, section aur academic year ke liye abhi koi subject nahi mila."
                              />
                            </div>
                          ) : (
                            studentClassSubjects.map((subject) => {
                              const checked =
                                safeSelectedSubjects.includes(subject._id);

                              return (
                                <label
                                  key={subject._id}
                                  className={`subject-card cursor-pointer rounded-2xl border p-4 ${checked
                                      ? "border-violet-400/60 bg-violet-500/10"
                                      : "border-white/10 bg-white/[.025]"
                                    }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        toggleSubject(subject._id)
                                      }
                                      className="mt-1 h-5 w-5 accent-violet-500"
                                    />

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl">
                                          {subject.icon || "📚"}
                                        </span>
                                        <p className="font-black">
                                          {subject.name}
                                        </p>
                                      </div>

                                      <p className="mt-2 text-xs text-cyan-300">
                                        {subject.code || "-"}
                                        {" • "}
                                        Class {subject.className}
                                      </p>

                                      <p className="mt-2 text-xs text-slate-400">
                                        {subject.stream || "General"}
                                        {" • "}
                                        {subject.section
                                          ? `Section ${subject.section}`
                                          : "All Sections"}
                                      </p>

                                      <p className="mt-2 text-xs text-slate-500">
                                        Teacher:{" "}
                                        {subject.teacher?.name ||
                                          subject.teacherName ||
                                          "Not Assigned"}
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>

                        {/* BUTTONS */}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleAssignSubjects}
                            disabled={
                              assigning ||
                              studentSubjectsLoading ||
                              safeSelectedSubjects.length !==
                              selectedSubjects.length
                            }
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-7 py-3.5 font-black text-white shadow-lg shadow-violet-900/20 disabled:opacity-50"
                          >
                            {assigning
                              ? "⏳ Saving..."
                              : "🎓 Save Assigned Subjects"}
                          </button>

                          <button
                            type="button"
                            onClick={clearSelection}
                            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold text-slate-300"
                          >
                            Clear Selection
                          </button>
                        </div>

                        {/* CURRENTLY ASSIGNED */}

                        {assignedStudentSubjects.length > 0 && (
                          <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[.06] p-5">
                            <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                              Currently Assigned Subjects
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {assignedStudentSubjects.map((subject) => (
                                <span
                                  key={subject._id}
                                  className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-100"
                                >
                                  {subject.icon || "📚"} {subject.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}

        <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-bold text-slate-500">
            © 2026 Sunrise Public School • Admin Subject Studio
          </p>
          <p className="text-xs font-bold text-slate-500">
            Designed with <span className="text-fuchsia-400">♥</span> for better learning
          </p>
        </footer>
      </div>
    </div>
  );
}

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
}) {
  return (
    <div>
      <label className="subject-label">{label}</label>
      <input
        className="subject-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );
}

function ClassButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-black transition ${active
          ? "border-violet-400/50 bg-gradient-to-r from-violet-600 to-blue-600 text-white"
          : "border-white/10 bg-white/[.04] text-slate-400 hover:border-cyan-400/30 hover:text-white"
        }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl">{icon}</div>
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}
