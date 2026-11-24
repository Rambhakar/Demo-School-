import { useCallback, useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";



const API_URL = (
   import.meta.env.VITE_API_URL || "http://localhost:5000"
)
   .replace(/\/+$/, "")
   .replace(/\/api$/i, "");



const getToken = () =>

   localStorage.getItem("schoolToken") ||

   sessionStorage.getItem("schoolToken") ||

   localStorage.getItem("token") ||

   sessionStorage.getItem("token");



const getStoredUser = () => {

   const raw =

      localStorage.getItem("schoolUser") ||

      sessionStorage.getItem("schoolUser");



   try {

      return raw ? JSON.parse(raw) : null;

   } catch {

      return null;

   }

};



async function api(url, options = {}) {

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

         data.message ||

         (response.status === 401

            ? "Session expired. Please login again."

            : "Server request failed.")

      );

   }



   return data;

}



/* =====================================================

   HELPERS

\===================================================== */



const getTeacher = (profile) =>

   profile?.teacher || profile?.data?.teacher || profile?.data || profile || {};



const getTeacherPhoto = (profile, storedUser) => {

   const teacher = getTeacher(profile);



   const candidates = [

      teacher?.photo,

      teacher?.profileImage,

      teacher?.profilePhoto,

      teacher?.avatar,

      teacher?.image,

      teacher?.user?.photo,

      teacher?.user?.profileImage,

      teacher?.user?.profilePhoto,

      teacher?.user?.avatar,

      profile?.photo,

      profile?.profileImage,

      storedUser?.photo,

      storedUser?.profileImage,

      storedUser?.profilePhoto,

      storedUser?.avatar,

   ];



   return (

      candidates.find(

         (value) => typeof value === "string" && value.trim()

      ) || ""

   );

};



const getTeacherName = (profile, storedUser) => {

   const teacher = getTeacher(profile);



   return (

      teacher?.user?.name ||

      teacher?.name ||

      storedUser?.name ||

      "Teacher"

   );

};



const getTeacherId = (profile, storedUser) => {

   const teacher = getTeacher(profile);



   return (

      teacher?.teacherId ||

      teacher?.user?.userId ||

      storedUser?.userId ||

      "N/A"

   );

};



const getSubjectsFromProfile = (profile) => {

   const teacher = getTeacher(profile);



   if (Array.isArray(teacher.assignedSubjects)) {

      return teacher.assignedSubjects;

   }



   if (Array.isArray(teacher.subjects)) {

      return teacher.subjects;

   }



   return teacher.subject ? [{ name: teacher.subject }] : [];

};



const getSubjectName = (subject) =>

   subject?.name || subject?.subject || subject?.subjectName || "Subject";



const getCurrentAcademicYear = () => {

   const now = new Date();



   const year =

      now.getMonth() >= 3

         ? now.getFullYear()

         : now.getFullYear() - 1;



   return `${year}-${String(year + 1).slice(-2)}`;

};



const getTodayLabel = () =>

   new Intl.DateTimeFormat("en-IN", {

      weekday: "long",

      day: "2-digit",

      month: "long",

      year: "numeric",

   }).format(new Date());



/* =====================================================

   MAIN DASHBOARD

\===================================================== */



