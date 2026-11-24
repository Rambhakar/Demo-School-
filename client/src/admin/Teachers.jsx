import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";



const API_URL = (
   import.meta.env.VITE_API_URL || "http://localhost:5000"
)
   .replace(/\/+$/, "")
   .replace(/\/api$/i, "");



export default function Teachers() {

   const navigate = useNavigate();



   const [teachers, setTeachers] = useState([]);

   const [loading, setLoading] = useState(true);

   const [error, setError] = useState("");



   const [search, setSearch] = useState("");

   const [subjectFilter, setSubjectFilter] = useState("all");

   const [statusFilter, setStatusFilter] = useState("all");



   const [selectedTeacher, setSelectedTeacher] = useState(null);



   const [showPasswordModal, setShowPasswordModal] =

      useState(false);



   const [newPassword, setNewPassword] = useState("");

   const [passwordLoading, setPasswordLoading] =

      useState(false);



   const getToken = () => {

      return (

         localStorage.getItem("schoolToken") ||

         sessionStorage.getItem("schoolToken")

      );

   };



   const getUser = () => {

      const user =

         localStorage.getItem("schoolUser") ||

         sessionStorage.getItem("schoolUser");



      return user ? JSON.parse(user) : null;

   };



   const logout = () => {

      localStorage.removeItem("schoolToken");

      localStorage.removeItem("schoolUser");



      sessionStorage.removeItem("schoolToken");

      sessionStorage.removeItem("schoolUser");



      navigate("/");

   };



   /* ======================================

      FETCH TEACHERS

   ====================================== */



   const fetchTeachers = async () => {

      try {

         setLoading(true);

         setError("");



         const token = getToken();



         if (!token) {

            navigate("/");

            return;

         }



         const response = await fetch(

            `${API_URL}/api/admin/teachers`,

            {

               headers: {

                  Authorization: `Bearer ${token}`,

               },

            }

         );



         if (response.status === 401 || response.status === 403) {

            logout();

            return;

         }



         const data = await response.json();



         if (!response.ok || !data.success) {

            throw new Error(

               data.message || "Failed to load teachers"

            );

         }



         setTeachers(data.teachers || []);

      } catch (err) {

         console.error("Teachers Error:", err);

         setError(

            err.message || "Failed to load teachers."

         );

      } finally {

         setLoading(false);

      }

   };



   useEffect(() => {

      const user = getUser();



      if (!user || user.role !== "admin") {

         navigate("/");

         return;

      }



      fetchTeachers();

   }, []);



   /* ======================================

      DELETE TEACHER

   ====================================== */



   const deleteTeacher = async (teacher) => {

      const confirmed = window.confirm(

         `Are you sure you want to delete ${teacher.name}?`

      );



      if (!confirmed) return;



      try {

         const token = getToken();



         const response = await fetch(

            `${API_URL}/api/admin/teachers/${teacher._id}`,

            {

               method: "DELETE",

               headers: {

                  Authorization: `Bearer ${token}`,

               },

            }

         );



         if (response.status === 401 || response.status === 403) {

            logout();

            return;

         }



         const data = await response.json();



         if (!response.ok || !data.success) {

            throw new Error(

               data.message || "Failed to delete teacher"

            );

         }



         setTeachers((previous) =>

            previous.filter(

               (item) => item._id !== teacher._id

            )

         );

      } catch (err) {

         console.error("Delete Teacher Error:", err);

         setError(

            err.message || "Failed to delete teacher."

         );

      }

   };



   /* ======================================

      ACTIVE / INACTIVE

   ====================================== */



   const toggleTeacherStatus = async (teacher) => {

      try {

         const token = getToken();



         const currentStatus =

            teacher.user?.isActive !== false;



         const userId = teacher.user?._id;



         if (!userId) {

            setError("Teacher account not found.");

            return;

         }



         const response = await fetch(

            `${API_URL}/api/admin/users/${userId}/status`,

            {

               method: "PATCH",

               headers: {

                  "Content-Type": "application/json",

                  Authorization: `Bearer ${token}`,

               },

               body: JSON.stringify({

                  isActive: !currentStatus,

               }),

            }

         );



         if (response.status === 401 || response.status === 403) {

            logout();

            return;

         }



         const data = await response.json();



         if (!response.ok || !data.success) {

            throw new Error(

               data.message || "Failed to update teacher status"

            );

         }



         setTeachers((previous) =>

            previous.map((item) =>

               item._id === teacher._id

                  ? {

                     ...item,

                     user: {

                        ...item.user,

                        isActive: !currentStatus,

                     },

                  }

                  : item

            )

         );

      } catch (err) {

         console.error("Teacher Status Error:", err);

         setError(

            err.message ||

            "Failed to update teacher status."

         );

      }

   };



   /* ======================================

      RESET PASSWORD

   ====================================== */



   const resetPassword = async () => {

      if (!selectedTeacher?.user?._id) {

         setError("Teacher account not found.");

         return;

      }



      if (newPassword.length < 6) {

         setError(

            "Password must be at least 6 characters."

         );

         return;

      }



      try {

         setPasswordLoading(true);

         setError("");



         const token = getToken();



         const response = await fetch(

            `${API_URL}/api/admin/users/${selectedTeacher.user._id}/password`,

            {

               method: "PATCH",

               headers: {

                  "Content-Type": "application/json",

                  Authorization: `Bearer ${token}`,

               },

               body: JSON.stringify({

                  password: newPassword,

               }),

            }

         );



         if (response.status === 401 || response.status === 403) {

            logout();

            return;

         }



         const data = await response.json();



         if (!response.ok || !data.success) {

            throw new Error(

               data.message || "Failed to reset password"

            );

         }



         alert("Teacher password updated successfully.");



         setShowPasswordModal(false);

         setNewPassword("");

      } catch (err) {

         console.error("Password Error:", err);

         setError(

            err.message || "Failed to update password."

         );

      } finally {

         setPasswordLoading(false);

      }

   };



   /* ======================================

      FILTERS

   ====================================== */



   const subjects = [

      ...new Set(

         teachers

            .map((teacher) => teacher.subject)

            .filter(Boolean)

      ),

   ].sort();



   const filteredTeachers = teachers.filter((teacher) => {

      const text = search.toLowerCase();



      const matchesSearch =

         !search ||

         teacher.name?.toLowerCase().includes(text) ||

         teacher.teacherId?.toLowerCase().includes(text) ||

         teacher.phone?.toLowerCase().includes(text) ||

         teacher.email?.toLowerCase().includes(text) ||

         teacher.subject?.toLowerCase().includes(text);



      const matchesSubject =

         subjectFilter === "all" ||

         teacher.subject === subjectFilter;



      const isActive =

         teacher.user?.isActive !== false;



      const matchesStatus =

         statusFilter === "all" ||

         (statusFilter === "active" && isActive) ||

         (statusFilter === "inactive" && !isActive);



      return (

         matchesSearch &&

         matchesSubject &&

         matchesStatus

      );

   });



   const activeTeachers = teachers.filter(

      (teacher) => teacher.user?.isActive !== false

   ).length;



   const inactiveTeachers =

      teachers.length - activeTeachers;



   return (

      <div className="min-h-screen bg-slate-100">

         {/* ======================================

          HEADER

      ====================================== */}



         <header className="border-b border-slate-200 bg-white shadow-sm">

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

               <div>

                  <button

                     onClick={() =>

                        navigate("/admin/dashboard")

                     }

                     className="mb-1 text-sm font-bold text-blue-600 hover:text-blue-700"

                  >

                     ← Back to Dashboard

                  </button>



                  <h1 className="text-2xl font-black text-slate-950">

                     Teachers

                  </h1>



                  <p className="text-sm text-slate-500">

                     Manage all teacher accounts and profiles

                  </p>

               </div>



               <div className="flex gap-2">

                  <button

                     onClick={fetchTeachers}

                     disabled={loading}

                     className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-60"

                  >

                     ↻ Refresh

                  </button>



                  <button

                     onClick={() =>

                        navigate("/admin/create-user")

                     }

                     className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"

                  >

                     + Add Teacher

                  </button>

               </div>

            </div>

         </header>



         {/* ======================================

          MAIN

      ====================================== */}



         <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* ERROR */}



            {error && (

               <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">

                  {error}

               </div>

            )}



            {/* ======================================

            STATS

        ====================================== */}



            <div className="grid gap-4 sm:grid-cols-3">

               <StatCard

                  icon="👨‍🏫"

                  title="Total Teachers"

                  value={teachers.length}

               />



               <StatCard

                  icon="🟢"

                  title="Active Teachers"

                  value={activeTeachers}

               />



               <StatCard

                  icon="🔴"

                  title="Inactive Teachers"

                  value={inactiveTeachers}

               />

            </div>



            {/* ======================================

            FILTERS

        ====================================== */}



            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

               <div className="grid gap-3 lg:grid-cols-[1fr_200px_180px]">

                  <div className="relative">

                     <span className="absolute left-4 top-1/2 -translate-y-1/2">

                        🔍

                     </span>



                     <input

                        type="text"

                        value={search}

                        onChange={(e) =>

                           setSearch(e.target.value)

                        }

                        placeholder="Search by name, ID, subject, phone or email..."

                        className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

                     />

                  </div>



                  <select

                     value={subjectFilter}

                     onChange={(e) =>

                        setSubjectFilter(e.target.value)

                     }

                     className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

                  >

                     <option value="all">All Subjects</option>



                     {subjects.map((subject) => (

                        <option

                           key={subject}

                           value={subject}

                        >

                           {subject}

                        </option>

                     ))}

                  </select>



                  <select

                     value={statusFilter}

                     onChange={(e) =>

                        setStatusFilter(e.target.value)

                     }

                     className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

                  >

                     <option value="all">All Status</option>

                     <option value="active">Active</option>

                     <option value="inactive">Inactive</option>

                  </select>

               </div>

            </div>



            {/* ======================================

            TEACHER TABLE

        ====================================== */}



            <section className="mt-8">

               <div className="mb-4">

                  <h2 className="text-xl font-black text-slate-950">

                     Teacher List

                  </h2>



                  <p className="mt-1 text-sm text-slate-500">

                     {filteredTeachers.length} teacher

                     {filteredTeachers.length !== 1

                        ? "s"

                        : ""}{" "}

                     found

                  </p>

               </div>



               <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  {loading ? (

                     <div className="p-12 text-center">

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />



                        <p className="mt-4 text-sm font-semibold text-slate-500">

                           Loading teachers...

                        </p>

                     </div>

                  ) : filteredTeachers.length === 0 ? (

                     <div className="p-12 text-center">

                        <div className="text-5xl">👨‍🏫</div>



                        <h3 className="mt-4 text-lg font-black text-slate-900">

                           No teachers found

                        </h3>



                        <p className="mt-1 text-sm text-slate-500">

                           Try changing your search or filters.

                        </p>

                     </div>

                  ) : (

                     <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px]">

                           <thead className="bg-slate-50">

                              <tr>

                                 <th className="px-5 py-4 text-left text-xs font-black uppercase text-slate-500">

                                    Teacher

                                 </th>



                                 <th className="px-5 py-4 text-left text-xs font-black uppercase text-slate-500">

                                    Teacher ID

                                 </th>



                                 <th className="px-5 py-4 text-left text-xs font-black uppercase text-slate-500">

                                    Subject

                                 </th>



                                 <th className="px-5 py-4 text-left text-xs font-black uppercase text-slate-500">

                                    Qualification

                                 </th>



                                 <th className="px-5 py-4 text-left text-xs font-black uppercase text-slate-500">

                                    Phone

                                 </th>



                                 <th className="px-5 py-4 text-left text-xs font-black uppercase text-slate-500">

                                    Status

                                 </th>



                                 <th className="px-5 py-4 text-left text-xs font-black uppercase text-slate-500">

                                    Actions

                                 </th>

                              </tr>

                           </thead>



                           <tbody className="divide-y divide-slate-100">

                              {filteredTeachers.map((teacher) => {

                                 const active =

                                    teacher.user?.isActive !== false;



                                 return (

                                    <tr

                                       key={teacher._id}

                                       className="hover:bg-slate-50"

                                    >

                                       {/* TEACHER */}



                                       <td className="px-5 py-4">

                                          <div className="flex items-center gap-3">

                                             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700">

                                                {teacher.name

                                                   ?.charAt(0)

                                                   ?.toUpperCase() || "T"}

                                             </div>



                                             <div>

                                                <p className="text-sm font-black text-slate-900">

                                                   {teacher.name}

                                                </p>



                                                <p className="text-xs text-slate-500">

                                                   {teacher.email ||

                                                      "No email"}

                                                </p>

                                             </div>

                                          </div>

                                       </td>



                                       {/* ID */}



                                       <td className="px-5 py-4">

                                          <span className="font-bold text-indigo-600">

                                             {teacher.teacherId || "-"}

                                          </span>

                                       </td>



                                       {/* SUBJECT */}



                                       <td className="px-5 py-4">

                                          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">

                                             {teacher.subject || "-"}

                                          </span>

                                       </td>



                                       {/* QUALIFICATION */}



                                       <td className="px-5 py-4 text-sm text-slate-600">

                                          {teacher.qualification || "-"}

                                       </td>



                                       {/* PHONE */}



                                       <td className="px-5 py-4 text-sm text-slate-600">

                                          {teacher.phone || "-"}

                                       </td>



                                       {/* STATUS */}



                                       <td className="px-5 py-4">

                                          <span

                                             className={`rounded-full px-3 py-1.5 text-xs font-bold ${active

                                                ? "bg-emerald-50 text-emerald-700"

                                                : "bg-red-50 text-red-700"

                                                }`}

                                          >

                                             {active

                                                ? "Active"

                                                : "Inactive"}

                                          </span>

                                       </td>



                                       {/* ACTIONS */}



                                       <td className="px-5 py-4">

                                          <div className="flex gap-2">

                                             <button

                                                onClick={() =>

                                                   setSelectedTeacher(

                                                      teacher

                                                   )

                                                }

                                                className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"

                                             >

                                                View

                                             </button>



                                             <button

                                                onClick={() => {

                                                   setSelectedTeacher(

                                                      teacher

                                                   );

                                                   setNewPassword("");

                                                   setShowPasswordModal(

                                                      true

                                                   );

                                                }}

                                                className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"

                                             >

                                                Password

                                             </button>



                                             <button

                                                onClick={() =>

                                                   toggleTeacherStatus(

                                                      teacher

                                                   )

                                                }

                                                className={`rounded-lg px-3 py-2 text-xs font-bold ${active

                                                   ? "bg-amber-50 text-amber-700 hover:bg-amber-100"

                                                   : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"

                                                   }`}

                                             >

                                                {active

                                                   ? "Disable"

                                                   : "Enable"}

                                             </button>



                                             <button

                                                onClick={() =>

                                                   deleteTeacher(

                                                      teacher

                                                   )

                                                }

                                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"

                                             >

                                                Delete

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

               </div>

            </section>

         </main>



         {/* ======================================

          VIEW TEACHER MODAL

      ====================================== */}



         {selectedTeacher && !showPasswordModal && (

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">

               <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                     <div>

                        <p className="text-xs font-bold uppercase text-indigo-600">

                           Teacher Profile

                        </p>



                        <h2 className="text-xl font-black text-slate-950">

                           {selectedTeacher.name}

                        </h2>

                     </div>



                     <button

                        onClick={() =>

                           setSelectedTeacher(null)

                        }

                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xl font-bold text-slate-600"

                     >

                        ×

                     </button>

                  </div>



                  <div className="grid gap-4 p-6 sm:grid-cols-2">

                     <Info

                        label="Teacher ID"

                        value={selectedTeacher.teacherId}

                     />



                     <Info

                        label="Name"

                        value={selectedTeacher.name}

                     />



                     <Info

                        label="Father Name"

                        value={selectedTeacher.fatherName}

                     />



                     <Info

                        label="Subject"

                        value={selectedTeacher.subject}

                     />



                     <Info

                        label="Qualification"

                        value={selectedTeacher.qualification}

                     />



                     <Info

                        label="Phone"

                        value={selectedTeacher.phone}

                     />



                     <Info

                        label="Email"

                        value={selectedTeacher.email}

                     />



                     <Info

                        label="Joining Date"

                        value={formatDate(

                           selectedTeacher.joiningDate

                        )}

                     />



                     <Info

                        label="City"

                        value={selectedTeacher.city}

                     />



                     <Info

                        label="State"

                        value={selectedTeacher.state}

                     />



                     <div className="sm:col-span-2">

                        <Info

                           label="Address"

                           value={selectedTeacher.address}

                        />

                     </div>

                  </div>

               </div>

            </div>

         )}



         {/* ======================================

          PASSWORD MODAL

      ====================================== */}



         {showPasswordModal && selectedTeacher && (

            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">

               <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                  <div className="border-b border-slate-200 p-6">

                     <h2 className="text-xl font-black text-slate-950">

                        Reset Password

                     </h2>



                     <p className="mt-1 text-sm text-slate-500">

                        Teacher: {selectedTeacher.name}

                     </p>

                  </div>



                  <div className="p-6">

                     <label className="mb-2 block text-sm font-bold text-slate-700">

                        New Password

                     </label>



                     <input

                        type="password"

                        value={newPassword}

                        onChange={(e) =>

                           setNewPassword(e.target.value)

                        }

                        placeholder="Minimum 6 characters"

                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"

                     />



                     <div className="mt-6 flex gap-3">

                        <button

                           onClick={() => {

                              setShowPasswordModal(false);

                              setNewPassword("");

                           }}

                           className="flex-1 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"

                        >

                           Cancel

                        </button>



                        <button

                           onClick={resetPassword}

                           disabled={passwordLoading}

                           className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"

                        >

                           {passwordLoading

                              ? "Updating..."

                              : "Update Password"}

                        </button>

                     </div>

                  </div>

               </div>

            </div>

         )}

      </div>

   );

}



/* ======================================

   STAT CARD

\====================================== */



function StatCard({ icon, title, value }) {

   return (

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

         <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">

               {icon}

            </div>



            <span className="text-3xl font-black text-slate-950">

               {value}

            </span>

         </div>



         <h3 className="mt-5 font-black text-slate-900">

            {title}

         </h3>



         <p className="mt-1 text-xs text-slate-500">

            Teacher management

         </p>

      </div>

   );

}



/* ======================================

   INFO

\====================================== */



function Info({ label, value }) {

   return (

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

         <p className="text-xs font-bold uppercase text-slate-500">

            {label}

         </p>



         <p className="mt-1 break-words text-sm font-semibold text-slate-900">

            {value || "-"}

         </p>

      </div>

   );

}



/* ======================================

   DATE

\====================================== */



function formatDate(date) {

   if (!date) return "-";



   return new Date(date).toLocaleDateString("en-IN", {

      day: "2-digit",

      month: "short",

      year: "numeric",

   });

}