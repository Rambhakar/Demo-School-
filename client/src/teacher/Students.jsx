
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  GraduationCap,
  Filter,
  X,
  Eye,
  RefreshCw,
  BookOpen,
  AlertCircle,
  User,
  Hash,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================================================
   HELPERS
========================================================= */

const getToken = () =>
  localStorage.getItem("schoolToken") ||
  sessionStorage.getItem("schoolToken") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year =
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

  return `${year}-${String(year + 1).slice(-2)}`;
};

const normalize = (value) =>
  String(value ?? "").trim().toUpperCase();

const formatDate = (dateString) => {
  if (!dateString) return "Not available";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTeacher = (response) =>
  response?.teacher ||
  response?.data?.teacher ||
  response?.data ||
  response ||
  {};

const getAssignments = (response) => {
  const teacher = getTeacher(response);
  const currentYear = getCurrentAcademicYear();

  if (!Array.isArray(teacher.teachingAssignments)) return [];

  return teacher.teachingAssignments.filter((assignment) => {
    if (!assignment?.className || assignment.isActive === false) {
      return false;
    }

    return (
      !assignment.academicYear ||
      assignment.academicYear === currentYear
    );
  });
};

const isStudentAssigned = (student, assignments) => {
  const studentClass = normalize(student?.className);
  const studentSection = normalize(student?.section);

  return assignments.some((assignment) => {
    if (normalize(assignment.className) !== studentClass) return false;

    const sections = Array.isArray(assignment.sections)
      ? assignment.sections.map(normalize).filter(Boolean)
      : [];

    return sections.length === 0 || sections.includes(studentSection);
  });
};

const getStudentsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.students)) return response.students;
  if (Array.isArray(response?.data?.students)) return response.data.students;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;

  return [];
};

