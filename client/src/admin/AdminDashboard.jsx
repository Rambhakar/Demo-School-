
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const menuItems = [
   { label: "Dashboard", icon: "⌂", path: "/admin/dashboard" },
   { label: "Admissions", icon: "📝", path: "/admin/admissions" },
   { label: "Students", icon: "🎓", path: "/admin/students" },
   { label: "Teachers", icon: "👨‍🏫", path: "/admin/teachers" },
   { label: "Subjects", icon: "📚", path: "/admin/subjects" },
   { label: "Create User", icon: "➕", path: "/admin/create-user" },
   { label: "Attendance", icon: "📅", path: "/admin/attendance" },
   { label: "Results", icon: "📊", path: "/admin/results" },
   { label: "Notices", icon: "📢", path: "/admin/notices" },
   { label: "Gallery", icon: "🖼️", path: "/admin/gallery" },
];

const communicationItems = [
   { label: "Communication", icon: "💬", path: "/admin/communication", soon: true },
   { label: "WhatsApp Center", icon: "🟢", path: "/admin/whatsapp", soon: true },
   { label: "Announcements", icon: "📣", path: "/admin/announcements", soon: true },
];

function readStoredUser() {
   const raw =
      localStorage.getItem("schoolUser") ||
      sessionStorage.getItem("schoolUser") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

   try {
      return raw ? JSON.parse(raw) : null;
   } catch {
      return null;
   }
}