export default function TeacherDashboard() {

   const navigate = useNavigate();



   const storedUser = useMemo(() => getStoredUser(), []);



   const [dashboard, setDashboard] = useState(null);

   const [profile, setProfile] = useState(null);

   const [subjects, setSubjects] = useState([]);



   const [loading, setLoading] = useState(true);

   const [refreshing, setRefreshing] = useState(false);



   const [error, setError] = useState("");



   const teacherName = getTeacherName(profile, storedUser);

   const teacherId = getTeacherId(profile, storedUser);

   const teacherPhoto = getTeacherPhoto(profile, storedUser);



   /* =====================================================

      LOAD DASHBOARD

   ===================================================== */



   const loadDashboard = useCallback(async (isRefresh = false) => {

      try {

         if (isRefresh) setRefreshing(true);

         else setLoading(true);



         setError("");



         const [dashboardResult, profileResult] =

            await Promise.allSettled([

               api("/api/teacher/dashboard"),

               api("/api/teacher/profile"),

            ]);



         if (dashboardResult.status === "fulfilled") {

            setDashboard(dashboardResult.value);

         }



         if (profileResult.status === "fulfilled") {

            setProfile(profileResult.value);

         }



         if (

            dashboardResult.status === "rejected" &&

            profileResult.status === "rejected"

         ) {

            throw dashboardResult.reason || profileResult.reason;

         }

      } catch (err) {

         setError(err?.message || "Dashboard load nahi hua.");

      } finally {

         setLoading(false);

         setRefreshing(false);

      }

   }, []);



   useEffect(() => {

      loadDashboard();

   }, [loadDashboard]);



   /* =====================================================

      ASSIGNED SUBJECTS

   ===================================================== */



   useEffect(() => {

      const dashboardSubjects = Array.isArray(dashboard?.subjects)

         ? dashboard.subjects

         : [];



      const profileSubjects = getSubjectsFromProfile(profile);



      const combined = [...dashboardSubjects, ...profileSubjects];



      const unique = [];

      const seen = new Set();



      combined.forEach((subject) => {

         const key =

            subject?._id ||

            `${getSubjectName(subject)}-${subject?.className || ""}-${subject?.section || ""}`;



         if (!seen.has(key)) {

            seen.add(key);

            unique.push(subject);

         }

      });



      setSubjects(unique);

   }, [dashboard, profile]);



   /* =====================================================

      ADMIN-ASSIGNED CLASSES

      Student and attendance management live on separate pages.

   ===================================================== */



   const assignments = useMemo(() => {

      const teacher = getTeacher(profile);

      const currentYear = getCurrentAcademicYear();



      return Array.isArray(teacher.teachingAssignments)

         ? teacher.teachingAssignments.filter((item) =>

            item?.isActive !== false &&

            (!item?.academicYear || item.academicYear === currentYear) &&

            String(item?.className || "").trim()

         )

         : [];

   }, [profile]);



   const classes = useMemo(() => {

      return [

         ...new Set(

            assignments.map((item) => String(item.className).trim())

         ),

      ].sort((a, b) =>

         a.localeCompare(b, undefined, { numeric: true })

      );

   }, [assignments]);



   /* =====================================================

      LOGOUT

   ===================================================== */



   const logout = () => {

      [

         "schoolToken",

         "schoolUser",

         "token",

         "user",

      ].forEach((key) => {

         localStorage.removeItem(key);

         sessionStorage.removeItem(key);

      });



      navigate("/");

   };



   /* =====================================================

      LOADING

   ===================================================== */



   if (loading) {

      return (

         <div className="teacher-dark flex min-h-screen items-center justify-center bg-[#050510] text-white">

            <TeacherStyles />



            <div className="text-center">

               <div className="loader-ring mx-auto" />



               <h2 className="mt-6 text-2xl font-black">

                  Preparing Your Workspace

               </h2>



               <p className="mt-2 text-sm text-slate-400">

                  Teacher dashboard load ho raha hai...

               </p>

            </div>

         </div>

      );

   }



   /* =====================================================

      DASHBOARD UI

   ===================================================== */



   return (

      <div className="teacher-dark min-h-screen overflow-hidden bg-[#050510] text-white">

         <TeacherStyles />



         <div className="teacher-grid" />

         <div className="teacher-orb orb-purple" />

         <div className="teacher-orb orb-blue" />

         <div className="teacher-orb orb-pink" />



         <div className="relative flex min-h-screen">



            {/* SIDEBAR */}



            <aside className="sidebar-glass hidden w-[270px] shrink-0 flex-col border-r border-white/10 lg:flex">

               <div className="flex h-24 items-center gap-3 border-b border-white/10 px-6">

                  <div className="school-logo">🏫</div>



                  <div>

                     <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">

                        Sunrise ERP

                     </p>



                     <h2 className="text-lg font-black">

                        Teacher Portal

                     </h2>

                  </div>

               </div>



               <nav className="flex-1 space-y-2 p-4">

                  <SidebarItem

                     icon="⌂"

                     label="Dashboard"

                     active

                  />



                  <Link

                     to="/teacher/students"

                     className="sidebar-link"

                  >

                     <span>👨‍🎓</span>

                     My Students

                  </Link>



                  <Link

                     to="/teacher/attendance"

                     className="sidebar-link"

                  >

                     <span>📊</span>

                     Attendance

                  </Link>



                  <Link

                     to="/teacher/results"

                     className="sidebar-link"

                  >

                     <span>📝</span>

                     Results

                  </Link>



                  <Link

                     to="/teacher/profile"

                     className="sidebar-link"

                  >

                     <span>👤</span>

                     My Profile

                  </Link>

               </nav>



               <div className="m-4 rounded-2xl border border-white/10 bg-white/[.04] p-4">

                  <div className="flex items-center gap-3">

                     <TeacherAvatar

                        photo={teacherPhoto}

                        name={teacherName}

                        size="small"

                     />



                     <div className="min-w-0">

                        <p className="truncate text-sm font-black">

                           {teacherName}

                        </p>



                        <p className="truncate text-[10px] text-slate-400">

                           {teacherId}

                        </p>

                     </div>

                  </div>



                  <button

                     onClick={logout}

                     className="logout-button mt-4 w-full"

                  >

                     ↪ Logout

                  </button>

               </div>

            </aside>



            {/* MAIN */}



            <div className="min-w-0 flex-1">



               {/* TOP BAR */}



               <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09091b]/85 backdrop-blur-2xl">

                  <div className="flex min-h-[82px] items-center justify-between gap-3 px-4 py-3 sm:px-6 xl:px-8">

                     <div className="min-w-0">

                        <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">

                           Teacher Workspace

                        </p>



                        <h1 className="mt-1 truncate text-lg font-black sm:text-2xl">

                           Welcome back, {teacherName} ✨

                        </h1>

                     </div>



                     <div className="flex items-center gap-2 sm:gap-3">

                        <button

                           onClick={() => loadDashboard(true)}

                           disabled={refreshing}

                           title="Refresh dashboard"

                           className="refresh-button"

                        >

                           <span className={refreshing ? "refresh-spin" : ""}>

                              ↻

                           </span>

                        </button>



                        <Link

                           to="/teacher/profile"

                           className="profile-top-button"

                        >

                           My Profile

                        </Link>



                        <TeacherAvatar

                           photo={teacherPhoto}

                           name={teacherName}

                           size="small"

                           link

                        />

                     </div>

                  </div>

               </header>



               {/* MOBILE NAV */}



               <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#09091b]/70 p-3 lg:hidden">

                  <MobileNav

                     icon="⌂"

                     label="Dashboard"

                  />



                  <Link

                     to="/teacher/students"

                     className="mobile-nav-link"

                  >

                     👨‍🎓 Students

                  </Link>



                  <Link

                     to="/teacher/attendance"

                     className="mobile-nav-link"

                  >

                     📊 Attendance

                  </Link>



                  <Link

                     to="/teacher/profile"

                     className="mobile-nav-link"

                  >

                     👤 Profile

                  </Link>

               </div>



               <main className="mx-auto max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 xl:px-8">



                  {/* ERROR */}



                  {error && (

                     <Alert

                        type="error"

                        message={error}

                     />

                  )}



                  {/* HERO PROFILE */}



                  <section className="hero-profile relative overflow-hidden rounded-[30px] border border-violet-400/20 p-5 sm:p-8">

                     <div className="hero-light hero-light-one" />

                     <div className="hero-light hero-light-two" />



                     <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row">

                        <TeacherAvatar

                           photo={teacherPhoto}

                           name={teacherName}

                           size="large"

                           link

                        />



                        <div className="min-w-0 flex-1 text-center sm:text-left">

                           <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">

                              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                              Teacher Account Active

                           </div>



                           <h2 className="text-3xl font-black sm:text-4xl">

                              {teacherName}

                           </h2>



                           <p className="mt-2 text-sm text-slate-300">

                              Your classroom. Your students. Your workspace.

                           </p>



                           <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">

                              <span className="hero-chip">

                                 🪪 ID: {teacherId}

                              </span>



                              <span className="hero-chip">

                                 🏫 Sunrise Public School

                              </span>



                              <span className="hero-chip">

                                 📚 {subjects.length} Subjects

                              </span>

                           </div>



                           <Link

                              to="/teacher/profile"

                              className="student-button mt-5 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-black text-white"

                           >

                              ✏️ View / Edit My Profile

                           </Link>

                        </div>



                        <div className="hidden rounded-2xl border border-white/10 bg-black/20 p-5 text-center sm:block">

                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">

                              Today's Date

                           </p>



                           <p className="mt-2 text-lg font-black text-white">

                              {getTodayLabel().split(",")[1]}

                           </p>



                           <p className="mt-1 text-xs text-cyan-300">

                              {getTodayLabel().split(",")[0]}

                           </p>

                        </div>

                     </div>

                  </section>



                  {/* STATS */}



                  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                     <StatCard

                        icon="🎓"

                        title="Teaching Assignments"

                        value={assignments.length}

                        note="Active admin assignments"

                        gradient="purple"

                     />



                     <StatCard

                        icon="📚"

                        title="My Subjects"

                        value={subjects.length}

                        note="Your teaching subjects"

                        gradient="cyan"

                     />



                     <StatCard

                        icon="🏫"

                        title="My Classes"

                        value={classes.length}

                        note="Your assigned classes"

                        gradient="pink"

                     />



                     <StatCard

                        icon="📊"

                        title="Today's Attendance"

                        value={`${dashboard?.stats?.todayAttendance || 0}%`}

                        note="From teacher dashboard"

                        gradient="orange"

                     />

                  </section>



                  {/* SUBJECTS */}



                  <section className="glass-panel rounded-3xl p-5 sm:p-7">

                     <SectionHeading

                        eyebrow="YOUR TEACHING"

                        title="My Subjects & Classes 📚"

                        description="Admin assigned subjects and teaching information."

                     />



                     {subjects.length === 0 ? (

                        <Empty

                           icon="📚"

                           title="No subjects assigned"

                           text="Admin se subject assignment hone ke baad yahan show hoga."

                        />

                     ) : (

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                           {subjects.map((subject, index) => (

                              <div

                                 key={subject?._id || index}

                                 className="subject-card"

                                 style={{ animationDelay: `${index * 80}ms` }}

                              >

                                 <div className="flex items-center justify-between">

                                    <div className="subject-icon">

                                       {subject?.icon || "📘"}

                                    </div>



                                    {subject?.code && (

                                       <span className="subject-code">

                                          {subject.code}

                                       </span>

                                    )}

                                 </div>



                                 <h3 className="mt-5 text-xl font-black">

                                    {getSubjectName(subject)}

                                 </h3>



                                 <div className="mt-4 space-y-2 text-xs text-slate-400">

                                    <p>

                                       <b className="text-slate-200">Class:</b>{" "}

                                       {subject?.className || "Assigned class"}

                                    </p>



                                    <p>

                                       <b className="text-slate-200">Section:</b>{" "}

                                       {subject?.section || "Assigned section"}

                                    </p>



                                    <p>

                                       <b className="text-slate-200">Teacher:</b>{" "}

                                       {subject?.teacher?.name ||

                                          subject?.teacherName ||

                                          teacherName}

                                    </p>

                                 </div>

                              </div>

                           ))}

                        </div>

                     )}

                  </section>



                  {/* QUICK ACTIONS */}



                  <section>

                     <SectionHeading

                        eyebrow="WORKSPACE SHORTCUTS"

                        title="Quick Actions ⚡"

                        description="Your daily teaching tools in one place."

                     />



                     <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <ActionCard

                           icon="📊"

                           title="Mark Attendance"

                           description="Open your assigned class attendance."

                           to="/teacher/attendance"

                        />



                        <ActionCard

                           icon="👨‍🎓"

                           title="My Students"

                           description="View your assigned students."

                           to="/teacher/students"

                        />



                        <ActionCard

                           icon="📝"

                           title="Student Results"

                           description="Open your results workspace."

                           to="/teacher/results"

                        />



                        <ActionCard

                           icon="👤"

                           title="My Profile"

                           description="View your photo and profile details."

                           to="/teacher/profile"

                        />

                     </div>

                  </section>



                  {/* FOOTER */}



                  <footer className="rounded-3xl border border-white/10 bg-gradient-to-r from-violet-950/80 via-[#11112b] to-cyan-950/70 p-6">

                     <p className="text-xs font-black uppercase tracking-widest text-cyan-300">

                        Sunrise Public School

                     </p>



                     <h3 className="mt-2 text-xl font-black">

                        Teach. Inspire. Make a Difference. 🚀

                     </h3>



                     <p className="mt-2 text-sm text-slate-400">

                        Your teaching assignments and academic workspace, together in one place.

                     </p>

                  </footer>

               </main>

            </div>

         </div>

      </div>

   );

}