async function apiRequest(url, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Teacher login session nahi mili. Please login again.");
  }

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
    throw new Error(
      data.message || `Request failed. Server status: ${response.status}`
    );
  }

  return data;
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-slate-800">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color] || colors.blue}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold opacity-80">{title}</p>
        <Icon className="h-5 w-5 opacity-70" />
      </div>

      <p className="mt-3 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TeacherStudents() {
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("ALL");

  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* -------------------------------------------------------
     LOAD TEACHER PROFILE AND ASSIGNMENTS
  ------------------------------------------------------- */

  const loadTeacherProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      setError("");

      const data = await apiRequest("/api/teacher/profile");
      const teacher = getTeacher(data);
      const activeAssignments = getAssignments(data);

      setProfile(teacher);
      setAssignments(activeAssignments);

      const availableClasses = [
        ...new Set(
          activeAssignments
            .map((item) => String(item.className).trim())
            .filter(Boolean)
        ),
      ];

      setSelectedClass((previous) => {
        if (
          previous &&
          availableClasses.some(
            (className) => normalize(className) === normalize(previous)
          )
        ) {
          return previous;
        }

        return availableClasses[0] || "";
      });

      const firstClass = availableClasses[0];

      if (firstClass) {
        const classAssignments = activeAssignments.filter(
          (item) => normalize(item.className) === normalize(firstClass)
        );

        const sections = [
          ...new Set(
            classAssignments.flatMap((item) =>
              Array.isArray(item.sections)
                ? item.sections.map(normalize).filter(Boolean)
                : []
            )
          ),
        ];

        setSelectedSection(sections.length ? sections[0] : "ALL");
      } else {
        setSelectedSection("ALL");
      }
    } catch (err) {
      setAssignments([]);
      setProfile(null);
      setSelectedClass("");
      setError(err.message || "Teacher profile load nahi hua.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeacherProfile();
  }, [loadTeacherProfile]);

  /* -------------------------------------------------------
     ASSIGNED CLASSES AND SECTIONS
  ------------------------------------------------------- */

  const classes = useMemo(() => {
    return [
      ...new Set(
        assignments
          .map((item) => String(item.className || "").trim())
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [assignments]);

  const selectedClassAssignments = useMemo(
    () =>
      assignments.filter(
        (item) => normalize(item.className) === normalize(selectedClass)
      ),
    [assignments, selectedClass]
  );

  const hasAllSectionsAccess = selectedClassAssignments.some(
    (item) => !Array.isArray(item.sections) || item.sections.length === 0
  );

  const assignedSections = useMemo(() => {
    if (hasAllSectionsAccess) return [];

    return [
      ...new Set(
        selectedClassAssignments.flatMap((item) =>
          Array.isArray(item.sections)
            ? item.sections.map(normalize).filter(Boolean)
            : []
        )
      ),
    ].sort();
  }, [selectedClassAssignments, hasAllSectionsAccess]);

  /* -------------------------------------------------------
     CHANGE CLASS
  ------------------------------------------------------- */

  const handleClassChange = (className) => {
    setSelectedClass(className);
    setStudents([]);
    setError("");

    const classAssignments = assignments.filter(
      (item) => normalize(item.className) === normalize(className)
    );

    const hasAll = classAssignments.some(
      (item) => !Array.isArray(item.sections) || item.sections.length === 0
    );

    const sections = [
      ...new Set(
        classAssignments.flatMap((item) =>
          Array.isArray(item.sections)
            ? item.sections.map(normalize).filter(Boolean)
            : []
        )
      ),
    ];

    setSelectedSection(hasAll ? "ALL" : sections[0] || "ALL");
  };

  /* -------------------------------------------------------
     LOAD STUDENTS
     Attendance API is not used in this file.
  ------------------------------------------------------- */

  const loadStudents = useCallback(async () => {
    if (!selectedClass || assignments.length === 0) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        className: selectedClass,
      });

      if (selectedSection && selectedSection !== "ALL") {
        params.set("section", selectedSection);
      }

      const data = await apiRequest(
        `/api/teacher/students?${params.toString()}`
      );

      const rows = getStudentsFromResponse(data);

      const filtered = rows
        .filter(Boolean)
        .filter((student) => isStudentAssigned(student, assignments))
        .filter((student) => {
          if (selectedSection === "ALL") return true;

          return (
            normalize(student.section) === normalize(selectedSection)
          );
        });

      setStudents(filtered);
    } catch (err) {
      console.error("Load teacher students error:", err);
      setStudents([]);
      setError(err.message || "Students load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSection, assignments]);

  useEffect(() => {
    if (!profileLoading && selectedClass && assignments.length > 0) {
      loadStudents();
    } else if (!profileLoading && assignments.length === 0) {
      setStudents([]);
    }
  }, [
    profileLoading,
    selectedClass,
    selectedSection,
    assignments,
    loadStudents,
  ]);

  /* -------------------------------------------------------
     SEARCH STUDENTS
  ------------------------------------------------------- */

  const filteredStudents = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return students;

    return students.filter((student) => {
      const values = [
        student.name,
        student.studentId,
        student.rollNumber,
        student.email,
        student.phone,
        student.fatherName,
        student.className,
        student.section,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(searchValue)
      );
    });
  }, [students, search]);

  /* -------------------------------------------------------
     TEACHER DETAILS
  ------------------------------------------------------- */

  const teacherName =
    profile?.name || profile?.user?.name || "Teacher";

  const teacherPhoto =
    profile?.photo ||
    profile?.profilePhoto ||
    profile?.user?.photo;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-indigo-600">
                <GraduationCap className="h-5 w-5" />
                Teacher Workspace
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                My Students
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Welcome, {teacherName}. Apne assigned students ki details
                dekho aur manage karo.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              {teacherPhoto ? (
                <img
                  src={teacherPhoto}
                  alt={teacherName}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
                  {teacherName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-indigo-500">
                  Logged in as
                </p>
                <p className="font-bold text-indigo-900">{teacherName}</p>
                <p className="text-xs text-indigo-600">
                  Academic Year: {getCurrentAcademicYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PROFILE LOADING */}

        {profileLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-4 font-semibold text-slate-700">
              Teacher assignments load ho rahi hain...
            </p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <BookOpen className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-extrabold text-slate-900">
              No Classes Assigned
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Abhi Admin ne aapko koi active class ya section assign nahi
              kiya hai. Admin se apni teaching assignment check karwao.
            </p>

            <button
              onClick={loadTeacherProfile}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Check Again
            </button>
          </div>
        ) : (
          <>
            {/* ASSIGNMENT SUMMARY */}

            <section className="mb-6 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-200">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-semibold text-indigo-100">
                    Your Teaching Assignments
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold">
                    Assigned Classes
                  </h2>

                  <p className="mt-2 text-sm text-indigo-100">
                    Ye classes Admin ne aapko assign ki hain.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-2xl bg-white/15 px-5 py-4">
                    <p className="text-xs text-indigo-100">Classes</p>
                    <p className="mt-1 text-2xl font-extrabold">
                      {classes.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 px-5 py-4">
                    <p className="text-xs text-indigo-100">Assignments</p>
                    <p className="mt-1 text-2xl font-extrabold">
                      {assignments.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {classes.map((className) => (
                  <span
                    key={className}
                    className="rounded-xl border border-white/20 bg-white/15 px-4 py-2 text-sm font-bold"
                  >
                    Class {className}
                  </span>
                ))}
              </div>
            </section>

            {/* FILTERS */}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <Filter className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-extrabold text-slate-900">
                      Student Filters
                    </h2>
                    <p className="text-xs text-slate-500">
                      Sirf apni assigned class aur section select karo.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadStudents}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* CLASS */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Assigned Class
                  </label>

                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {classes.map((className) => (
                      <option key={className} value={className}>
                        Class {className}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SECTION */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Assigned Section
                  </label>

                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {hasAllSectionsAccess && (
                      <option value="ALL">All Sections</option>
                    )}

                    {assignedSections.map((section) => (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    ))}

                    {!hasAllSectionsAccess && assignedSections.length === 0 && (
                      <option value="ALL">No section assigned</option>
                    )}
                  </select>

                  {hasAllSectionsAccess && (
                    <p className="mt-1 text-xs text-emerald-600">
                      Admin ne all sections access diya hai.
                    </p>
                  )}
                </div>

                {/* SEARCH */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Search Student
                  </label>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Name, ID, roll, phone..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* STUDENT STATS */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Students"
                value={students.length}
                icon={Users}
                color="blue"
              />

              <StatCard
                title="Showing Students"
                value={filteredStudents.length}
                icon={UserRound}
                color="green"
              />

              <StatCard
                title="Assigned Classes"
                value={classes.length}
                icon={GraduationCap}
                color="indigo"
              />
            </section>

            {/* STUDENTS TABLE */}

            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Students List
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Showing {filteredStudents.length} of {students.length} assigned
                    students
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                  Class {selectedClass}
                  {selectedSection === "ALL"
                    ? " · All Sections"
                    : ` · Section ${selectedSection}`}
                </div>
              </div>

              {loading ? (
                <div className="p-16 text-center">
                  <RefreshCw className="mx-auto h-9 w-9 animate-spin text-indigo-600" />
                  <p className="mt-4 font-bold text-slate-700">
                    Students load ho rahe hain...
                  </p>
                </div>
              ) : students.length === 0 ? (
                <div className="p-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Users className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold text-slate-800">
                    No Students Found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Is assigned class/section mein active students nahi mile.
                    Admin se student class aur section details verify karwao.
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-14 text-center">
                  <Search className="mx-auto h-9 w-9 text-slate-300" />

                  <h3 className="mt-4 font-bold text-slate-800">
                    Student nahi mila
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Search keyword change karke dekho.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        {[
                          "Student",
                          "Roll No.",
                          "Class",
                          "Contact",
                          "Father Name",
                          "Action",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student) => (
                        <tr
                          key={student._id}
                          className="transition hover:bg-slate-50"
                        >
                          {/* STUDENT */}

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              {student.photo ? (
                                <img
                                  src={student.photo}
                                  alt={student.name}
                                  className="h-11 w-11 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700">
                                  {student.name?.charAt(0)?.toUpperCase() || "S"}
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-slate-900">
                                  {student.name || "Unnamed Student"}
                                </p>

                                <p className="mt-1 text-xs font-semibold text-indigo-600">
                                  ID: {student.studentId || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ROLL */}

                          <td className="px-5 py-5">
                            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                              {student.rollNumber || "N/A"}
                            </span>
                          </td>

                          {/* CLASS */}

                          <td className="px-5 py-5">
                            <span className="text-sm font-semibold text-slate-700">
                              {student.className} - {student.section || "N/A"}
                            </span>
                          </td>

                          {/* CONTACT */}

                          <td className="px-5 py-5">
                            <div className="space-y-2">
                              {student.phone && (
                                <p className="flex items-center gap-2 text-xs text-slate-600">
                                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                                  {student.phone}
                                </p>
                              )}

                              {student.email && (
                                <p className="flex max-w-[200px] items-center gap-2 truncate text-xs text-slate-600">
                                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  <span className="truncate">{student.email}</span>
                                </p>
                              )}

                              {!student.phone && !student.email && (
                                <span className="text-xs text-slate-400">
                                  No contact
                                </span>
                              )}
                            </div>
                          </td>

                          {/* FATHER */}

                          <td className="px-5 py-5">
                            <span className="text-sm font-semibold text-slate-700">
                              {student.fatherName || "N/A"}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-5">
                            <button
                              type="button"
                              onClick={() => setSelectedStudent(student)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* STUDENT DETAILS MODAL */}

      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                {selectedStudent.photo ? (
                  <img
                    src={selectedStudent.photo}
                    alt={selectedStudent.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-extrabold text-indigo-700">
                    {selectedStudent.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    {selectedStudent.name || "Student Details"}
                  </h2>

                  <p className="text-xs text-slate-500">
                    {selectedStudent.studentId || "No Student ID"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                  Student Information
                </p>

                <p className="mt-1 text-lg font-extrabold text-indigo-900">
                  {selectedStudent.name || "Student"}
                </p>

                <p className="mt-1 text-sm text-indigo-700">
                  Class {selectedStudent.className || selectedClass} ·
                  Section {selectedStudent.section || "N/A"}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  icon={UserRound}
                  label="Student Name"
                  value={selectedStudent.name}
                />

                <InfoItem
                  icon={Hash}
                  label="Student ID"
                  value={selectedStudent.studentId}
                />

                <InfoItem
                  icon={Hash}
                  label="Roll Number"
                  value={selectedStudent.rollNumber}
                />

                <InfoItem
                  icon={GraduationCap}
                  label="Class"
                  value={`Class ${selectedStudent.className || selectedClass} - Section ${selectedStudent.section || "N/A"}`}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Date of Birth"
                  value={formatDate(selectedStudent.dob)}
                />

                <InfoItem
                  icon={User}
                  label="Father Name"
                  value={selectedStudent.fatherName}
                />

                <InfoItem
                  icon={User}
                  label="Mother Name"
                  value={selectedStudent.motherName}
                />

                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={selectedStudent.phone}
                />

                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={selectedStudent.email}
                />

                <InfoItem
                  icon={MapPin}
                  label="City"
                  value={selectedStudent.city}
                />

                <InfoItem
                  icon={MapPin}
                  label="State"
                  value={selectedStudent.state}
                />

                <InfoItem
                  icon={MapPin}
                  label="Address"
                  value={selectedStudent.address}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Admission Date"
                  value={formatDate(selectedStudent.admissionDate)}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
