
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
   import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Admissions() {
   const navigate = useNavigate();

   const [admissions, setAdmissions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [actionLoading, setActionLoading] = useState("");
   const [error, setError] = useState("");

   const [search, setSearch] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");

   const [selectedAdmission, setSelectedAdmission] = useState(null);

   const [approveTarget, setApproveTarget] = useState(null);
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);

   const [loginDetails, setLoginDetails] = useState(null);

   // ==========================================
   // AUTH HELPERS
   // ==========================================

   const getToken = () =>
      localStorage.getItem("schoolToken") ||
      sessionStorage.getItem("schoolToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

   const getUser = () => {
      try {
         const user =
            localStorage.getItem("schoolUser") ||
            sessionStorage.getItem("schoolUser");

         return user ? JSON.parse(user) : null;
      } catch {
         return null;
      }
   };

   const logout = () => {
      localStorage.removeItem("schoolToken");
      localStorage.removeItem("schoolUser");
      localStorage.removeItem("token");

      sessionStorage.removeItem("schoolToken");
      sessionStorage.removeItem("schoolUser");
      sessionStorage.removeItem("token");

      navigate("/");
   };

   // ==========================================
   // FETCH WEBSITE ADMISSION APPLICATIONS
   // GET /api/admissions
   // ==========================================

   const fetchAdmissions = useCallback(async () => {
      try {
         setLoading(true);
         setError("");

         const token = getToken();

         if (!token) {
            logout();
            return;
         }

         const response = await fetch(`${API_URL}/api/admissions`, {
            method: "GET",
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (response.status === 401 || response.status === 403) {
            logout();
            return;
         }

         const data = await response.json();

         if (!response.ok || !data.success) {
            throw new Error(
               data.message || "Unable to load admission applications."
            );
         }

         setAdmissions(data.admissions || []);
      } catch (err) {
         console.error("Fetch Admissions Error:", err);
         setError(err.message || "Unable to load applications.");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      const user = getUser();

      if (!user || user.role?.toLowerCase() !== "admin") {
         navigate("/");
         return;
      }

      fetchAdmissions();
   }, [navigate, fetchAdmissions]);

   // ==========================================
   // UPDATE ADMISSION STATUS
   // PATCH /api/admissions/:id/status
   // ==========================================

   const updateAdmissionStatus = async (
      id,
      status,
      studentPassword = ""
   ) => {
      try {
         setActionLoading(`${id}-${status}`);
         setError("");

         const token = getToken();

         const body = { status };

         if (status === "approved") {
            body.password = studentPassword;
         }

         const response = await fetch(
            `${API_URL}/api/admissions/${id}/status`,
            {
               method: "PATCH",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(body),
            }
         );

         if (response.status === 401 || response.status === 403) {
            logout();
            return false;
         }

         const data = await response.json();

         if (!response.ok || !data.success) {
            throw new Error(
               data.message || "Unable to update admission."
            );
         }

         setAdmissions((previous) =>
            previous.map((item) =>
               item._id === id
                  ? {
                     ...item,
                     ...(data.admission || {}),
                     status: data.admission?.status || status,
                  }
                  : item
            )
         );

         if (selectedAdmission?._id === id) {
            setSelectedAdmission((previous) => ({
               ...previous,
               ...(data.admission || {}),
               status: data.admission?.status || status,
            }));
         }

         if (status === "approved" && data.loginDetails) {
            setLoginDetails(data.loginDetails);
         }

         setApproveTarget(null);
         setPassword("");

         if (status !== "approved") {
            alert(`Admission ${status} successfully.`);
         }

         return true;
      } catch (err) {
         console.error("Admission Status Error:", err);
         setError(err.message || "Unable to update admission.");
         return false;
      } finally {
         setActionLoading("");
      }
   };

   // ==========================================
   // APPROVAL MODAL
   // ==========================================

   const handleApprove = async () => {
      if (!approveTarget) return;

      if (password.trim().length < 6) {
         setError("Student password must contain at least 6 characters.");
         return;
      }

      await updateAdmissionStatus(
         approveTarget._id,
         "approved",
         password.trim()
      );
   };

   // ==========================================
   // FILTERS AND SEARCH
   // ==========================================

   const filteredAdmissions = useMemo(() => {
      return admissions.filter((item) => {
         const matchesStatus =
            statusFilter === "all" || item.status === statusFilter;

         const searchText = search.trim().toLowerCase();

         const matchesSearch =
            !searchText ||
            [
               item.applicationNumber,
               item.studentName,
               item.fatherName,
               item.phone,
               item.email,
               item.classApplied,
            ].some((value) =>
               String(value || "").toLowerCase().includes(searchText)
            );

         return matchesStatus && matchesSearch;
      });
   }, [admissions, search, statusFilter]);

   const pendingCount = admissions.filter(
      (item) => item.status === "pending"
   ).length;

   const reviewedCount = admissions.filter(
      (item) => item.status === "reviewed"
   ).length;

   const approvedCount = admissions.filter(
      (item) => item.status === "approved"
   ).length;

   const rejectedCount = admissions.filter(
      (item) => item.status === "rejected"
   ).length;

   // ==========================================
   // HELPERS
   // ==========================================

   const formatDate = (date) => {
      if (!date) return "-";

      return new Date(date).toLocaleDateString("en-IN", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
   };

   const getStatusClass = (status) => {
      const classes = {
         pending: "bg-amber-50 text-amber-700 border-amber-200",
         reviewed: "bg-blue-50 text-blue-700 border-blue-200",
         approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
         rejected: "bg-red-50 text-red-700 border-red-200",
      };

      return (
         classes[status] ||
         "bg-slate-100 text-slate-600 border-slate-200"
      );
   };

   // ==========================================
   // UI
   // ==========================================

   return (
      <div className="min-h-screen bg-slate-100">
         {/* HEADER */}
         <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
               <div>
                  <button
                     onClick={() => navigate("/admin/dashboard")}
                     className="mb-1 text-sm font-bold text-blue-600 hover:text-blue-800"
                  >
                     ← Back to Dashboard
                  </button>

                  <h1 className="text-2xl font-black text-slate-950">
                     Admission Management
                  </h1>

                  <p className="text-sm text-slate-500">
                     Manage applications submitted from your school website.
                  </p>
               </div>

               <button
                  onClick={fetchAdmissions}
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
               >
                  {loading ? "Loading..." : "↻ Refresh Applications"}
               </button>
            </div>
         </header>

         <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
            {/* ERROR */}
            {error && (
               <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  <span>{error}</span>

                  <button
                     onClick={() => setError("")}
                     className="ml-3 text-lg"
                  >
                     ×
                  </button>
               </div>
            )}

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
               <StatCard
                  icon="📋"
                  title="Total Applications"
                  value={admissions.length}
                  color="blue"
               />

               <StatCard
                  icon="⏳"
                  title="Pending"
                  value={pendingCount}
                  color="amber"
               />

               <StatCard
                  icon="👀"
                  title="Reviewed"
                  value={reviewedCount}
                  color="indigo"
               />

               <StatCard
                  icon="✅"
                  title="Approved"
                  value={approvedCount}
                  color="green"
                  subtitle={`${rejectedCount} rejected`}
               />
            </div>

            {/* APPLICATIONS */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
               <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                     <h2 className="text-xl font-black text-slate-950">
                        Website Admission Applications
                     </h2>

                     <p className="mt-1 text-sm text-slate-500">
                        Applications submitted by parents through the public website.
                     </p>
                  </div>

                  <span className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                     {filteredAdmissions.length} Applications
                  </span>
               </div>

               {/* SEARCH AND FILTER */}
               <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-2">
                  <input
                     type="text"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Search student, application number, phone..."
                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <select
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                     <option value="all">All Applications</option>
                     <option value="pending">Pending</option>
                     <option value="reviewed">Reviewed</option>
                     <option value="approved">Approved</option>
                     <option value="rejected">Rejected</option>
                  </select>
               </div>

               {/* TABLE */}
               {loading ? (
                  <div className="p-14 text-center">
                     <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                     <p className="mt-4 text-sm font-semibold text-slate-500">
                        Loading admission applications...
                     </p>
                  </div>
               ) : filteredAdmissions.length === 0 ? (
                  <div className="p-14 text-center">
                     <div className="text-5xl">📭</div>

                     <h3 className="mt-4 text-lg font-black text-slate-900">
                        No Applications Found
                     </h3>

                     <p className="mt-1 text-sm text-slate-500">
                        New website admission forms will appear here after submission.
                     </p>

                     <button
                        onClick={fetchAdmissions}
                        className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                     >
                        Refresh
                     </button>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-50">
                           <tr>
                              {[
                                 "Application",
                                 "Student",
                                 "Class",
                                 "Parent",
                                 "Phone",
                                 "Date",
                                 "Status",
                                 "Action",
                              ].map((heading) => (
                                 <th
                                    key={heading}
                                    className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500"
                                 >
                                    {heading}
                                 </th>
                              ))}
                           </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                           {filteredAdmissions.map((admission) => (
                              <tr
                                 key={admission._id}
                                 className="transition hover:bg-slate-50"
                              >
                                 <td className="px-5 py-4">
                                    <p className="text-sm font-black text-blue-600">
                                       {admission.applicationNumber || "-"}
                                    </p>
                                 </td>

                                 <td className="px-5 py-4">
                                    <p className="text-sm font-bold text-slate-900">
                                       {admission.studentName || "-"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                       {admission.gender || "-"}
                                    </p>
                                 </td>

                                 <td className="px-5 py-4">
                                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                       {admission.classApplied || "-"}
                                    </span>
                                 </td>

                                 <td className="px-5 py-4">
                                    <p className="text-sm font-semibold text-slate-800">
                                       {admission.fatherName || "-"}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                       Father
                                    </p>
                                 </td>

                                 <td className="px-5 py-4 text-sm text-slate-600">
                                    {admission.phone || "-"}
                                 </td>

                                 <td className="px-5 py-4 text-sm text-slate-600">
                                    {formatDate(admission.createdAt)}
                                 </td>

                                 <td className="px-5 py-4">
                                    <span
                                       className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${getStatusClass(
                                          admission.status
                                       )}`}
                                    >
                                       {admission.status || "pending"}
                                    </span>
                                 </td>

                                 <td className="px-5 py-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                       <button
                                          onClick={() => setSelectedAdmission(admission)}
                                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                                       >
                                          View
                                       </button>

                                       {admission.status === "pending" && (
                                          <button
                                             disabled={actionLoading !== ""}
                                             onClick={() =>
                                                updateAdmissionStatus(
                                                   admission._id,
                                                   "reviewed"
                                                )
                                             }
                                             className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                                          >
                                             Review
                                          </button>
                                       )}

                                       {(admission.status === "pending" ||
                                          admission.status === "reviewed") && (
                                             <>
                                                <button
                                                   disabled={actionLoading !== ""}
                                                   onClick={() => {
                                                      setError("");
                                                      setPassword("");
                                                      setApproveTarget(admission);
                                                   }}
                                                   className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                   Approve
                                                </button>

                                                <button
                                                   disabled={actionLoading !== ""}
                                                   onClick={() =>
                                                      updateAdmissionStatus(
                                                         admission._id,
                                                         "rejected"
                                                      )
                                                   }
                                                   className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                                                >
                                                   Reject
                                                </button>
                                             </>
                                          )}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </section>
         </main>

         {/* ======================================
          VIEW APPLICATION MODAL
      ====================================== */}

         {selectedAdmission && (
            <Modal onClose={() => setSelectedAdmission(null)}>
               <div className="border-b border-slate-200 px-6 py-5">
                  <p className="text-xs font-bold uppercase text-blue-600">
                     Admission Application Details
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                     {selectedAdmission.studentName}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                     {selectedAdmission.applicationNumber}
                  </p>
               </div>

               <div className="grid gap-4 p-6 sm:grid-cols-2">
                  <InfoItem
                     label="Student Name"
                     value={selectedAdmission.studentName}
                  />

                  <InfoItem
                     label="Application Number"
                     value={selectedAdmission.applicationNumber}
                  />

                  <InfoItem
                     label="Father Name"
                     value={selectedAdmission.fatherName}
                  />

                  <InfoItem
                     label="Mother Name"
                     value={selectedAdmission.motherName}
                  />

                  <InfoItem
                     label="Date of Birth"
                     value={formatDate(selectedAdmission.dob)}
                  />

                  <InfoItem
                     label="Gender"
                     value={selectedAdmission.gender}
                  />

                  <InfoItem
                     label="Class Applied"
                     value={selectedAdmission.classApplied}
                  />

                  <InfoItem
                     label="Previous School"
                     value={selectedAdmission.previousSchool}
                  />

                  <InfoItem
                     label="Phone"
                     value={selectedAdmission.phone}
                  />

                  <InfoItem
                     label="Email"
                     value={selectedAdmission.email}
                  />

                  <InfoItem
                     label="City"
                     value={selectedAdmission.city}
                  />

                  <InfoItem
                     label="State"
                     value={selectedAdmission.state}
                  />

                  <InfoItem
                     label="Application Date"
                     value={formatDate(selectedAdmission.createdAt)}
                  />

                  <InfoItem
                     label="Status"
                     value={selectedAdmission.status}
                  />

                  <div className="sm:col-span-2">
                     <InfoItem
                        label="Address"
                        value={selectedAdmission.address}
                     />
                  </div>

                  <div className="sm:col-span-2">
                     <InfoItem
                        label="Message / Enquiry"
                        value={selectedAdmission.message}
                     />
                  </div>
               </div>

               <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                  <button
                     onClick={() => setSelectedAdmission(null)}
                     className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                  >
                     Close
                  </button>
               </div>
            </Modal>
         )}

         {/* ======================================
          APPROVE APPLICATION MODAL
      ====================================== */}

         {approveTarget && (
            <Modal onClose={() => setApproveTarget(null)}>
               <div className="border-b border-slate-200 px-6 py-5">
                  <div className="text-3xl">🎓</div>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                     Approve Admission
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                     Create a student login account for{" "}
                     <strong>{approveTarget.studentName}</strong>.
                  </p>
               </div>

               <div className="space-y-4 p-6">
                  <div className="rounded-xl bg-blue-50 p-4">
                     <p className="text-xs font-bold uppercase text-blue-700">
                        Application Number
                     </p>

                     <p className="mt-1 font-black text-blue-900">
                        {approveTarget.applicationNumber}
                     </p>
                  </div>

                  <div>
                     <label className="mb-2 block text-sm font-bold text-slate-700">
                        Student Login Password
                     </label>

                     <div className="flex gap-2">
                        <input
                           type={showPassword ? "text" : "password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Enter password (minimum 6 characters)"
                           className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-700"
                        >
                           {showPassword ? "Hide" : "Show"}
                        </button>
                     </div>

                     <p className="mt-2 text-xs text-slate-500">
                        This password will be saved securely as a hash in the database.
                     </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                     Approving will create a new User account and Student profile.
                     Please save the login details after approval.
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                     <button
                        onClick={() => {
                           setApproveTarget(null);
                           setPassword("");
                           setError("");
                        }}
                        className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
                     >
                        Cancel
                     </button>

                     <button
                        onClick={handleApprove}
                        disabled={
                           actionLoading !== "" || password.trim().length < 6
                        }
                        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                        {actionLoading ? "Approving..." : "Confirm & Approve"}
                     </button>
                  </div>
               </div>
            </Modal>
         )}

         {/* ======================================
          STUDENT LOGIN DETAILS MODAL
      ====================================== */}

         {loginDetails && (
            <Modal onClose={() => setLoginDetails(null)}>
               <div className="border-b border-slate-200 px-6 py-5">
                  <div className="text-4xl">🎉</div>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                     Student Account Created!
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                     Save these credentials and share them securely with the student.
                  </p>
               </div>

               <div className="space-y-4 p-6">
                  <Credential
                     label="Student Login ID"
                     value={loginDetails.userId || loginDetails.studentId}
                  />

                  <Credential
                     label="Student Password"
                     value={loginDetails.password}
                  />

                  <button
                     onClick={() => {
                        const text =
                           `Student Login ID: ${loginDetails.userId || loginDetails.studentId}\n` +
                           `Password: ${loginDetails.password}`;

                        navigator.clipboard?.writeText(text);
                     }}
                     className="w-full rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100"
                  >
                     Copy Login Details
                  </button>

                  <button
                     onClick={() => setLoginDetails(null)}
                     className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                     Done
                  </button>
               </div>
            </Modal>
         )}
      </div>
   );
}

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

function StatCard({ icon, title, value, color, subtitle }) {
   const colors = {
      blue: "bg-blue-50 text-blue-700",
      amber: "bg-amber-50 text-amber-700",
      indigo: "bg-indigo-50 text-indigo-700",
      green: "bg-emerald-50 text-emerald-700",
   };

   return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
         <div className="flex items-center justify-between">
            <div
               className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${colors[color] || colors.blue
                  }`}
            >
               {icon}
            </div>

            <span className="text-3xl font-black text-slate-950">
               {value}
            </span>
         </div>

         <h3 className="mt-5 font-black text-slate-900">{title}</h3>

         <p className="mt-1 text-xs text-slate-500">
            {subtitle || "Admission applications"}
         </p>
      </div>
   );
}

function InfoItem({ label, value }) {
   return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
         <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
         </p>

         <p className="mt-1 break-words text-sm font-semibold text-slate-900">
            {value || "-"}
         </p>
      </div>
   );
}

function Credential({ label, value }) {
   return (
      <div className="rounded-xl bg-slate-50 p-4">
         <p className="text-xs font-bold uppercase text-slate-500">
            {label}
         </p>

         <p className="mt-1 break-all text-lg font-black text-slate-900">
            {value || "-"}
         </p>
      </div>
   );
}

function Modal({ children, onClose }) {
   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
         onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
         }}
      >
         <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {children}
         </div>
      </div>
   );
}
