import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
   import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
   const navigate = useNavigate();

   const [form, setForm] = useState({
      userId: "",
      password: "",
      role: "admin",
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   // =====================================================
   // CHANGE
   // =====================================================

   const handleChange = (e) => {
      const { name, value } = e.target;

      setForm((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   // =====================================================
   // LOGIN
   // =====================================================

   const handleSubmit = async (e) => {
      e.preventDefault();

      setError("");

      if (!form.userId.trim()) {
         setError("User ID enter karein.");
         return;
      }

      if (!form.password) {
         setError("Password enter karein.");
         return;
      }

      try {
         setLoading(true);

         // Purana authentication data clear
         localStorage.removeItem("schoolToken");
         localStorage.removeItem("schoolUser");
         localStorage.removeItem("token");

         sessionStorage.removeItem("schoolToken");
         sessionStorage.removeItem("schoolUser");
         sessionStorage.removeItem("token");

         const response = await fetch(
            `${API_URL}/api/auth/login`,
            {
               method: "POST",

               headers: {
                  "Content-Type": "application/json",
               },

               body: JSON.stringify({
                  userId: form.userId.trim(),
                  password: form.password,
                  role: form.role.toLowerCase(),
               }),
            }
         );

         const data = await response.json();

         console.log("LOGIN RESPONSE:", data);

         if (!response.ok) {
            throw new Error(
               data.message || "Login failed."
            );
         }

         // =================================================
         // TOKEN CHECK
         // =================================================

         const token = data?.token;

         if (
            !token ||
            typeof token !== "string" ||
            token.split(".").length !== 3
         ) {
            console.error(
               "Invalid JWT received from backend:",
               token ? "Token received but invalid" : "No token"
            );

            throw new Error(
               "Backend ne valid login token nahi bheja."
            );
         }

         // =================================================
         // USER
         // =================================================

         const user = data?.user;

         if (!user) {
            throw new Error(
               "Login successful hai lekin user data nahi mila."
            );
         }

         // =================================================
         // SAVE AUTH
         // =================================================

         localStorage.setItem(
            "schoolToken",
            token
         );

         localStorage.setItem(
            "schoolUser",
            JSON.stringify(user)
         );

         // Compatibility
         sessionStorage.setItem(
            "schoolToken",
            token
         );

         sessionStorage.setItem(
            "schoolUser",
            JSON.stringify(user)
         );

         // Old token key remove
         localStorage.removeItem("token");
         sessionStorage.removeItem("token");

         console.log(
            "TOKEN SAVED:",
            token.split(".").length === 3
         );

         console.log(
            "USER SAVED:",
            user
         );

         // =================================================
         // ROLE REDIRECT
         // =================================================

         const role = String(
            user.role || form.role
         ).toLowerCase();

         if (role === "admin") {
            navigate("/admin/dashboard", {
               replace: true,
            });
         } else if (role === "student") {
            navigate("/student/dashboard", {
               replace: true,
            });
         } else if (role === "teacher") {
            navigate("/teacher/dashboard", {
               replace: true,
            });
         } else {
            throw new Error(
               "Unknown user role."
            );
         }
      } catch (err) {
         console.error(
            "LOGIN ERROR:",
            err
         );

         setError(
            err.message ||
            "Login failed. Please try again."
         );

         // Failed login par auth clear
         localStorage.removeItem(
            "schoolToken"
         );

         localStorage.removeItem(
            "schoolUser"
         );

         sessionStorage.removeItem(
            "schoolToken"
         );

         sessionStorage.removeItem(
            "schoolUser"
         );
      } finally {
         setLoading(false);
      }
   };

   // =====================================================
   // UI
   // =====================================================

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-4 py-10">

         <div className="w-full max-w-md">

            {/* LOGO */}

            <div className="text-center mb-8">
               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl shadow-xl">
                  🎓
               </div>

               <h1 className="mt-5 text-3xl font-black text-white">
                  SchoolHub
               </h1>

               <p className="mt-1 text-sm text-slate-400">
                  School Management System
               </p>
            </div>

            {/* CARD */}

            <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">

               <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900">
                     Welcome Back
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                     Login to continue to your dashboard.
                  </p>
               </div>

               {/* ERROR */}

               {error && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                     ❌ {error}
                  </div>
               )}

               <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
               >

                  {/* ROLE */}

                  <div>
                     <label className="mb-2 block text-sm font-bold text-slate-700">
                        Login As
                     </label>

                     <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
                     >
                        <option value="admin">
                           Administrator
                        </option>

                        <option value="teacher">
                           Teacher
                        </option>

                        <option value="student">
                           Student
                        </option>
                     </select>
                  </div>

                  {/* USER ID */}

                  <div>
                     <label className="mb-2 block text-sm font-bold text-slate-700">
                        User ID
                     </label>

                     <input
                        type="text"
                        name="userId"
                        value={form.userId}
                        onChange={handleChange}
                        placeholder="Enter User ID"
                        autoComplete="username"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
                     />
                  </div>

                  {/* PASSWORD */}

                  <div>
                     <label className="mb-2 block text-sm font-bold text-slate-700">
                        Password
                     </label>

                     <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
                     />
                  </div>

                  {/* BUTTON */}

                  <button
                     type="submit"
                     disabled={loading}
                     className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                     {loading
                        ? "Logging in..."
                        : "Login to Dashboard →"}
                  </button>
               </form>

               <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-center">
                  <p className="text-xs font-semibold text-slate-400">
                     Secure JWT Authentication
                  </p>
               </div>

            </div>
         </div>
      </div>
   );
}