/* =====================================================

   TEACHER AVATAR

\===================================================== */



function TeacherAvatar({ photo, name, size = "small", link = false }) {

   const [imageError, setImageError] = useState(false);



   useEffect(() => {

      setImageError(false);

   }, [photo]);



   const dimensions =

      size === "large"

         ? "h-32 w-32 sm:h-40 sm:w-40"

         : "h-11 w-11";



   const content = (

      <div className={`teacher-avatar-wrap ${dimensions}`}>

         {photo && !imageError ? (

            <img

               src={

                  photo.startsWith("http") || photo.startsWith("data:")

                     ? photo

                     : `${API_URL}${photo.startsWith("/") ? "" : "/"}${photo}`

               }

               alt={`${name} profile`}

               onError={() => setImageError(true)}

               className="h-full w-full rounded-full object-cover"

            />

         ) : (

            <div className="avatar-fallback">

               {name?.charAt(0)?.toUpperCase() || "T"}

            </div>

         )}



         <span className="avatar-online" />

      </div>

   );



   return link ? (

      <Link to="/teacher/profile" title="Open teacher profile">

         {content}

      </Link>

   ) : (

      content

   );

}



/* =====================================================

   REUSABLE UI

\===================================================== */



function TeacherStyles() {

   return (

      <style>{`

      @import url('https\://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');



      .teacher-dark {

        font-family: Inter, sans-serif;

        isolation: isolate;

        position: relative;

      }



      .teacher-dark * { box-sizing: border-box; }



      .teacher-grid {

        position: fixed;

        inset: 0;

        z-index: -3;

        pointer-events: none;

        background-image:

          linear-gradient(rgba(139,92,246,.045) 1px, transparent 1px),

          linear-gradient(90deg,rgba(139,92,246,.045) 1px, transparent 1px);

        background-size: 44px 44px;

        mask-image: linear-gradient(to bottom,black,transparent 95%);

      }



      .teacher-orb {

        position: fixed;

        z-index: -2;

        width: 350px;

        height: 350px;

        border-radius: 50%;

        filter: blur(110px);

        opacity: .2;

        pointer-events: none;

        animation: orbFloat 13s ease-in-out infinite alternate;

      }



      .orb-purple { top:-170px; left:-130px; background:#7c3aed; }

      .orb-blue { top:35%; right:-170px; background:#0891b2; animation-delay:-4s; }

      .orb-pink { bottom:-200px; left:35%; background:#db2777; animation-delay:-7s; }



      @keyframes orbFloat {

        from { transform:translate(0,0) scale(1); }

        to { transform:translate(55px,45px) scale(1.18); }

      }



      @keyframes dashboardEnter {

        from { opacity:0; transform:translateY(22px); }

        to { opacity:1; transform:translateY(0); }

      }



      @keyframes avatarPulse {

        0%,100% { box-shadow:0 0 0 5px rgba(139,92,246,.14),0 0 25px rgba(34,211,238,.15); }

        50% { box-shadow:0 0 0 8px rgba(34,211,238,.12),0 0 40px rgba(139,92,246,.3); }

      }



      @keyframes ringSpin { to { transform:rotate(360deg); } }

      @keyframes refreshSpin { to { transform:rotate(360deg); } }



      .teacher-dark main > section,

      .teacher-dark main > footer {

        animation:dashboardEnter .65s ease both;

      }



      .sidebar-glass {

        background:rgba(7,7,22,.96);

        backdrop-filter:blur(22px);

      }



      .school-logo {

        display:flex;

        width:44px;

        height:44px;

        align-items:center;

        justify-content:center;

        border-radius:15px;

        background:linear-gradient(135deg,#7c3aed,#0891b2);

        font-size:22px;

        box-shadow:0 8px 25px rgba(124,58,237,.3);

      }



      .sidebar-link {

        display:flex;

        align-items:center;

        gap:13px;

        border-radius:14px;

        padding:13px 15px;

        color:#cbd5e1;

        font-size:13px;

        font-weight:800;

        transition:.25s;

      }



      .sidebar-link:hover {

        background:rgba(139,92,246,.16);

        color:white;

        transform:translateX(4px);

      }



      .sidebar-link span { font-size:19px; }



      .logout-button {

        border:1px solid rgba(248,113,113,.2);

        border-radius:12px;

        background:rgba(239,68,68,.1);

        padding:11px;

        color:#fca5a5;

        font-size:12px;

        font-weight:900;

        transition:.25s;

      }



      .logout-button:hover { background:rgba(239,68,68,.22); }



      .refresh-button {

        display:flex;

        width:43px;

        height:43px;

        align-items:center;

        justify-content:center;

        border:1px solid rgba(34,211,238,.25);

        border-radius:14px;

        background:rgba(34,211,238,.08);

        color:#67e8f9;

        font-size:27px;

        transition:.25s;

      }



      .refresh-button:hover {

        background:rgba(34,211,238,.2);

        transform:rotate(-20deg);

      }



      .refresh-spin { display:inline-block; animation:refreshSpin .7s linear infinite; }



      .profile-top-button {

        border-radius:12px;

        background:linear-gradient(120deg,#6d28d9,#0891b2);

        padding:12px 16px;

        color:white;

        font-size:12px;

        font-weight:900;

        transition:.25s;

      }



      .profile-top-button:hover { transform:translateY(-2px); box-shadow:0 10px 25px #6d28d955; }



      .teacher-avatar-wrap {

        position:relative;

        display:flex;

        flex-shrink:0;

        align-items:center;

        justify-content:center;

        border:3px solid rgba(103,232,249,.8);

        border-radius:50%;

        background:linear-gradient(135deg,#7c3aed,#0891b2,#db2777);

        padding:4px;

        animation:avatarPulse 3s ease-in-out infinite;

      }



      .avatar-fallback {

        display:flex;

        width:100%;

        height:100%;

        align-items:center;

        justify-content:center;

        border-radius:50%;

        background:linear-gradient(135deg,#7c3aed,#0891b2);

        color:white;

        font-size:42px;

        font-weight:900;

      }



      .teacher-avatar-wrap img { border:2px solid #101024; }



      .avatar-online {

        position:absolute;

        right:7px;

        bottom:8px;

        height:13px;

        width:13px;

        border:3px solid #101024;

        border-radius:50%;

        background:#34d399;

      }



      .hero-profile {

        background:

          radial-gradient(circle at 90% 20%,rgba(6,182,212,.16),transparent 30%),

          radial-gradient(circle at 10% 90%,rgba(139,92,246,.25),transparent 40%),

          linear-gradient(125deg,#11112c,#0b1024 60%,#10102b);

        box-shadow:0 25px 80px rgba(0,0,0,.25);

      }



      .hero-light {

        position:absolute;

        width:230px;

        height:230px;

        border-radius:50%;

        filter:blur(75px);

        opacity:.3;

        animation:orbFloat 9s ease-in-out infinite alternate;

      }



      .hero-light-one { top:-130px; right:5%; background:#8b5cf6; }

      .hero-light-two { bottom:-150px; left:40%; background:#06b6d4; }



      .hero-chip {

        border:1px solid rgba(255,255,255,.12);

        border-radius:999px;

        background:rgba(255,255,255,.06);

        padding:8px 12px;

        color:#dbeafe;

        font-size:10px;

        font-weight:800;

      }



      .glass-panel {

        border:1px solid rgba(148,163,184,.14);

        background:linear-gradient(145deg,rgba(20,20,43,.96),rgba(8,8,24,.97));

        box-shadow:0 20px 60px rgba(0,0,0,.2);

        backdrop-filter:blur(18px);

      }



      .stat-card {

        position:relative;

        overflow:hidden;

        border:1px solid rgba(255,255,255,.1);

        border-radius:23px;

        background:linear-gradient(145deg,rgba(23,23,48,.96),rgba(10,10,27,.98));

        padding:22px;

        transition:.35s ease;

        animation:dashboardEnter .7s ease both;

      }



      .stat-card:hover {

        transform:translateY(-7px);

        border-color:rgba(103,232,249,.4);

        box-shadow:0 18px 45px rgba(0,0,0,.3);

      }



      .stat-glow {

        position:absolute;

        top:-55px;

        right:-55px;

        width:140px;

        height:140px;

        border-radius:50%;

        filter:blur(45px);

        opacity:.35;

      }



      .stat-icon {

        display:flex;

        width:53px;

        height:53px;

        align-items:center;

        justify-content:center;

        border-radius:17px;

        font-size:25px;

      }



      .stat-purple .stat-icon { background:rgba(139,92,246,.18); }

      .stat-cyan .stat-icon { background:rgba(6,182,212,.17); }

      .stat-pink .stat-icon { background:rgba(236,72,153,.16); }

      .stat-orange .stat-icon { background:rgba(249,115,22,.16); }



      .subject-card {

        position:relative;

        overflow:hidden;

        border:1px solid rgba(139,92,246,.2);

        border-radius:22px;

        background:linear-gradient(145deg,rgba(139,92,246,.11),rgba(6,182,212,.04));

        padding:22px;

        animation:dashboardEnter .6s ease both;

        transition:.3s ease;

      }



      .subject-card:hover {

        transform:translateY(-6px);

        border-color:rgba(103,232,249,.45);

        box-shadow:0 20px 40px rgba(0,0,0,.2);

      }



      .subject-icon {

        display:flex;

        width:49px;

        height:49px;

        align-items:center;

        justify-content:center;

        border-radius:15px;

        background:rgba(139,92,246,.2);

        font-size:24px;

      }



      .subject-code {

        border:1px solid rgba(255,255,255,.1);

        border-radius:99px;

        background:rgba(255,255,255,.06);

        padding:7px 12px;

        color:#c4b5fd;

        font-size:10px;

        font-weight:900;

      }



      .dark-input {

        width:100%;

        border:1px solid rgba(148,163,184,.2);

        border-radius:13px;

        background:rgba(3,7,18,.8);

        padding:12px 14px;

        color:white;

        outline:none;

        transition:.25s;

        font-size:13px;

      }



      .dark-input::placeholder { color:#64748b; }

      .dark-input:focus {

        border-color:#8b5cf6;

        box-shadow:0 0 0 3px rgba(139,92,246,.15);

      }

      .dark-input option { background:#101024; color:white; }



      .table-head { background:rgba(255,255,255,.045); }

      .table-head th {

        padding:16px 20px;

        color:#94a3b8;

        font-size:10px;

        font-weight:900;

        text-align:left;

        text-transform:uppercase;

        letter-spacing:.1em;

      }



      .table-row {

        border-top:1px solid rgba(255,255,255,.07);

        transition:.2s;

      }

      .table-row:hover { background:rgba(139,92,246,.07); }



      .table-row td { white-space:nowrap; }



      .student-button {

        transition:transform .2s ease,filter .2s ease,box-shadow .2s ease;

      }

      .student-button:hover {

        transform:translateY(-2px);

        filter:brightness(1.12);

        box-shadow:0 10px 25px rgba(124,58,237,.2);

      }



      .attendance-action {

        border-radius:11px;

        padding:10px 13px;

        font-size:11px;

        font-weight:900;

        transition:.2s;

      }

      .attendance-action:hover { transform:translateY(-2px); filter:brightness(1.15); }

      .attendance-action.green { background:#065f46; color:#a7f3d0; }

      .attendance-action.red { background:#7f1d1d; color:#fecaca; }

      .attendance-action.orange { background:#78350f; color:#fed7aa; }

      .attendance-action.purple { background:linear-gradient(110deg,#6d28d9,#0891b2); color:white; }



      .mini-stat {

        border:1px solid rgba(255,255,255,.1);

        border-radius:16px;

        padding:15px;

        background:rgba(255,255,255,.035);

      }



      .mini-stat.green { border-color:rgba(16,185,129,.2); }

      .mini-stat.red { border-color:rgba(239,68,68,.2); }

      .mini-stat.orange { border-color:rgba(249,115,22,.2); }

      .mini-stat.purple { border-color:rgba(139,92,246,.2); }



      .status-button {

        border:1px solid rgba(255,255,255,.13);

        border-radius:9px;

        padding:8px 10px;

        font-size:10px;

        font-weight:900;

        transition:.2s;

      }

      .status-button:hover { transform:translateY(-2px); }

      .status-button.present { color:#6ee7b7; background:rgba(16,185,129,.1); }

      .status-button.absent { color:#fca5a5; background:rgba(239,68,68,.1); }

      .status-button.late { color:#fdba74; background:rgba(249,115,22,.1); }

      .status-button.active.present { background:#059669; color:white; }

      .status-button.active.absent { background:#dc2626; color:white; }

      .status-button.active.late { background:#ea580c; color:white; }



      .sidebar-link, .mobile-nav-link { white-space:nowrap; }



      .mobile-nav-link {

        border-radius:11px;

        background:rgba(139,92,246,.15);

        padding:10px 13px;

        color:#ddd6fe;

        font-size:11px;

        font-weight:900;

      }



      .loader-ring {

        width:68px;

        height:68px;

        border:5px solid rgba(139,92,246,.2);

        border-top-color:#22d3ee;

        border-right-color:#a78bfa;

        border-radius:50%;

        animation:ringSpin .85s linear infinite;

      }



      @media (prefers-reduced-motion: reduce) {

        *,*::before,*::after {

          animation-duration:.01ms !important;

          animation-iteration-count:1 !important;

          transition-duration:.01ms !important;

        }

      }

    `}</style>

   );

}



