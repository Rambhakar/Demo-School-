
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// =====================================================
// API CONFIG
// =====================================================

const API_URL =
   import.meta.env.VITE_API_URL || "http://localhost:5000";

// =====================================================
// AUTH HELPERS
// =====================================================

const getToken = () =>
   localStorage.getItem("schoolToken") ||
   sessionStorage.getItem("schoolToken") ||
   localStorage.getItem("token") ||
   sessionStorage.getItem("token");

const getStoredUser = () => {
   const data =
      localStorage.getItem("schoolUser") ||
      sessionStorage.getItem("schoolUser") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

   try {
      return data ? JSON.parse(data) : null;
   } catch {
      return null;
   }
};

// =====================================================
// MENU ITEMS
// =====================================================

const menuItems = [
   {
      title: "Dashboard",
      icon: "🏠",
      link: "/student/dashboard",
      color: "from-violet-500 to-indigo-500",
   },
   {
      title: "Attendance",
      icon: "📊",
      link: "/student/attendance",
      color: "from-cyan-500 to-blue-500",
   },
   {
      title: "Results",
      icon: "📝",
      link: "/student/results",
      color: "from-pink-500 to-rose-500",
   },
   {
      title: "Subjects",
      icon: "📚",
      link: "/student/subjects",
      color: "from-amber-400 to-orange-500",
   },
   {
      title: "AI Study",
      icon: "🤖",
      link: "/student/ai-study",
      color: "from-fuchsia-500 to-purple-500",
   },
   {
      title: "My Profile",
      icon: "👤",
      link: "/student/profile",
      color: "from-emerald-400 to-teal-500",
   },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function StudentDashboard() {
   const navigate = useNavigate();
   const location = useLocation();
   const storedUser = getStoredUser();

   const [student, setStudent] = useState(null);
   const [attendance, setAttendance] = useState(null);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [error, setError] = useState("");
   const [sidebarOpen, setSidebarOpen] = useState(false);

   // ===================================================
   // FETCH DATA
   // ===================================================

   const fetchStudentData = async (showRefresh = false) => {
      try {
         if (showRefresh) setRefreshing(true);
         else setLoading(true);

         setError("");

         const token = getToken();

         if (!token) {
            throw new Error("Login session nahi mili. Please login again.");
         }

         const profileResponse = await fetch(
            `${API_URL}/api/student/profile`,
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         const profileData = await profileResponse.json();

         if (!profileResponse.ok || !profileData.success) {
            throw new Error(
               profileData.message || "Student profile load nahi hui."
            );
         }

         const studentData =
            profileData.student ||
            profileData.data ||
            profileData.profile;

         if (!studentData) {
            throw new Error("Student information nahi mili.");
         }

         setStudent(studentData);

         try {
            const attendanceResponse = await fetch(
               `${API_URL}/api/attendance/my/summary`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            const attendanceData = await attendanceResponse.json();

            if (attendanceResponse.ok && attendanceData.success) {
               setAttendance(attendanceData.summary || null);
            }
         } catch (attendanceError) {
            console.warn("Attendance load failed:", attendanceError);
         }
      } catch (err) {
         console.error(err);
         setError(err.message || "Dashboard load nahi hua.");
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   useEffect(() => {
      fetchStudentData();
   }, []);

   // ===================================================
   // STUDENT INFORMATION
   // ===================================================

   const studentName =
      student?.name ||
      student?.user?.name ||
      storedUser?.name ||
      "Student";

   const studentId =
      student?.studentId ||
      student?.user?.userId ||
      storedUser?.userId ||
      "N/A";

   const className = student?.className || "N/A";
   const section = student?.section || "N/A";
   const rollNumber = student?.rollNumber || "N/A";

   const fatherName = student?.fatherName || "Not available";
   const motherName = student?.motherName || "Not available";
   const phone = student?.phone || "Not available";
   const email = student?.email || "Not available";
   const city = student?.city || "Not available";
   const state = student?.state || "Not available";

   // ===================================================
   // ATTENDANCE
   // ===================================================

   const attendancePercentage = Math.min(
      Math.max(Number(attendance?.percentage || 0), 0),
      100
   );

   const present = Number(attendance?.present || 0);
   const absent = Number(attendance?.absent || 0);
   const late = Number(attendance?.late || 0);
   const totalAttendance = Number(attendance?.total || 0);

   // ===================================================
   // LOGOUT
   // ===================================================

   const handleLogout = () => {
      const confirmed = window.confirm(
         "Are you sure you want to logout from your student account?"
      );

      if (!confirmed) return;

      [
         "schoolToken",
         "schoolUser",
         "token",
         "user",
      ].forEach((key) => {
         localStorage.removeItem(key);
         sessionStorage.removeItem(key);
      });

      setSidebarOpen(false);

      // Logout ke baad public school website par redirect
      navigate("/", { replace: true });
   };

   // ===================================================
   // SCHOOL WEBSITE NAVIGATION
   // ===================================================

   const handleSchoolWebsite = () => {
      setSidebarOpen(false);
      navigate("/");
   };

   // ===================================================
   // LOADING SCREEN
   // ===================================================

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-violet-900 to-slate-950 text-white">
            <div className="text-center">
               <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-pink-500 to-cyan-400 animate-spin opacity-80" />
                  <div className="absolute inset-1 rounded-3xl bg-indigo-950 flex items-center justify-center text-4xl">
                     🎓
                  </div>
               </div>

               <h2 className="mt-7 text-2xl font-black">
                  Student Portal
               </h2>

               <p className="mt-2 text-indigo-200 animate-pulse">
                  Preparing your dashboard...
               </p>
            </div>
         </div>
      );
   }

   // ===================================================
   // UI
   // ===================================================

   return (
      <div className="min-h-screen bg-[#f5f6ff] text-slate-800 overflow-x-hidden">

         {/* BACKGROUND DECORATIONS */}

         <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-violet-300/20 blur-3xl" />
            <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-pink-300/10 blur-3xl" />
         </div>

         {/* MOBILE OVERLAY */}

         {sidebarOpen && (
            <div
               onClick={() => setSidebarOpen(false)}
               className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            />
         )}

         {/* =================================================
          SIDEBAR
      ================================================= */}


         <aside
            className={`
    fixed top-0 left-0 z-50 h-screen w-[280px]
    flex flex-col overflow-hidden
    bg-gradient-to-b from-[#17143b] via-[#211957] to-[#11152e]
    text-white shadow-2xl
    transition-transform duration-500
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
         >
            {/* BACKGROUND EFFECTS */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-20 left-0 w-40 h-40 bg-cyan-400/10 blur-3xl rounded-full pointer-events-none" />

            {/* BRAND */}
            <div className="relative z-10 shrink-0 h-24 px-6 flex items-center justify-between border-b border-white/10">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                     🎓
                  </div>

                  <div>
                     <h2 className="font-black text-lg tracking-wide">
                        Student<span className="text-cyan-400">Hub</span>
                     </h2>
                     <p className="text-[10px] text-indigo-200 uppercase tracking-[3px]">
                        Learning Portal
                     </p>
                  </div>
               </div>

               <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-2xl text-white/70 hover:text-white"
               >
                  ×
               </button>
            </div>

            {/* SCROLLABLE SIDEBAR CONTENT */}
            <div className="relative z-10 flex-1 overflow-y-auto min-h-0 custom-sidebar-scroll">

               {/* PROFILE */}
               <div className="p-5">
                  <div className="rounded-3xl p-4 border border-white/10 bg-white/[0.07] backdrop-blur-xl">
                     <div className="flex items-center gap-3">
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-black shadow-lg">
                           {studentName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                           <h3 className="font-bold truncate text-sm">
                              {studentName}
                           </h3>

                           <p className="text-xs text-cyan-300 mt-1">
                              ID: {studentId}
                           </p>

                           <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 mt-2">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              Student Account
                           </span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-white/10 rounded-xl p-3">
                           <p className="text-[10px] text-indigo-200 uppercase">
                              Class
                           </p>
                           <p className="font-bold text-sm mt-1">{className}</p>
                        </div>

                        <div className="bg-white/10 rounded-xl p-3">
                           <p className="text-[10px] text-indigo-200 uppercase">
                              Section
                           </p>
                           <p className="font-bold text-sm mt-1">{section}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* NAVIGATION */}
               <div className="px-4 pb-5">
                  <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-[3px] text-indigo-300/60">
                     Main Menu
                  </p>

                  <nav className="space-y-2">
                     {menuItems.map((item) => {
                        const active = location.pathname === item.link;

                        return (
                           <Link
                              key={item.title}
                              to={item.link}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                group relative flex items-center gap-3 px-4 py-3.5
                rounded-2xl font-semibold text-sm
                transition-all duration-300
                ${active
                                    ? "bg-gradient-to-r " + item.color +
                                    " text-white shadow-lg translate-x-1"
                                    : "text-indigo-100/75 hover:text-white hover:bg-white/10 hover:translate-x-1"
                                 }
              `}
                           >
                              <span className="text-xl group-hover:scale-125 transition-transform duration-300">
                                 {item.icon}
                              </span>

                              <span>{item.title}</span>

                              {active && (
                                 <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-[0_0_12px_white]" />
                              )}
                           </Link>
                        );
                     })}
                  </nav>
               </div>
            </div>

            {/* FIXED BOTTOM BUTTONS */}
            <div className="relative z-20 shrink-0 p-4 border-t border-white/10 bg-[#11152e]">

               {/* SCHOOL WEBSITE */}
               <button
                  type="button"
                  onClick={handleSchoolWebsite}
                  className="
        group relative overflow-hidden w-full
        flex items-center gap-3 p-3.5 mb-3
        rounded-2xl border border-cyan-300/25
        bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20
        text-white shadow-lg
        transition-all duration-300
        hover:-translate-y-1 hover:border-cyan-300/60
        hover:shadow-cyan-500/20 hover:shadow-xl
        active:scale-95
      "
               >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                  <span className="relative w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                     🌐
                  </span>

                  <span className="relative flex-1 text-left">
                     <span className="block text-sm font-extrabold tracking-wide">
                        School Website
                     </span>
                     <span className="block text-[10px] text-cyan-200 mt-1">
                        Visit official website
                     </span>
                  </span>

                  <span className="relative text-cyan-300 text-lg group-hover:translate-x-1 transition-transform">
                     ↗
                  </span>
               </button>

               {/* LOGOUT */}
               <button
                  type="button"
                  onClick={handleLogout}
                  className="
        group relative overflow-hidden w-full
        flex items-center gap-3 p-3.5
        rounded-2xl border border-rose-400/20
        bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-red-500/15
        text-rose-100
        transition-all duration-300
        hover:-translate-y-1 hover:border-rose-400/50
        hover:bg-gradient-to-r hover:from-rose-600 hover:via-pink-600 hover:to-red-600
        hover:text-white hover:shadow-xl hover:shadow-rose-950/30
        active:scale-95
      "
               >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <span className="relative w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-xl shadow-lg group-hover:rotate-[-8deg] group-hover:scale-110 transition-all duration-300">
                     🚪
                  </span>

                  <span className="relative flex-1 text-left">
                     <span className="block text-sm font-extrabold tracking-wide">
                        Logout
                     </span>
                     <span className="block text-[10px] text-rose-200 group-hover:text-white/80 mt-1">
                        Securely sign out
                     </span>
                  </span>

                  <span className="relative text-rose-300 group-hover:text-white text-lg group-hover:translate-x-1 transition-all">
                     →
                  </span>
               </button>

               <p className="text-center text-[10px] text-indigo-300/50 pt-3">
                  StudentHub • Powered by School Portal
               </p>
            </div>
         </aside>

         {/* =================================================
          MAIN CONTENT
      ================================================= */}

         <div className="relative lg:ml-[280px] min-h-screen">

            {/* TOP NAVBAR */}

            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-white shadow-sm">
               <div className="px-4 sm:px-7 lg:px-10 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden w-11 h-11 rounded-xl bg-indigo-600 text-white text-xl shadow-lg"
                     >
                        ☰
                     </button>

                     <div>
                        <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                           Student Portal
                        </p>

                        <h1 className="text-lg sm:text-2xl font-black text-slate-900">
                           My Dashboard
                        </h1>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                     <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-slate-800">
                           {studentName}
                        </p>
                        <p className="text-xs text-slate-400">{studentId}</p>
                     </div>

                     <button
                        onClick={() => fetchStudentData(true)}
                        disabled={refreshing}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition disabled:opacity-50"
                     >
                        {refreshing ? "⏳" : "↻"}
                        <span className="hidden sm:inline ml-2">Refresh</span>
                     </button>
                  </div>
               </div>
            </header>

            <main className="relative p-4 sm:p-6 lg:p-9 max-w-[1600px] mx-auto">

               {/* ERROR */}

               {error && (
                  <div className="mb-6 p-5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">
                     <p className="font-bold">Dashboard Error</p>
                     <p className="text-sm mt-1">{error}</p>

                     <button
                        onClick={() => fetchStudentData()}
                        className="mt-3 text-sm font-bold underline"
                     >
                        Try again
                     </button>
                  </div>
               )}

               {/* HERO BANNER */}

               <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#312078] via-[#5637bd] to-[#087eaa] p-6 sm:p-9 text-white shadow-2xl shadow-violet-200 mb-8">
                  <div className="absolute -right-10 -top-20 w-72 h-72 rounded-full bg-cyan-300/20 blur-2xl" />
                  <div className="absolute right-32 bottom-[-100px] w-64 h-64 rounded-full bg-pink-400/20 blur-2xl" />

                  <div className="absolute right-10 top-10 text-7xl sm:text-9xl opacity-10 animate-bounce">
                     🎓
                  </div>

                  <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                     <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-lg">
                           ✨ YOUR LEARNING SPACE
                        </span>

                        <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                           Welcome Back,
                           <span className="block text-cyan-300">
                              {studentName}! 👋
                           </span>
                        </h2>

                        <p className="mt-4 max-w-xl text-sm sm:text-base text-indigo-100 leading-7">
                           Keep learning, keep growing. Your attendance,
                           results, subjects and AI learning tools are
                           waiting for you.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-6">
                           <Link
                              to="/student/results"
                              className="px-5 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:scale-105 transition shadow-lg"
                           >
                              📝 View Results
                           </Link>

                           <Link
                              to="/student/ai-study"
                              className="px-5 py-3 rounded-xl bg-white/15 border border-white/25 text-white font-bold text-sm hover:bg-white/25 transition backdrop-blur"
                           >
                              🤖 AI Study
                           </Link>
                        </div>
                     </div>

                     <div className="relative shrink-0 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 min-w-[220px]">
                        <p className="text-xs text-indigo-100 uppercase tracking-widest font-bold">
                           Student Identity
                        </p>

                        <p className="text-2xl font-black mt-3 break-all">
                           {studentId}
                        </p>

                        <div className="h-px bg-white/20 my-4" />

                        <div className="flex justify-between text-sm">
                           <span className="text-indigo-100">Class</span>
                           <strong>{className}</strong>
                        </div>

                        <div className="flex justify-between text-sm mt-3">
                           <span className="text-indigo-100">Section</span>
                           <strong>{section}</strong>
                        </div>
                     </div>
                  </div>
               </section>

               {/* STAT CARDS */}

               <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-9">
                  <StatCard
                     icon="📊"
                     title="Attendance"
                     value={`${attendancePercentage}%`}
                     subtitle="Overall attendance"
                     gradient="from-blue-500 to-indigo-600"
                     bg="bg-blue-50"
                  />

                  <StatCard
                     icon="✅"
                     title="Present Days"
                     value={present}
                     subtitle={`Out of ${totalAttendance} days`}
                     gradient="from-emerald-400 to-teal-600"
                     bg="bg-emerald-50"
                  />

                  <StatCard
                     icon="❌"
                     title="Absent Days"
                     value={absent}
                     subtitle={`Out of ${totalAttendance} days`}
                     gradient="from-rose-400 to-pink-600"
                     bg="bg-rose-50"
                  />

                  <StatCard
                     icon="⏰"
                     title="Late Days"
                     value={late}
                     subtitle={`Out of ${totalAttendance} days`}
                     gradient="from-amber-400 to-orange-600"
                     bg="bg-amber-50"
                  />
               </section>

               {/* QUICK ACTIONS */}

               <section className="mb-9">
                  <SectionHeading
                     title="Explore Your Portal"
                     subtitle="Everything you need for your learning journey."
                     icon="🚀"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
                     <ActionCard
                        icon="📊"
                        title="My Attendance"
                        description="Check your daily attendance and track your presence."
                        to="/student/attendance"
                        gradient="from-blue-500 to-cyan-400"
                     />

                     <ActionCard
                        icon="📝"
                        title="My Results"
                        description="Explore your examination marks, grades and performance."
                        to="/student/results"
                        gradient="from-pink-500 to-rose-400"
                     />

                     <ActionCard
                        icon="📚"
                        title="My Subjects"
                        description="Explore your subjects and learning resources."
                        to="/student/subjects"
                        gradient="from-amber-500 to-orange-400"
                     />

                     <ActionCard
                        icon="🤖"
                        title="AI Study Assistant"
                        description="Ask questions and improve your understanding with AI."
                        to="/student/ai-study"
                        gradient="from-violet-600 to-fuchsia-500"
                     />

                     <ActionCard
                        icon="👤"
                        title="My Profile"
                        description="View your personal and academic information."
                        to="/student/profile"
                        gradient="from-emerald-500 to-teal-400"
                     />

                     <ActionCard
                        icon="🌐"
                        title="School Website"
                        description="Visit the official school website and announcements."
                        to="/"
                        gradient="from-indigo-500 to-blue-500"
                     />
                  </div>
               </section>

               {/* ATTENDANCE OVERVIEW */}

               <section className="rounded-[28px] bg-white border border-slate-100 shadow-xl shadow-indigo-100/40 overflow-hidden mb-9">
                  <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                        <SectionHeading
                           title="Attendance Overview"
                           subtitle="Your attendance performance at a glance."
                           icon="📈"
                        />
                     </div>

                     <Link
                        to="/student/attendance"
                        className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm text-center hover:bg-indigo-700 hover:scale-105 transition"
                     >
                        View Details →
                     </Link>
                  </div>

                  <div className="p-6 sm:p-8">
                     <div className="flex justify-between items-end mb-3">
                        <div>
                           <p className="text-sm font-bold text-slate-700">
                              Overall Attendance
                           </p>
                           <p className="text-xs text-slate-400 mt-1">
                              Based on available attendance records
                           </p>
                        </div>

                        <p className="text-3xl font-black text-indigo-600">
                           {attendancePercentage}%
                        </p>
                     </div>

                     <div className="h-5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                           className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 transition-all duration-1000 relative"
                           style={{ width: `${attendancePercentage}%` }}
                        >
                           <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <AttendanceBox
                           title="Present"
                           value={present}
                           total={totalAttendance}
                           color="emerald"
                           icon="✓"
                        />

                        <AttendanceBox
                           title="Absent"
                           value={absent}
                           total={totalAttendance}
                           color="rose"
                           icon="✕"
                        />

                        <AttendanceBox
                           title="Late"
                           value={late}
                           total={totalAttendance}
                           color="amber"
                           icon="◷"
                        />
                     </div>
                  </div>
               </section>

               {/* STUDENT INFORMATION */}

               <section className="mb-9">
                  <SectionHeading
                     title="My Information"
                     subtitle="Your academic information and personal details."
                     icon="🎓"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                     <InfoCard icon="🆔" label="Student ID" value={studentId} />
                     <InfoCard icon="🏫" label="Class" value={className} />
                     <InfoCard icon="📖" label="Section" value={section} />
                     <InfoCard icon="🔢" label="Roll Number" value={rollNumber} />
                  </div>
               </section>

               {/* PERSONAL DETAILS */}

               <section className="rounded-[28px] bg-white border border-slate-100 shadow-xl shadow-indigo-100/30 overflow-hidden mb-9">
                  <div className="p-6 border-b border-slate-100">
                     <SectionHeading
                        title="Personal Details"
                        subtitle="Your profile information saved in the school database."
                        icon="👤"
                     />
                  </div>

                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     <Detail label="Full Name" value={studentName} />
                     <Detail label="Student ID" value={studentId} />
                     <Detail label="Father's Name" value={fatherName} />
                     <Detail label="Mother's Name" value={motherName} />
                     <Detail label="Phone Number" value={phone} />
                     <Detail label="Email Address" value={email} />
                     <Detail label="Class" value={className} />
                     <Detail label="Section" value={section} />
                     <Detail label="Roll Number" value={rollNumber} />
                     <Detail label="City" value={city} />
                     <Detail label="State" value={state} />
                  </div>
               </section>

               {/* AI STUDY BANNER */}

               <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#6b21a8] via-[#9333ea] to-[#db2777] p-7 sm:p-9 text-white shadow-xl shadow-purple-200 mb-9">
                  <div className="absolute -right-10 -top-10 text-[150px] opacity-10">
                     🤖
                  </div>

                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-7">
                     <div className="max-w-xl">
                        <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold border border-white/20">
                           ✨ SMART LEARNING
                        </span>

                        <h2 className="mt-5 text-3xl font-black">
                           Meet Your AI Study Buddy!
                        </h2>

                        <p className="mt-3 text-sm sm:text-base text-purple-100 leading-7">
                           Get help with your subjects, understand difficult
                           topics and explore new ideas with your AI study
                           assistant.
                        </p>
                     </div>

                     <Link
                        to="/student/ai-study"
                        className="shrink-0 px-7 py-4 rounded-2xl bg-white text-purple-700 font-black text-center shadow-xl hover:scale-105 transition"
                     >
                        🤖 Start Learning →
                     </Link>
                  </div>
               </section>

               {/* FOOTER */}

               <footer className="py-6 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                  <p>
                     © {new Date().getFullYear()} StudentHub. All rights reserved.
                  </p>

                  <p className="font-semibold text-indigo-500">
                     Learn • Grow • Succeed ✨
                  </p>
               </footer>
            </main>
         </div>
      </div>
   );
}

