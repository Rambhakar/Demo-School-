
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
   School,
   Menu,
   X,
   UserRound,
   GraduationCap,
   Users,
   ShieldCheck,
   BookOpen,
   Sparkles,
   ArrowRight,
   ChevronDown,
   LockKeyhole,
   Eye,
   EyeOff,
   AlertCircle,
   LoaderCircle,
   House,
   BookMarked,
   ClipboardList,
   Image,
   Phone,
   Bell,
   Brain,
} from "lucide-react";

const API_URL =
   import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================================
   NAVIGATION LINKS
========================================= */

const navigation = [
   { label: "Home", path: "/", icon: House },
   { label: "About", path: "/about", icon: School },
   { label: "Academics", path: "/academics", icon: BookOpen },
   { label: "Admissions", path: "/admissions", icon: ClipboardList },
   { label: "Teacher", path: "/teachers", icon: GraduationCap },
   { label: "Notices", path: "/notices", icon: Bell },
   { label: "Gallery", path: "/gallery", icon: Image },
   { label: "Contact", path: "/contact", icon: Phone },
];

/* =========================================
   MAIN NAVBAR
========================================= */

export default function Navbar() {
   const [mobileMenu, setMobileMenu] = useState(false);
   const [loginOpen, setLoginOpen] = useState(false);
   const location = useLocation();

   useEffect(() => {
      setMobileMenu(false);
   }, [location.pathname]);

   useEffect(() => {
      document.body.style.overflow = loginOpen ? "hidden" : "";

      return () => {
         document.body.style.overflow = "";
      };
   }, [loginOpen]);

   return (
      <>
         <header className="sticky top-0 z-50 border-b border-[#d7b98b]/15 bg-[#1d1813]/95 shadow-xl shadow-black/20 backdrop-blur-xl">

            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

               {/* LOGO */}
               <Link
                  to="/"
                  onClick={() => setMobileMenu(false)}
                  className="group flex shrink-0 items-center gap-3"
               >
                  <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#e6c99e] to-[#a77e4d] text-[#2b2118] shadow-lg shadow-[#b18c5d]/20 transition duration-500 group-hover:rotate-6 group-hover:scale-110 sm:h-12 sm:w-12">
                     <School size={26} strokeWidth={1.8} />
                     <div className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />
                  </div>

                  <div>
                     <h1 className="text-sm font-black tracking-tight text-[#fff4e3] sm:text-lg">
                        Sunrise Public School
                     </h1>

                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c2a47c] sm:text-[10px]">
                        Learn • Grow • Succeed
                     </p>
                  </div>
               </Link>

               {/* DESKTOP NAVIGATION */}
               <nav className="hidden items-center gap-4 xl:flex">
                  {navigation.map((item) => {
                     const active =
                        location.pathname === item.path ||
                        (item.path !== "/" &&
                           location.pathname.startsWith(item.path + "/"));

                     return (
                        <Link
                           key={item.path}
                           to={item.path}
                           className={`group relative whitespace-nowrap py-3 text-xs font-semibold transition duration-300 ${active
                                 ? "text-[#e5c493]"
                                 : "text-[#c6b8a5] hover:text-[#e5c493]"
                              }`}
                        >
                           {item.label}

                           <span
                              className={`absolute bottom-1 left-0 h-[2px] rounded-full bg-[#d4b486] transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"
                                 }`}
                           />
                        </Link>
                     );
                  })}
               </nav>

               {/* DESKTOP ACTIONS */}
               <div className="hidden shrink-0 items-center gap-2 lg:flex">
                  <Link
                     to="/student-ai"
                     className="group inline-flex items-center gap-2 rounded-xl border border-[#d7b98b]/25 bg-[#d7b98b]/10 px-3 py-3 text-xs font-bold text-[#e7c99a] transition duration-300 hover:-translate-y-1 hover:border-[#d7b98b]/50 hover:bg-[#d7b98b]/15"
                  >
                     <Brain size={16} />
                     AI Study
                     <Sparkles
                        size={13}
                        className="transition group-hover:rotate-12"
                     />
                  </Link>

                  <button
                     type="button"
                     onClick={() => setLoginOpen(true)}
                     className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e3c69a] to-[#bd9460] px-4 py-3 text-xs font-black text-[#302217] shadow-lg shadow-[#b68e5c]/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                     <LockKeyhole size={15} />
                     Login Portal
                     <ArrowRight
                        size={14}
                        className="transition group-hover:translate-x-1"
                     />
                  </button>
               </div>

               {/* MOBILE ACTIONS */}
               <div className="flex items-center gap-2 lg:hidden">
                  <button
                     type="button"
                     onClick={() => setLoginOpen(true)}
                     aria-label="Open login portal"
                     className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d7b98b]/30 bg-[#d7b98b]/10 px-3 text-[#e6c99e] transition hover:bg-[#d7b98b]/20"
                  >
                     <UserRound size={18} />
                     <span className="hidden text-xs font-bold sm:inline">
                        Login
                     </span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setMobileMenu((prev) => !prev)}
                     aria-label="Toggle navigation menu"
                     aria-expanded={mobileMenu}
                     className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d7b98b]/25 bg-[#302419] text-[#f0d7b0] transition duration-300 hover:bg-[#493526]"
                  >
                     {mobileMenu ? <X size={21} /> : <Menu size={21} />}
                  </button>
               </div>
            </div>

            {/* MOBILE MENU */}
            <div
               className={`grid overflow-hidden transition-all duration-500 ease-in-out xl:hidden ${mobileMenu
                     ? "grid-rows-[1fr] opacity-100"
                     : "grid-rows-[0fr] opacity-0"
                  }`}
            >
               <div className="min-h-0">
                  <div className="border-t border-[#d7b98b]/15 bg-[#211a14] px-4 pb-5 pt-3 sm:px-6">
                     <nav className="mx-auto flex max-w-7xl flex-col gap-1">
                        {navigation.map((item, index) => {
                           const Icon = item.icon;

                           const active =
                              location.pathname === item.path ||
                              (item.path !== "/" &&
                                 location.pathname.startsWith(item.path + "/"));

                           return (
                              <Link
                                 key={item.path}
                                 to={item.path}
                                 onClick={() => setMobileMenu(false)}
                                 style={{ transitionDelay: `${index * 25}ms` }}
                                 className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition duration-300 ${active
                                       ? "bg-[#d7b98b]/10 text-[#e8c99a]"
                                       : "text-[#d5c6b2] hover:bg-[#d7b98b]/10 hover:text-[#e8c99a]"
                                    }`}
                              >
                                 <span className="flex items-center gap-3">
                                    <Icon size={17} />
                                    {item.label}
                                 </span>

                                 <ArrowRight
                                    size={15}
                                    className="opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100"
                                 />
                              </Link>
                           );
                        })}

                        <div className="mt-3 grid grid-cols-2 gap-3">
                           <Link
                              to="/student-ai"
                              onClick={() => setMobileMenu(false)}
                              className="flex items-center justify-center gap-2 rounded-xl border border-[#d7b98b]/30 bg-[#d7b98b]/10 px-3 py-3 text-xs font-bold text-[#e8c99a] transition hover:bg-[#d7b98b]/20"
                           >
                              <Brain size={16} />
                              AI Study
                           </Link>

                           <button
                              type="button"
                              onClick={() => {
                                 setMobileMenu(false);
                                 setLoginOpen(true);
                              }}
                              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e3c69a] to-[#bd9460] px-3 py-3 text-xs font-black text-[#302217] transition hover:-translate-y-0.5"
                           >
                              <LockKeyhole size={15} />
                              Login Portal
                           </button>
                        </div>
                     </nav>
                  </div>
               </div>
            </div>
         </header>

         {/* LOGIN MODAL */}
         {loginOpen && (
            <LoginModal close={() => setLoginOpen(false)} />
         )}
      </>
   );
}

/* =========================================
   LOGIN MODAL
========================================= */

function LoginModal({ close }) {
   const navigate = useNavigate();

   const [role, setRole] = useState("student");
   const [userId, setUserId] = useState("");
   const [password, setPassword] = useState("");
   const [rememberMe, setRememberMe] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [showPassword, setShowPassword] = useState(false);

   const roleOptions = [
      {
         value: "student",
         label: "Student",
         icon: GraduationCap,
      },
      {
         value: "teacher",
         label: "Teacher",
         icon: Users,
      },
      {
         value: "admin",
         label: "Admin",
         icon: ShieldCheck,
      },
   ];

   /* =========================================
      ESCAPE KEY
   ========================================= */

   useEffect(() => {
      const handleEscape = (event) => {
         if (event.key === "Escape" && !loading) {
            close();
         }
      };

      window.addEventListener("keydown", handleEscape);

      return () => {
         window.removeEventListener("keydown", handleEscape);
      };
   }, [close, loading]);

   /* =========================================
      LOGIN API
   ========================================= */

   const handleLogin = async (e) => {
      e.preventDefault();
      setError("");

      if (!userId.trim() || !password) {
         setError("Please enter your ID and password.");
         return;
      }

      try {
         setLoading(true);

         const selectedRole = String(role).trim().toLowerCase();
         const enteredUserId = userId.trim().toUpperCase();

         const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               userId: enteredUserId,
               password,
               role: selectedRole,
            }),
         });

         const data = await response.json();

         console.log("LOGIN RESPONSE:", data);

         if (!response.ok || !data.success) {
            throw new Error(
               data.message || "Login failed. Please check your details."
            );
         }

         if (!data.token || !data.user) {
            throw new Error(
               "Login response is missing token or user information."
            );
         }

         const returnedRole = String(data.user.role || "")
            .trim()
            .toLowerCase();

         if (returnedRole !== selectedRole) {
            throw new Error(
               `Login role mismatch. Selected "${selectedRole}" but server returned "${returnedRole}".`
            );
         }

         /* CLEAR OLD LOGIN DATA */
         localStorage.removeItem("schoolToken");
         localStorage.removeItem("schoolUser");
         sessionStorage.removeItem("schoolToken");
         sessionStorage.removeItem("schoolUser");

         /* SAVE NEW LOGIN DATA */
         const storage = rememberMe ? localStorage : sessionStorage;

         storage.setItem("schoolToken", data.token);

         storage.setItem(
            "schoolUser",
            JSON.stringify({
               id: data.user.id,
               name: data.user.name,
               userId: data.user.userId,
               role: returnedRole,
            })
         );

         /* CLOSE MODAL */
         close();

         /* ROLE BASED REDIRECT */
         if (returnedRole === "admin") {
            navigate("/admin/dashboard", { replace: true });
            return;
         }

         if (returnedRole === "teacher") {
            navigate("/teacher/dashboard", { replace: true });
            return;
         }

         if (returnedRole === "student") {
            navigate("/student/dashboard", { replace: true });
            return;
         }

         throw new Error("Unknown user role returned by server.");
      } catch (error) {
         console.error("LOGIN ERROR:", error);

         setError(
            error.message || "Something went wrong. Please try again."
         );
      } finally {
         setLoading(false);
      }
   };

   return (
      <div
         className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md"
         onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) {
               close();
            }
         }}
      >
         <div className="relative my-auto w-full max-w-md animate-[loginPopup_0.3s_ease-out] overflow-hidden rounded-[2rem] border border-[#d7b98b]/20 bg-[#211a14] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:p-8">

            {/* TOP DECORATION */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#b88b54]/10 blur-3xl" />

            {/* CLOSE */}
            <button
               type="button"
               onClick={close}
               disabled={loading}
               aria-label="Close login"
               className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7b98b]/20 bg-[#302419] text-[#d8c4a7] transition hover:rotate-90 hover:bg-[#513a28] disabled:opacity-50"
            >
               <X size={18} />
            </button>

            {/* MODAL HEADER */}
            <div className="relative text-center">
               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d7b98b]/25 bg-gradient-to-br from-[#e3c69a] to-[#bd9460] text-[#302217] shadow-xl shadow-black/20">
                  <School size={32} />
               </div>

               <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c6a579]">
                  <Sparkles size={13} />
                  Sunrise Public School
               </div>

               <h2 className="mt-3 text-2xl font-black text-[#fff2df]">
                  School Portal Login
               </h2>

               <p className="mt-2 text-sm text-[#b6a590]">
                  Login using your school account
               </p>
            </div>

            {/* ROLE SELECTION */}
            <div className="relative mt-7">
               <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#c5b39c]">
                  Select Login Type
               </p>

               <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((option) => {
                     const Icon = option.icon;
                     const selected = role === option.value;

                     return (
                        <button
                           key={option.value}
                           type="button"
                           onClick={() => {
                              setRole(option.value);
                              setError("");
                           }}
                           disabled={loading}
                           className={`group flex flex-col items-center gap-2 rounded-2xl border p-3 transition duration-300 ${selected
                                 ? "border-[#d9bd91] bg-[#d7b98b]/15 text-[#f0d3a6] shadow-lg shadow-black/10"
                                 : "border-[#d7b98b]/15 bg-[#2b2118] text-[#b6a590] hover:border-[#d7b98b]/40 hover:bg-[#35271c]"
                              }`}
                        >
                           <Icon
                              size={23}
                              className="transition duration-300 group-hover:scale-110"
                           />

                           <span className="text-xs font-bold">
                              {option.label}
                           </span>
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="relative mt-6 space-y-4">

               {/* USER ID */}
               <div>
                  <label className="mb-2 block text-xs font-bold text-[#d8c5a9]">
                     {role === "student"
                        ? "Student ID"
                        : role === "teacher"
                           ? "Teacher ID"
                           : "Admin ID"}
                  </label>

                  <div className="relative">
                     <UserRound
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aa8b64]"
                     />

                     <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder={`Enter ${role} ID`}
                        autoComplete="username"
                        disabled={loading}
                        className="w-full rounded-xl border border-[#d7b98b]/20 bg-[#302419] py-3.5 pl-11 pr-4 text-sm text-[#fff1df] outline-none transition placeholder:text-[#806f5a] focus:border-[#d9bd91] focus:bg-[#392a1e] focus:ring-4 focus:ring-[#d7b98b]/10 disabled:opacity-60"
                     />
                  </div>
               </div>

               {/* PASSWORD */}
               <div>
                  <label className="mb-2 block text-xs font-bold text-[#d8c5a9]">
                     Password
                  </label>

                  <div className="relative">
                     <LockKeyhole
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aa8b64]"
                     />

                     <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loading}
                        className="w-full rounded-xl border border-[#d7b98b]/20 bg-[#302419] py-3.5 pl-11 pr-12 text-sm text-[#fff1df] outline-none transition placeholder:text-[#806f5a] focus:border-[#d9bd91] focus:bg-[#392a1e] focus:ring-4 focus:ring-[#d7b98b]/10 disabled:opacity-60"
                     />

                     <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aa8b64] transition hover:text-[#f0d3a6]"
                     >
                        {showPassword ? (
                           <EyeOff size={18} />
                        ) : (
                           <Eye size={18} />
                        )}
                     </button>
                  </div>
               </div>

               {/* ERROR */}
               {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-semibold leading-5 text-red-300">
                     <AlertCircle size={17} className="mt-0.5 shrink-0" />
                     {error}
                  </div>
               )}

               {/* REMEMBER ME */}
               <div className="flex items-center justify-between gap-3 text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-[#b6a590]">
                     <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                        className="h-4 w-4 accent-[#d7b98b]"
                     />
                     Remember me
                  </label>

                  <button
                     type="button"
                     onClick={() =>
                        setError(
                           "Please contact school administration to reset your password."
                        )
                     }
                     className="font-semibold text-[#d9bd91] transition hover:text-[#f5dfbb] hover:underline"
                  >
                     Forgot Password?
                  </button>
               </div>

               {/* SUBMIT */}
               <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#e3c69a] to-[#bd9460] py-4 text-sm font-black text-[#302217] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
               >
                  {loading ? (
                     <>
                        <LoaderCircle size={19} className="animate-spin" />
                        Logging in...
                     </>
                  ) : (
                     <>
                        Login as{" "}
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                        <ArrowRight
                           size={18}
                           className="transition group-hover:translate-x-1"
                        />
                     </>
                  )}
               </button>
            </form>

            {/* FOOT NOTE */}
            <div className="relative mt-6 rounded-xl border border-[#d7b98b]/10 bg-[#302419] p-3 text-center">
               <p className="text-[11px] leading-5 text-[#aa987f]">
                  Your login credentials will be provided by the school administration.
               </p>
            </div>
         </div>

         <style>{`
        @keyframes loginPopup {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      </div>
   );
}