function SidebarItem({ icon, label, active, onClick }) {

   return (

      <button

         type="button"

         onClick={onClick}

         className={`sidebar-link w-full text-left ${active ? "bg-violet-500/20 text-white" : ""

            }`}

      >

         <span>{icon}</span>

         {label}

      </button>

   );

}



function MobileNav({ icon, label, onClick }) {

   return (

      <button

         onClick={onClick}

         className="mobile-nav-link"

      >

         {icon} {label}

      </button>

   );

}



function SectionHeading({ eyebrow, title, description }) {

   return (

      <div>

         <p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">

            {eyebrow}

         </p>



         <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">

            {title}

         </h2>



         <p className="mt-2 text-xs leading-5 text-slate-400">

            {description}

         </p>

      </div>

   );

}



function StatCard({ icon, title, value, note, gradient }) {

   return (

      <div className={`stat-card stat-${gradient}`}>

         <div

            className="stat-glow"

            style={{

               background:

                  gradient === "purple" ? "#8b5cf6" :

                     gradient === "cyan" ? "#06b6d4" :

                        gradient === "pink" ? "#ec4899" : "#f97316",

            }}

         />



         <div className="relative z-10 flex items-start justify-between gap-3">

            <div>

               <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">

                  {title}

               </p>



               <p className="mt-3 text-4xl font-black text-white">

                  {value}

               </p>



               <p className="mt-2 text-[10px] font-semibold text-slate-500">

                  {note}

               </p>

            </div>



            <div className="stat-icon">

               {icon}

            </div>

         </div>

      </div>

   );

}