// =====================================================
// SECTION HEADING
// =====================================================

function SectionHeading({ title, subtitle, icon }) {
   return (
      <div className="flex items-start gap-3">
         <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center text-xl">
            {icon}
         </div>

         <div>
            <h2 className="text-xl font-black text-slate-900">
               {title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
               {subtitle}
            </p>
         </div>
      </div>
   );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
   icon,
   title,
   value,
   subtitle,
   gradient,
   bg,
}) {
   return (
      <div className="group relative bg-white rounded-3xl p-5 border border-white shadow-lg shadow-indigo-100/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
         <div className={`absolute top-0 right-0 w-28 h-28 rounded-full ${bg} opacity-70 -translate-y-12 translate-x-10 group-hover:scale-150 transition-transform duration-500`} />

         <div className="relative flex items-center justify-between">
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

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
               {icon}
            </div>
         </div>

         <div className={`mt-5 h-1.5 rounded-full bg-gradient-to-r ${gradient} w-1/3 group-hover:w-full transition-all duration-500`} />
      </div>
   );
}

// =====================================================
// ACTION CARD
// =====================================================

function ActionCard({
   icon,
   title,
   description,
   to,
   gradient,
}) {
   return (
      <Link
         to={to}
         className="group relative overflow-hidden rounded-3xl bg-white border border-slate-100 p-6 shadow-lg shadow-indigo-100/30 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
      >
         <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] -translate-y-12 translate-x-12 group-hover:scale-[2] transition-transform duration-500`} />

         <div className="relative flex items-center justify-between">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
               {icon}
            </div>

            <span className="text-2xl text-slate-300 group-hover:text-violet-600 group-hover:translate-x-2 transition-all">
               →
            </span>
         </div>

         <h3 className="relative mt-6 text-lg font-black text-slate-900 group-hover:text-violet-700 transition-colors">
            {title}
         </h3>

         <p className="relative text-sm text-slate-500 mt-2 leading-6">
            {description}
         </p>

         <p className="relative mt-5 text-sm font-bold text-violet-600">
            Explore Now →
         </p>
      </Link>
   );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({ icon, label, value }) {
   return (
      <div className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-md shadow-indigo-100/30 hover:-translate-y-1 hover:border-violet-200 transition-all">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center text-xl group-hover:scale-110 transition">
               {icon}
            </div>

            <div className="min-w-0">
               <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {label}
               </p>
               <p className="font-black text-slate-800 mt-1 truncate">
                  {value}
               </p>
            </div>
         </div>
      </div>
   );
}

// =====================================================
// ATTENDANCE BOX
// =====================================================

function AttendanceBox({
   title,
   value,
   total,
   color,
   icon,
}) {
   const themes = {
      emerald: {
         bg: "bg-emerald-50",
         text: "text-emerald-600",
         bar: "bg-emerald-500",
      },
      rose: {
         bg: "bg-rose-50",
         text: "text-rose-600",
         bar: "bg-rose-500",
      },
      amber: {
         bg: "bg-amber-50",
         text: "text-amber-600",
         bar: "bg-amber-500",
      },
   };

   const theme = themes[color] || themes.emerald;

   const percentage =
      total > 0
         ? Math.min((value / total) * 100, 100)
         : 0;

   return (
      <div className="rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition">
         <div className="flex items-center justify-between">
            <div>
               <p className="text-sm text-slate-500 font-semibold">
                  {title}
               </p>
               <p className={`text-3xl font-black mt-2 ${theme.text}`}>
                  {value}
               </p>
            </div>

            <div className={`w-12 h-12 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center text-2xl font-black`}>
               {icon}
            </div>
         </div>

         <div className="mt-5">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
               <span>{value} of {total}</span>
               <span className="font-bold">{Math.round(percentage)}%</span>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
               <div
                  className={`h-full rounded-full ${theme.bar} transition-all duration-1000`}
                  style={{ width: `${percentage}%` }}
               />
            </div>
         </div>
      </div>
   );
}

// =====================================================
// PERSONAL DETAIL
// =====================================================

function Detail({ label, value }) {
   return (
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-100 p-4 hover:border-violet-200 transition">
         <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
         </p>

         <p className="mt-2 text-sm font-bold text-slate-800 break-words">
            {value || "Not available"}
         </p>
      </div>
   );
}