function readToken() {
   return (
      localStorage.getItem("schoolToken") ||
      sessionStorage.getItem("schoolToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      ""
   ).trim();
}

export default function AdminDashboard() {
   const navigate = useNavigate();
   const location = useLocation();

   const [students, setStudents] = useState([]);
   const [teachers, setTeachers] = useState([]);
   const [subjects, setSubjects] = useState([]);
   const [admissions, setAdmissions] = useState([]);
   const [user, setUser] = useState(null);

   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [error, setError] = useState("");
   const [notice, setNotice] = useState("");

   const [search, setSearch] = useState("");
   const [searchOpen, setSearchOpen] = useState(false);
   const [mobileOpen, setMobileOpen] = useState(false);
   const [profileOpen, setProfileOpen] = useState(false);
   const [notificationsOpen, setNotificationsOpen] = useState(false);

   const logout = useCallback(() => {
      ["schoolToken", "schoolUser", "token", "user"].forEach((key) => {
         localStorage.removeItem(key);
         sessionStorage.removeItem(key);
      });

      navigate("/login", { replace: true });
   }, [navigate]);

   const go = useCallback((path, soon = false) => {
      setMobileOpen(false);
      setSearchOpen(false);
      setProfileOpen(false);
      setNotificationsOpen(false);

      if (soon) {
         setNotice("This feature will be available soon.");
         return;
      }

      navigate(path);
   }, [navigate]);

   const apiGet = useCallback(async (endpoint) => {
      const token = readToken();

      if (!token || token.split(".").length !== 3) {
         throw new Error("Login token missing or invalid. Please login again.");
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
         headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
         },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
         throw new Error(data.message || `Request failed: ${response.status}`);
      }

      return data;
   }, []);

   const normalizeArray = (data, key) => {
      if (Array.isArray(data?.[key])) return data[key];
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.results)) return data.results;
      return [];
   };

   const safeFetch = useCallback(async (endpoint, key) => {
      try {
         const data = await apiGet(endpoint);
         return { data: normalizeArray(data, key), error: "" };
      } catch (err) {
         console.error(endpoint, err);
         return { data: [], error: err.message };
      }
   }, [apiGet]);

   const fetchDashboard = useCallback(async (refresh = false) => {
      try {
         if (refresh) setRefreshing(true);
         else setLoading(true);

         setError("");
         setNotice("");

         const currentUser = readStoredUser();

         if (!currentUser) {
            throw new Error("Admin information not found. Please login again.");
         }

         if (String(currentUser.role || "").toLowerCase() !== "admin") {
            throw new Error("This dashboard is only for administrators.");
         }

         if (!readToken()) {
            throw new Error("Login token not found. Please login again.");
         }

         setUser(currentUser);

         const [studentRes, teacherRes, admissionRes, subjectRes] =
            await Promise.all([
               safeFetch("/api/admin/students", "students"),
               safeFetch("/api/admin/teachers", "teachers"),
               safeFetch("/api/admissions", "admissions"),
               safeFetch("/api/subjects", "subjects"),
            ]);

         setStudents(studentRes.data);
         setTeachers(teacherRes.data);
         setAdmissions(admissionRes.data);
         setSubjects(subjectRes.data);

         const failures = [
            studentRes.error,
            teacherRes.error,
            admissionRes.error,
            subjectRes.error,
         ].filter(Boolean);

         if (failures.length) {
            setNotice(`${failures.length} dashboard section(s) could not load. Check your API routes.`);
         }
      } catch (err) {
         console.error("Admin dashboard:", err);
         setError(err.message || "Dashboard could not be loaded.");
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   }, [safeFetch]);

   useEffect(() => {
      fetchDashboard();
   }, [fetchDashboard]);

   const totalStudents = students.length;
   const totalTeachers = teachers.length;
   const totalSubjects = subjects.length;
   const totalAdmissions = admissions.length;

   const activeStudents = students.filter((s) => s?.isActive !== false).length;
   const activeTeachers = teachers.filter((t) => t?.isActive !== false).length;

   const countStatus = (status) =>
      admissions.filter(
         (a) => String(a?.status || "").toLowerCase() === status
      ).length;

   const pendingAdmissions = countStatus("pending");
   const approvedAdmissions = countStatus("approved");
   const reviewedAdmissions = countStatus("reviewed");
   const rejectedAdmissions = countStatus("rejected");

   const searchResults = useMemo(() => {
      const q = search.trim().toLowerCase();
      if (!q) return [];

      const groups = [
         students.map((item) => ({
            type: "Student",
            name: item.name || "Student",
            id: item.studentId || "",
            path: "/admin/students",
            icon: "🎓",
         })),
         teachers.map((item) => ({
            type: "Teacher",
            name: item.name || "Teacher",
            id: item.teacherId || "",
            path: "/admin/teachers",
            icon: "👨‍🏫",
         })),
         subjects.map((item) => ({
            type: "Subject",
            name: item.name || "Subject",
            id: item.code || "",
            path: "/admin/subjects",
            icon: "📚",
         })),
         admissions.map((item) => ({
            type: "Admission",
            name: item.studentName || "Admission",
            id: item.applicationNumber || "",
            path: "/admin/admissions",
            icon: "📝",
         })),
      ];

      return groups.flat().filter((item) =>
         `${item.name} ${item.id} ${item.type}`.toLowerCase().includes(q)
      ).slice(0, 8);
   }, [search, students, teachers, subjects, admissions]);

   const recentActivity = useMemo(() => {
      const rows = [
         ...students.slice(0, 4).map((item) => ({
            name: item.name || "Student",
            type: "Student",
            id: item.studentId,
            date: item.createdAt,
            icon: "🎓",
         })),
         ...teachers.slice(0, 4).map((item) => ({
            name: item.name || "Teacher",
            type: "Teacher",
            id: item.teacherId,
            date: item.createdAt,
            icon: "👨‍🏫",
         })),
         ...admissions.slice(0, 4).map((item) => ({
            name: item.studentName || "Admission",
            type: "Admission",
            id: item.applicationNumber,
            date: item.createdAt,
            icon: "📝",
         })),
         ...subjects.slice(0, 4).map((item) => ({
            name: item.name || "Subject",
            type: "Subject",
            id: item.code,
            date: item.createdAt,
            icon: "📚",
         })),
      ];

      return rows
         .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
         .slice(0, 8);
   }, [students, teachers, admissions, subjects]);

   const now = new Date();
   const monthName = now.toLocaleString("en", { month: "long" });
   const year = now.getFullYear();
   const firstDay = new Date(year, now.getMonth(), 1).getDay();
   const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
   const calendarDays = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
   ];

   const activePath = location.pathname;

   return (
      <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
         <style>{`
        @keyframes dashboardFade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dashboardFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .dashboard-fade { animation: dashboardFade .55s ease both; }
        .dashboard-float { animation: dashboardFloat 4s ease-in-out infinite; }
        .dashboard-card { transition: transform .25s ease, box-shadow .25s ease; }
        .dashboard-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(15,23,42,.09); }
      `}</style>

         <Sidebar
            items={menuItems}
            communicationItems={communicationItems}
            activePath={activePath}
            onNavigate={go}
            onLogout={logout}
         />

         {mobileOpen && (
            <div
               className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm lg:hidden"
               onClick={() => setMobileOpen(false)}
            >
               <div
                  className="h-full w-[285px] overflow-y-auto bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
               >
                  <SidebarHeader mobile onClose={() => setMobileOpen(false)} />
                  <div className="p-4">
                     <SidebarLinks
                        items={menuItems}
                        communicationItems={communicationItems}
                        activePath={activePath}
                        onNavigate={go}
                        onLogout={logout}
                     />
                  </div>
               </div>
            </div>
         )}

         <main className="min-h-screen lg:ml-[270px]">
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
               <div className="flex min-h-[76px] items-center gap-3 px-4 sm:px-7">
                  <button
                     onClick={() => setMobileOpen(true)}
                     className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl lg:hidden"
                     aria-label="Open menu"
                  >
                     ☰
                  </button>

                  <div className="relative min-w-0 max-w-2xl flex-1">
                     <div className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-50">
                        <span className="text-slate-400">⌕</span>
                        <input
                           value={search}
                           onChange={(e) => {
                              setSearch(e.target.value);
                              setSearchOpen(true);
                           }}
                           onFocus={() => setSearchOpen(true)}
                           placeholder="Search students, teachers, subjects..."
                           className="w-full bg-transparent text-sm outline-none"
                        />
                        {search && (
                           <button onClick={() => setSearch("")} className="text-slate-400">
                              ✕
                           </button>
                        )}
                     </div>

                     {searchOpen && search.trim() && (
                        <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                           {searchResults.length ? searchResults.map((item, i) => (
                              <button
                                 key={`${item.type}-${item.id}-${i}`}
                                 onClick={() => go(item.path)}
                                 className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                              >
                                 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">{item.icon}</span>
                                 <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-bold">{item.name}</span>
                                    <span className="text-xs text-slate-400">{item.type} · {item.id}</span>
                                 </span>
                                 <span>→</span>
                              </button>
                           )) : (
                              <p className="p-5 text-sm text-slate-400">No matching record found.</p>
                           )}
                           <button onClick={() => setSearchOpen(false)} className="w-full border-t p-2 text-xs text-slate-400">
                              Close search
                           </button>
                        </div>
                     )}
                  </div>

                  <button
                     onClick={() => fetchDashboard(true)}
                     disabled={refreshing}
                     title="Refresh dashboard"
                     className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg transition hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-50"
                  >
                     {refreshing ? "…" : "↻"}
                  </button>

                  <div className="relative hidden sm:block">
                     <button
                        onClick={() => {
                           setNotificationsOpen((v) => !v);
                           setProfileOpen(false);
                        }}
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 hover:bg-cyan-50"
                        title="Notifications"
                     >
                        🔔
                        {pendingAdmissions > 0 && (
                           <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                     </button>

                     {notificationsOpen && (
                        <div className="absolute right-0 top-14 w-72 rounded-2xl border bg-white p-4 shadow-2xl">
                           <p className="font-black">Notifications</p>
                           <p className="mt-2 text-sm text-slate-500">
                              {pendingAdmissions} pending admissions need attention.
                           </p>
                           <button onClick={() => go("/admin/admissions")} className="mt-3 w-full rounded-xl bg-cyan-50 p-3 text-sm font-bold text-cyan-700">
                              View Admissions →
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="relative">
                     <button
                        onClick={() => {
                           setProfileOpen((v) => !v);
                           setNotificationsOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-50"
                     >
                        <span className="hidden text-right sm:block">
                           <span className="block text-sm font-black">{user?.name || "Administrator"}</span>
                           <span className="text-[11px] text-slate-400">School Admin</span>
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 text-lg text-white">👨‍💼</span>
                     </button>

                     {profileOpen && (
                        <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border bg-white shadow-2xl">
                           <div className="bg-slate-900 p-4 text-white">
                              <p className="font-black">{user?.name || "Administrator"}</p>
                              <p className="text-xs text-slate-300">School Administrator</p>
                           </div>
                           <button onClick={() => go("/admin/settings")} className="w-full p-3 text-left text-sm hover:bg-slate-50">⚙️ Settings</button>
                           <button onClick={logout} className="w-full p-3 text-left text-sm font-bold text-red-500 hover:bg-red-50">↪ Logout</button>
                        </div>
                     )}
                  </div>
               </div>
            </header>

            <div className="dashboard-fade space-y-6 px-4 py-6 sm:px-7 lg:px-8">
               {error && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                     <span>{error}</span>
                     <div className="flex gap-2">
                        <button onClick={() => fetchDashboard(true)} className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white">Retry</button>
                        <button onClick={logout} className="rounded-lg border border-red-200 bg-white px-4 py-2 font-bold">Login Again</button>
                     </div>
                  </div>
               )}

               {notice && (
                  <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                     {notice}
                     <button onClick={() => setNotice("")}>✕</button>
                  </div>
               )}

               <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-800 p-6 text-white shadow-xl sm:p-9">
                  <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl" />
                  <div className="absolute -bottom-20 right-1/3 h-52 w-52 rounded-full bg-blue-400/10 blur-2xl" />
                  <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                     <div>
                        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black tracking-[.2em] text-cyan-200">
                           SCHOOL ADMIN CONTROL CENTER
                        </span>
                        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                           Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                           Manage students, teachers, admissions, attendance and academic results from one place.
                        </p>
                     </div>
                     <div className="flex flex-wrap gap-3">
                        <button onClick={() => go("/admin/attendance")} className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20">
                           📅 Attendance
                        </button>
                        <button onClick={() => go("/admin/create-user")} className="rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-lg transition hover:-translate-y-1">
                           + Create User
                        </button>
                     </div>
                  </div>
               </section>

               <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard title="Total Students" value={loading ? "..." : totalStudents} subtitle={`${activeStudents} active students`} icon="🎓" color="blue" />
                  <StatCard title="Total Teachers" value={loading ? "..." : totalTeachers} subtitle={`${activeTeachers} active teachers`} icon="👨‍🏫" color="amber" />
                  <StatCard title="Subjects" value={loading ? "..." : totalSubjects} subtitle="Subjects created" icon="📚" color="cyan" />
                  <StatCard title="Admissions" value={loading ? "..." : totalAdmissions} subtitle={`${pendingAdmissions} pending`} icon="📝" color="purple" />
                  <StatCard title="Approved" value={loading ? "..." : approvedAdmissions} subtitle={`${reviewedAdmissions} reviewed`} icon="🏆" color="green" />
               </section>

               <section className="grid gap-5 xl:grid-cols-2">
                  <FeatureCard
                     icon="📅"
                     title="Attendance Management"
                     text="Open daily class attendance, mark students present or absent and review attendance records."
                     button="Manage Attendance"
                     gradient="from-cyan-600 to-blue-700"
                     onClick={() => go("/admin/attendance")}
                  />
                  <FeatureCard
                     icon="📊"
                     title="Examination & Results"
                     text="Open the results section to manage examinations, subject marks, grades and student performance."
                     button="Manage Results"
                     gradient="from-violet-600 to-indigo-700"
                     onClick={() => go("/admin/results")}
                  />
               </section>

               <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
                  <Card title="Student Overview" subtitle="Active and inactive student accounts">
                     <div className="grid items-center gap-7 sm:grid-cols-[170px_1fr]">
                        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full" style={{ background: `conic-gradient(#06b6d4 ${totalStudents ? activeStudents / totalStudents * 360 : 0}deg, #e2e8f0 0deg)` }}>
                           <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                              <span className="text-3xl font-black">{totalStudents}</span>
                              <span className="text-xs font-bold text-slate-400">Students</span>
                           </div>
                        </div>
                        <div className="space-y-5">
                           <ProgressRow label="Active Students" value={activeStudents} total={totalStudents} color="bg-cyan-500" />
                           <ProgressRow label="Inactive Students" value={totalStudents - activeStudents} total={totalStudents} color="bg-amber-400" />
                           <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-xs font-bold text-slate-400">Active Teachers</p>
                              <p className="mt-1 text-2xl font-black">{activeTeachers}</p>
                           </div>
                        </div>
                     </div>
                  </Card>

                  <Card title="Admission Status" subtitle="Application overview">
                     <div className="space-y-5">
                        <ProgressRow label="Approved" value={approvedAdmissions} total={totalAdmissions} color="bg-emerald-500" />
                        <ProgressRow label="Pending" value={pendingAdmissions} total={totalAdmissions} color="bg-amber-400" />
                        <ProgressRow label="Reviewed" value={reviewedAdmissions} total={totalAdmissions} color="bg-blue-500" />
                        <ProgressRow label="Rejected" value={rejectedAdmissions} total={totalAdmissions} color="bg-red-500" />
                     </div>
                  </Card>
               </section>

               <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                  <Card title="School Snapshot" subtitle="Current database records">
                     <div className="flex h-60 items-end gap-4 sm:gap-8">
                        {[
                           ["Students", totalStudents, "bg-blue-400"],
                           ["Active", activeStudents, "bg-cyan-400"],
                           ["Teachers", totalTeachers, "bg-amber-400"],
                           ["Subjects", totalSubjects, "bg-violet-400"],
                           ["Admissions", totalAdmissions, "bg-emerald-400"],
                        ].map(([label, value, color]) => {
                           const max = Math.max(totalStudents, totalTeachers, totalSubjects, totalAdmissions, 1);
                           return (
                              <div key={label} className="flex h-full flex-1 flex-col items-center justify-end">
                                 <span className="mb-2 text-sm font-black">{value}</span>
                                 <div className={`w-full max-w-[65px] rounded-t-2xl ${color} transition-all duration-700`} style={{ height: `${Math.max(value / max * 165, 5)}px` }} />
                                 <span className="mt-3 text-center text-[10px] font-bold text-slate-400">{label}</span>
                              </div>
                           );
                        })}
                     </div>
                  </Card>

                  <Card title={`${monthName} ${year}`} subtitle="School calendar">
                     <div className="grid grid-cols-7 gap-1 text-center">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                           <div key={`${d}-${i}`} className="py-2 text-xs font-black text-slate-400">{d}</div>
                        ))}
                        {calendarDays.map((day, i) => (
                           <div key={i} className="flex h-9 items-center justify-center">
                              {day && (
                                 <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${day === now.getDate() ? "bg-cyan-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"}`}>
                                    {day}
                                 </span>
                              )}
                           </div>
                        ))}
                     </div>
                  </Card>
               </section>

               <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                  <Card title="Recent Admissions" subtitle="Latest applications" action="View All" onAction={() => go("/admin/admissions")}>
                     {admissions.length === 0 ? (
                        <EmptyState text="No admissions yet" />
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full min-w-[560px] text-left">
                              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                                 <tr>
                                    <th className="p-3">Application</th>
                                    <th className="p-3">Student</th>
                                    <th className="p-3">Class</th>
                                    <th className="p-3">Status</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {admissions.slice(0, 5).map((item) => (
                                    <tr key={item._id || item.applicationNumber} className="hover:bg-slate-50">
                                       <td className="p-3 text-sm font-bold text-cyan-700">{item.applicationNumber || "-"}</td>
                                       <td className="p-3">
                                          <p className="text-sm font-bold">{item.studentName || "-"}</p>
                                          <p className="text-xs text-slate-400">{item.phone || "-"}</p>
                                       </td>
                                       <td className="p-3 text-sm">{item.classApplied || "-"}</td>
                                       <td className="p-3"><StatusBadge status={item.status} /></td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </Card>

                  <Card title="Quick Actions" subtitle="Frequently used tools">
                     <div className="space-y-2">
                        <QuickAction icon="🎓" title="Add Student" text="Create student account" onClick={() => go("/admin/create-user")} />
                        <QuickAction icon="👨‍🏫" title="Add Teacher" text="Create teacher account" onClick={() => go("/admin/create-user")} />
                        <QuickAction icon="📚" title="Manage Subjects" text={`${totalSubjects} subjects available`} onClick={() => go("/admin/subjects")} />
                        <QuickAction icon="📅" title="Mark Attendance" text="Open daily attendance" onClick={() => go("/admin/attendance")} />
                        <QuickAction icon="📊" title="Manage Results" text="Open academic results" onClick={() => go("/admin/results")} />
                        <QuickAction icon="📢" title="Manage Notices" text="Create school notice" onClick={() => go("/admin/notices")} />
                        <QuickAction icon="⚙️" title="School Settings" text="Manage admin settings" onClick={() => go("/admin/settings")} />
                     </div>
                  </Card>
               </section>

               <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                  <Card title="Recent Activity" subtitle="Latest records">
                     {recentActivity.length === 0 ? (
                        <EmptyState text="No recent activity" />
                     ) : (
                        <div className="space-y-2">
                           {recentActivity.map((item, i) => (
                              <div key={`${item.type}-${item.id || i}`} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50">
                                 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">{item.icon}</span>
                                 <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold">{item.name}</p>
                                    <p className="text-xs text-slate-400">{item.type} {item.id ? `· ${item.id}` : ""}</p>
                                 </div>
                                 <span className="text-xs text-slate-400">{item.date ? new Date(item.date).toLocaleDateString() : "Recent"}</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </Card>

                  <Card title="System Overview" subtitle="Backend connection and records">
                     <div className="space-y-3">
                        <SystemRow label="Backend API" value={API_URL} />
                        <SystemRow label="Students" value={totalStudents} />
                        <SystemRow label="Teachers" value={totalTeachers} />
                        <SystemRow label="Subjects" value={totalSubjects} />
                        <SystemRow label="Admissions" value={totalAdmissions} />
                        <SystemRow label="Admin Access" value={user ? "Active" : "Missing"} good={Boolean(user)} />
                     </div>
                  </Card>
               </section>

               <footer className="py-8 text-center text-xs font-semibold text-slate-400">
                  SchoolHub Admin Dashboard · School Management System
               </footer>
            </div>
         </main>
      </div>
   );
}

function Sidebar({ items, communicationItems, activePath, onNavigate, onLogout }) {
   return (
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[270px] flex-col border-r border-slate-200 bg-white lg:flex">
         <SidebarHeader />
         <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <SidebarLinks items={items} communicationItems={communicationItems} activePath={activePath} onNavigate={onNavigate} onLogout={onLogout} />
         </div>
      </aside>
   );
}

function SidebarHeader({ mobile = false, onClose }) {
   return (
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
         <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-700 text-xl text-white shadow-lg">🎓</div>
            <div>
               <p className="text-lg font-black tracking-tight">SchoolHub</p>
               <p className="text-[9px] font-black uppercase tracking-[.22em] text-slate-400">Management</p>
            </div>
         </div>
         {mobile && <button onClick={onClose} className="rounded-xl bg-slate-100 px-3 py-2">✕</button>}
      </div>
   );
}

function SidebarLinks({ items, communicationItems, activePath, onNavigate, onLogout }) {
   return (
      <>
         <SidebarSection title="Main Menu" items={items} activePath={activePath} onNavigate={onNavigate} />
         <div className="my-5 h-px bg-slate-100" />
         <SidebarSection title="Communication" items={communicationItems} activePath={activePath} onNavigate={onNavigate} />
         <div className="my-5 h-px bg-slate-100" />
         <SidebarSection title="System" items={[{ label: "Settings", icon: "⚙️", path: "/admin/settings" }]} activePath={activePath} onNavigate={onNavigate} />
         <button onClick={onLogout} className="mt-5 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">↪</span>
            Logout
         </button>
      </>
   );
}

function SidebarSection({ title, items, activePath, onNavigate }) {
   return (
      <section>
         <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{title}</p>
         <nav className="space-y-1.5">
            {items.map((item) => {
               const active = activePath === item.path;
               return (
                  <button
                     key={item.label}
                     onClick={() => onNavigate(item.path, item.soon)}
                     className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold transition duration-200 ${active
                           ? "bg-gradient-to-r from-cyan-50 to-blue-50 text-slate-900 shadow-sm"
                           : "text-slate-500 hover:translate-x-1 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                  >
                     <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-base ${active ? "bg-white text-cyan-600 shadow-sm" : "bg-slate-50 group-hover:bg-white"}`}>
                        {item.icon}
                     </span>
                     <span className="flex-1">{item.label}</span>
                     {item.soon && <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-400">SOON</span>}
                     {active && <span className="h-2 w-2 rounded-full bg-cyan-500" />}
                  </button>
               );
            })}
         </nav>
      </section>
   );
}

function StatCard({ title, value, subtitle, icon, color }) {
   const colors = {
      blue: "from-blue-50 to-cyan-50 text-blue-700",
      amber: "from-amber-50 to-yellow-50 text-amber-700",
      cyan: "from-cyan-50 to-teal-50 text-cyan-700",
      purple: "from-purple-50 to-fuchsia-50 text-purple-700",
      green: "from-emerald-50 to-green-50 text-emerald-700",
   };

   return (
      <div className={`dashboard-card rounded-3xl border border-white bg-gradient-to-br ${colors[color]} p-5 shadow-sm`}>
         <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-xl shadow-sm">{icon}</span>
            <span className="text-[10px] font-black tracking-widest opacity-50">LIVE</span>
         </div>
         <p className="mt-5 text-sm font-bold opacity-80">{title}</p>
         <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
         <p className="mt-2 text-xs font-semibold opacity-70">{subtitle}</p>
      </div>
   );
}

function FeatureCard({ icon, title, text, button, gradient, onClick }) {
   return (
      <div className={`dashboard-card relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg`}>
         <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
         <div className="relative">
            <span className="dashboard-float flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">{icon}</span>
            <h2 className="mt-5 text-xl font-black">{title}</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/80">{text}</p>
            <button onClick={onClick} className="mt-5 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-900 transition hover:-translate-y-1 hover:shadow-xl">
               {button} →
            </button>
         </div>
      </div>
   );
}

function Card({ title, subtitle, action, onAction, children }) {
   return (
      <div className="dashboard-card overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
         <div className="flex items-start justify-between gap-3 px-5 py-5 sm:px-6">
            <div>
               <h2 className="text-lg font-black">{title}</h2>
               {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            </div>
            {action && <button onClick={onAction} className="rounded-xl px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-50">{action} →</button>}
         </div>
         <div className="px-5 pb-6 sm:px-6">{children}</div>
      </div>
   );
}

function ProgressRow({ label, value, total, color }) {
   const percentage = total ? Math.min(100, Math.round(value / total * 100)) : 0;
   return (
      <div>
         <div className="flex justify-between gap-3 text-sm">
            <span className="font-bold text-slate-600">{label}</span>
            <span className="font-black">{value} <span className="text-xs text-slate-400">({percentage}%)</span></span>
         </div>
         <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${percentage}%` }} />
         </div>
      </div>
   );
}

function QuickAction({ icon, title, text, onClick }) {
   return (
      <button onClick={onClick} className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm">
         <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">{icon}</span>
         <span className="min-w-0 flex-1">
            <span className="block text-sm font-black">{title}</span>
            <span className="mt-1 block truncate text-xs text-slate-400">{text}</span>
         </span>
         <span className="text-slate-300 transition group-hover:translate-x-1">→</span>
      </button>
   );
}

function StatusBadge({ status }) {
   const value = String(status || "pending").toLowerCase();
   const styles = {
      approved: "bg-emerald-50 text-emerald-700",
      pending: "bg-amber-50 text-amber-700",
      reviewed: "bg-blue-50 text-blue-700",
      rejected: "bg-red-50 text-red-700",
   };
   return <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${styles[value] || "bg-slate-100 text-slate-500"}`}>{value}</span>;
}

function SystemRow({ label, value, good = false }) {
   return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
         <span className="text-sm font-semibold text-slate-500">{label}</span>
         <span className={`max-w-[65%] truncate text-right text-sm font-black ${good ? "text-emerald-600" : "text-slate-800"}`}>
            {good && "● "}{value}
         </span>
      </div>
   );
}

function EmptyState({ text }) {
   return (
      <div className="flex min-h-36 flex-col items-center justify-center text-center">
         <span className="text-3xl">📭</span>
         <p className="mt-3 text-sm font-bold text-slate-500">{text}</p>
      </div>
   );
}