function ActionCard({ icon, title, description, onClick, to }) {

   const content = (

      <>

         <div className="text-3xl">{icon}</div>



         <h3 className="mt-4 font-black text-white">

            {title}

         </h3>



         <p className="mt-2 text-xs leading-5 text-slate-400">

            {description}

         </p>



         <p className="mt-4 text-xs font-black text-cyan-300">

            Open workspace →

         </p>

      </>

   );



   const className =

      "student-button block rounded-2xl border border-white/10 bg-white/[.035] p-5 text-left transition hover:border-violet-400/40 hover:bg-violet-500/10";



   return to ? (

      <Link to={to} className={className}>

         {content}

      </Link>

   ) : (

      <button onClick={onClick} className={className}>

         {content}

      </button>

   );

}



function Empty({ icon, title, text }) {

   return (

      <div className="p-12 text-center">

         <div className="text-5xl">{icon}</div>



         <h3 className="mt-4 text-lg font-black text-white">

            {title}

         </h3>



         <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">

            {text}

         </p>

      </div>

   );

}



function Alert({ type, message }) {

   const success = type === "success";



   return (

      <div

         className={`rounded-2xl border p-4 text-sm font-bold ${success

            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"

            : "border-red-400/20 bg-red-400/10 text-red-200"

            }`}

      >

         {success ? "✓ " : "⚠️ "}

         {message}

      </div>

   );

}
