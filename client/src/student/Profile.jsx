

import { useEffect, useState } from "react";

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



export default function Profile() {

   const navigate = useNavigate();

   const storedUser = getStoredUser();



   const [student, setStudent] = useState(null);

   const [loading, setLoading] = useState(true);

   const [error, setError] = useState("");

   const [refreshing, setRefreshing] = useState(false);



   const loadProfile = async () => {

      try {

         setError("");



         const token = getToken();



         if (!token) {

            navigate("/login");

            return;

         }



         const response = await fetch(

            `${API_URL}/api/student/profile`,

            {

               method: "GET",

               headers: {

                  Authorization: `Bearer ${token}`,

                  "Content-Type": "application/json",

               },

            }

         );



         const data = await response.json().catch(() => ({}));



         if (response.status === 401 || response.status === 403) {

            [

               "schoolToken",

               "schoolUser",

               "token",

               "user",

            ].forEach((key) => {

               localStorage.removeItem(key);

               sessionStorage.removeItem(key);

            });



            navigate("/login");

            return;

         }



         if (!response.ok || data.success === false) {

            throw new Error(

               data.message || "Student profile load nahi hui."

            );

         }



         const studentData =

            data.student || data.data || data.profile;



         if (!studentData) {

            throw new Error("Student data database me nahi mila.");

         }



         setStudent(studentData);

      } catch (err) {

         console.error("Student Profile Error:", err);

         setError(err.message || "Profile load nahi hui.");

      } finally {

         setLoading(false);

         setRefreshing(false);

      }

   };



   useEffect(() => {

      loadProfile();

   }, []);



   const handleLogout = () => {

      const confirmLogout = window.confirm(

         "Kya aap logout karna chahte hain?"

      );



      if (!confirmLogout) return;



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



   if (loading) {

      return (

         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">

            <div className="text-center animate-pulse">

               <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center text-4xl mx-auto">

                  🎓

               </div>

               <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mt-6" />

               <p className="font-bold text-slate-600 mt-4">

                  Loading Student Profile...

               </p>

            </div>

         </div>

      );

   }



   if (!student) {

      return (

         <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center animate-fade-up">

               <div className="text-5xl">⚠️</div>

               <h2 className="text-2xl font-black text-slate-900 mt-5">

                  Profile Not Found

               </h2>

               <p className="text-slate-500 mt-3">

                  {error || "Student profile database me nahi mili."}

               </p>



               <button

                  onClick={() => {

                     setLoading(true);

                     loadProfile();

                  }}

                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"

               >

                  Try Again

               </button>



               <Link

                  to="/student/dashboard"

                  className="block mt-4 text-blue-600 font-semibold"

               >

                  ← Back to Dashboard

               </Link>

            </div>

         </div>

      );

   }



   const studentName =

      student.name ||

      student.user?.name ||

      storedUser?.name ||

      "Student";



   const studentId =

      student.studentId ||

      student.user?.userId ||

      storedUser?.userId ||

      "N/A";



   const className = student.className || "N/A";

   const section = student.section || "N/A";

   const rollNumber = student.rollNumber || "N/A";

   const email = student.email || "Not available";

   const phone = student.phone || "Not available";

   const fatherName = student.fatherName || "Not available";

   const motherName = student.motherName || "Not available";

   const gender = student.gender || "Not available";

   const dob = formatDate(student.dob);

   const address = student.address || "Not available";

   const city = student.city || "Not available";

   const state = student.state || "Not available";

   const isActive = student.isActive !== false;



   const initial = studentName.charAt(0).toUpperCase();



   return (

      <div className="min-h-screen bg-[#f5f7ff] overflow-hidden">



         <style>{`

        @keyframes fadeUp {

          from { opacity: 0; transform: translateY(25px); }

          to { opacity: 1; transform: translateY(0); }

        }

        @keyframes float {

          0%, 100% { transform: translateY(0); }

          50% { transform: translateY(-9px); }

        }

        @keyframes shine {

          from { transform: translateX(-120%); }

          to { transform: translateX(120%); }

        }

        .animate-fade-up {

          animation: fadeUp .65s ease both;

        }

        .animate-float {

          animation: float 4s ease-in-out infinite;

        }

        .profile-card {

          animation: fadeUp .7s ease both;

        }

        .profile-card:nth-child(2) { animation-delay: .1s; }

        .profile-card:nth-child(3) { animation-delay: .2s; }

        .profile-card:nth-child(4) { animation-delay: .3s; }

        .shine-effect { position: relative; overflow: hidden; }

        .shine-effect::after {

          content: "";

          position: absolute;

          top: 0;

          left: 0;

          width: 45%;

          height: 100%;

          background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);

          transform: translateX(-120%);

          transition: transform .8s ease;

        }

        .shine-effect:hover::after { transform: translateX(250%); }

        @media (prefers-reduced-motion: reduce) {

          .animate-fade-up, .animate-float, .profile-card {

            animation: none !important;

          }

        }

      `}</style>



         {/* TOP HEADER */}

         <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">



               <div className="flex items-center gap-3 min-w-0">

                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200 shrink-0">

                     🎓

                  </div>



                  <div className="min-w-0">

                     <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">

                        Student Portal

                     </p>

                     <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">

                        My Profile

                     </h1>

                  </div>

               </div>



               <div className="flex items-center gap-2">

                  <button

                     onClick={() => {

                        setRefreshing(true);

                        loadProfile();

                     }}

                     disabled={refreshing}

                     className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 transition disabled:opacity-50"

                     title="Refresh profile"

                  >

                     {refreshing ? "⏳" : "↻"}

                  </button>



                  <Link

                     to="/student/dashboard"

                     className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition"

                  >

                     ← Dashboard

                  </Link>



                  <button

                     onClick={handleLogout}

                     className="px-3 sm:px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition"

                  >

                     Logout

                  </button>

               </div>

            </div>

         </header>



         <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-10">



            {error && (

               <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">

                  <p className="font-bold">Profile Error</p>

                  <p className="text-sm mt-1">{error}</p>

               </div>

            )}



            {/* HERO PROFILE CARD */}

            <section className="profile-card relative overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white shadow-2xl shadow-indigo-200 mb-8">



               <div className="profile-glow absolute -top-28 -right-20 w-80 h-80 rounded-full bg-cyan-300/15 blur-sm" />

               <div className="profile-glow absolute -bottom-40 right-1/3 w-80 h-80 rounded-full bg-fuchsia-300/15 blur-sm" />

               <div className="absolute top-10 right-10 text-7xl opacity-10 animate-float">

                  🎓

               </div>



               <div className="relative p-6 sm:p-9 lg:p-11">



                  <div className="flex flex-col md:flex-row md:items-center gap-6">



                     <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-[30px] bg-white/15 border border-white/30 backdrop-blur-xl flex items-center justify-center text-5xl sm:text-6xl font-black shadow-xl shrink-0 animate-float">

                        {initial}

                        <span className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-indigo-700 ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />

                     </div>



                     <div className="flex-1 min-w-0">

                        <p className="text-sm text-blue-100 font-bold uppercase tracking-widest">

                           Welcome to Your Profile

                        </p>



                        <h2 className="text-3xl sm:text-4xl font-black mt-2 break-words">

                           {studentName}

                        </h2>



                        <p className="text-blue-100 mt-2">

                           Student ID: {studentId}

                        </p>



                        <div className="flex flex-wrap gap-2 mt-5">

                           <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-bold">

                              🎓 Class {className}

                           </span>



                           <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-bold">

                              🏫 Section {section}

                           </span>



                           <span className="px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-bold">

                              🔢 Roll No. {rollNumber}

                           </span>

                        </div>

                     </div>



                     <div className="bg-white/15 border border-white/20 backdrop-blur-xl rounded-2xl p-5 min-w-36">

                        <p className="text-xs text-blue-100 font-bold uppercase">

                           Account Status

                        </p>

                        <p className="text-2xl font-black mt-2">

                           {isActive ? "Active ✓" : "Inactive"}

                        </p>

                        <p className="text-xs text-blue-100 mt-1">

                           Student Account

                        </p>

                     </div>



                  </div>

               </div>

            </section>



            {/* QUICK STATS */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">



               <StatCard

                  icon="🎓"

                  title="Class"

                  value={className}

                  color="blue"

               />



               <StatCard

                  icon="🏫"

                  title="Section"

                  value={section}

                  color="purple"

               />



               <StatCard

                  icon="🔢"

                  title="Roll Number"

                  value={rollNumber}

                  color="emerald"

               />



               <StatCard

                  icon="🪪"

                  title="Student ID"

                  value={studentId}

                  color="orange"

               />



            </div>



            {/* PERSONAL INFORMATION */}

            <Section

               icon="👤"

               title="Personal Information"

               description="Your personal details available in school records."

            >

               <InfoItem label="Full Name" value={studentName} icon="👤" />

               <InfoItem label="Date of Birth" value={dob} icon="🎂" />

               <InfoItem label="Gender" value={gender} icon="⚧️" />

               <InfoItem label="Father's Name" value={fatherName} icon="👨" />

               <InfoItem label="Mother's Name" value={motherName} icon="👩" />

               <InfoItem label="Student ID" value={studentId} icon="🪪" />

            </Section>



            {/* CONTACT INFORMATION */}

            <Section

               icon="📞"

               title="Contact Information"

               description="Your registered contact and address details."

            >

               <InfoItem label="Email Address" value={email} icon="✉️" />

               <InfoItem label="Phone Number" value={phone} icon="📱" />

               <InfoItem label="Address" value={address} icon="📍" />

               <InfoItem label="City" value={city} icon="🌆" />

               <InfoItem label="State" value={state} icon="🗺️" />

            </Section>



            {/* ACADEMIC INFORMATION */}

            <Section

               icon="📚"

               title="Academic Information"

               description="Your current academic details."

            >

               <AcademicCard

                  label="Current Class"

                  value={className}

                  icon="🎓"

                  color="blue"

               />



               <AcademicCard

                  label="Section"

                  value={section}

                  icon="🏫"

                  color="purple"

               />



               <AcademicCard

                  label="Roll Number"

                  value={rollNumber}

                  icon="🔢"

                  color="emerald"

               />



               <AcademicCard

                  label="Student ID"

                  value={studentId}

                  icon="🪪"

                  color="orange"

               />

            </Section>



            {/* STUDENT SERVICES */}

            <section className="mb-8 profile-card">

               <div className="mb-5">

                  <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">

                     Explore Your Portal

                  </p>

                  <h2 className="text-2xl font-black text-slate-900 mt-1">

                     Student Services

                  </h2>

                  <p className="text-sm text-slate-500 mt-1">

                     Quickly access your student dashboard features.

                  </p>

               </div>



               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">



                  <ServiceCard

                     icon="📊"

                     title="Attendance"

                     description="Check your attendance record."

                     to="/student/attendance"

                     color="blue"

                  />



                  <ServiceCard

                     icon="📝"

                     title="Results"

                     description="View your examination results."

                     to="/student/results"

                     color="purple"

                  />



                  <ServiceCard

                     icon="📚"

                     title="Subjects"

                     description="Explore your assigned subjects."

                     to="/student/subjects"

                     color="emerald"

                  />



                  <ServiceCard

                     icon="🤖"

                     title="AI Study"

                     description="Get help with your studies."

                     to="/student/ai-study"

                     color="orange"

                  />



               </div>

            </section>



            {/* ACCOUNT SECURITY */}

            <section className="profile-card bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-8">



               <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">

                     🔐

                  </div>



                  <div>

                     <h2 className="text-xl font-black text-slate-900">

                        Account Security

                     </h2>

                     <p className="text-sm text-slate-500 mt-1">

                        Your login account information.

                     </p>

                  </div>

               </div>



               <div className="p-6 sm:p-7">



                  <div className="max-w-xl">

                     <label className="block text-sm font-bold text-slate-700 mb-2">

                        Login ID

                     </label>



                     <div className="flex">

                        <input

                           type="text"

                           value={studentId}

                           readOnly

                           className="flex-1 min-w-0 px-4 py-3 rounded-l-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"

                        />



                        <span className="px-4 py-3 rounded-r-xl bg-slate-100 border border-l-0 border-slate-200 text-slate-500 text-sm font-bold">

                           ID

                        </span>

                     </div>

                  </div>



                  <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-5">

                     <div className="flex items-start gap-3">

                        <span className="text-2xl">🛡️</span>

                        <div>

                           <p className="font-bold text-emerald-800">

                              Your Password is Protected

                           </p>

                           <p className="text-sm text-emerald-700 mt-1 leading-6">

                              Your actual password is never displayed on this page.

                              It should be stored securely in hashed form in the database.

                           </p>

                        </div>

                     </div>

                  </div>



               </div>

            </section>



            {/* BOTTOM ACTIONS */}

            <section className="profile-card rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">



               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">



                  <div>

                     <p className="text-blue-300 font-bold text-sm uppercase tracking-wider">

                        Student Portal

                     </p>

                     <h2 className="text-2xl sm:text-3xl font-black mt-2">

                        Keep Learning, Keep Growing 🚀

                     </h2>

                     <p className="text-slate-300 text-sm mt-2">

                        Your academic journey is just getting started.

                     </p>

                  </div>



                  <div className="flex flex-wrap gap-3">



                     <Link

                        to="/student/dashboard"

                        className="shine-effect px-5 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition text-center"

                     >

                        🏠 Dashboard

                     </Link>



                     <Link

                        to="/"

                        className="shine-effect px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition text-center"

                     >

                        🌐 School Website

                     </Link>



                     <button

                        onClick={handleLogout}

                        className="px-5 py-3 rounded-xl bg-red-500/20 border border-red-300/20 text-red-200 font-bold hover:bg-red-500/30 transition"

                     >

                        🚪 Logout

                     </button>



                  </div>

               </div>

            </section>



            <footer className="text-center py-8 text-sm text-slate-400">

               © {new Date().getFullYear()} Student Portal. All rights reserved.

            </footer>



         </main>

      </div>

   );

}



// STAT CARD

function StatCard({ icon, title, value, color }) {

   const colors = {

      blue: "bg-blue-100 text-blue-700",

      purple: "bg-purple-100 text-purple-700",

      emerald: "bg-emerald-100 text-emerald-700",

      orange: "bg-orange-100 text-orange-700",

   };



   return (

      <div className="profile-card bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">

         <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>

            {icon}

         </div>

         <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-4">

            {title}

         </p>

         <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1 break-words">

            {value || "N/A"}

         </p>

      </div>

   );

}



// SECTION

function Section({ icon, title, description, children }) {

   return (

      <section className="profile-card bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-8">



         <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">

               {icon}

            </div>



            <div>

               <h2 className="text-xl font-black text-slate-900">

                  {title}

               </h2>

               <p className="text-sm text-slate-500 mt-1">

                  {description}

               </p>

            </div>

         </div>



         <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {children}

         </div>



      </section>

   );

}



// INFO ITEM

function InfoItem({ icon, label, value }) {

   return (

      <div className="group flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/60 transition duration-300">

         <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition">

            {icon}

         </div>



         <div className="min-w-0">

            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

               {label}

            </p>

            <p className="text-sm font-bold text-slate-800 mt-2 break-words">

               {value || "Not available"}

            </p>

         </div>

      </div>

   );

}



// ACADEMIC CARD

function AcademicCard({ label, value, icon, color }) {

   const colors = {

      blue: "from-blue-500 to-indigo-600",

      purple: "from-purple-500 to-pink-600",

      emerald: "from-emerald-500 to-teal-600",

      orange: "from-orange-500 to-amber-600",

   };



   return (

      <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} p-5 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl transition duration-300`}>

         <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition duration-500" />



         <div className="relative">

            <div className="text-3xl">{icon}</div>

            <p className="text-sm text-white/75 font-semibold mt-5">

               {label}

            </p>

            <p className="text-2xl font-black mt-1 break-words">

               {value || "N/A"}

            </p>

         </div>

      </div>

   );

}



// SERVICE CARD

function ServiceCard({

   icon,

   title,

   description,

   to,

   color,

}) {

   const colors = {

      blue: "bg-blue-100 text-blue-700",

      purple: "bg-purple-100 text-purple-700",

      emerald: "bg-emerald-100 text-emerald-700",

      orange: "bg-orange-100 text-orange-700",

   };



   return (

      <Link

         to={to}

         className="group profile-card bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-blue-200 transition duration-300"

      >

         <div className="flex items-center justify-between">

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${colors[color]} group-hover:scale-110 transition duration-300`}>

               {icon}

            </div>



            <span className="text-2xl text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition">

               →

            </span>

         </div>



         <h3 className="text-lg font-black text-slate-900 mt-5 group-hover:text-blue-700 transition">

            {title}

         </h3>



         <p className="text-sm text-slate-500 mt-2 leading-6">

            {description}

         </p>



         <p className="text-xs text-blue-600 font-bold mt-5">

            Open Service →

         </p>

      </Link>

   );

}



// DATE FORMAT

function formatDate(value) {

   if (!value) return "Not available";



   const date = new Date(value);



   if (Number.isNaN(date.getTime())) {

      return "Not available";

   }



   return date.toLocaleDateString("en-IN", {

      day: "2-digit",

      month: "long",

      year: "numeric",

   });

}
