import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialNotices = [
   {
      id: 1,
      title: "Annual Examination 2026",
      description:
         "Annual examinations will begin from the first week of March. Students are requested to prepare according to the examination schedule.",
      audience: "All Students",
      date: "2026-03-01",
      important: true,
   },
   {
      id: 2,
      title: "Parent Teacher Meeting",
      description:
         "A parent teacher meeting will be conducted in the school auditorium.",
      audience: "Parents",
      date: "2026-02-20",
      important: false,
   },
];

export default function Notices() {
   const navigate = useNavigate();

   const [notices, setNotices] = useState(initialNotices);
   const [showForm, setShowForm] = useState(false);
   const [editingId, setEditingId] = useState(null);
   const [search, setSearch] = useState("");

   const [formData, setFormData] = useState({
      title: "",
      description: "",
      audience: "All Students",
      date: "",
      important: false,
   });

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;

      setFormData((previous) => ({
         ...previous,
         [name]: type === "checkbox" ? checked : value,
      }));
   };

   const resetForm = () => {
      setFormData({
         title: "",
         description: "",
         audience: "All Students",
         date: "",
         important: false,
      });

      setEditingId(null);
   };

   const openCreateForm = () => {
      resetForm();
      setShowForm(true);
   };

   const openEditForm = (notice) => {
      setFormData({
         title: notice.title,
         description: notice.description,
         audience: notice.audience,
         date: notice.date,
         important: notice.important,
      });

      setEditingId(notice.id);
      setShowForm(true);
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      if (!formData.title.trim()) {
         alert("Please enter notice title.");
         return;
      }

      if (!formData.description.trim()) {
         alert("Please enter notice description.");
         return;
      }

      if (!formData.date) {
         alert("Please select notice date.");
         return;
      }

      if (editingId) {
         setNotices((previous) =>
            previous.map((notice) =>
               notice.id === editingId
                  ? {
                     ...notice,
                     ...formData,
                  }
                  : notice
            )
         );
      } else {
         const newNotice = {
            id: Date.now(),
            ...formData,
         };

         setNotices((previous) => [newNotice, ...previous]);
      }

      resetForm();
      setShowForm(false);
   };

   const deleteNotice = (id) => {
      const confirmDelete = window.confirm(
         "Are you sure you want to delete this notice?"
      );

      if (!confirmDelete) return;

      setNotices((previous) =>
         previous.filter((notice) => notice.id !== id)
      );
   };

   const toggleImportant = (id) => {
      setNotices((previous) =>
         previous.map((notice) =>
            notice.id === id
               ? {
                  ...notice,
                  important: !notice.important,
               }
               : notice
         )
      );
   };

   const filteredNotices = notices.filter((notice) => {
      const searchText = search.toLowerCase();

      return (
         notice.title.toLowerCase().includes(searchText) ||
         notice.description.toLowerCase().includes(searchText) ||
         notice.audience.toLowerCase().includes(searchText)
      );
   });

   const importantCount = notices.filter(
      (notice) => notice.important
   ).length;

   return (
      <div className="min-h-screen bg-slate-100">
         {/* =========================
          HEADER
      ========================= */}

         <header className="border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
               <div>
                  <button
                     onClick={() => navigate("/admin/dashboard")}
                     className="mb-1 text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                     ← Back to Dashboard
                  </button>

                  <h1 className="text-2xl font-black text-slate-950">
                     Notices
                  </h1>

                  <p className="text-sm text-slate-500">
                     Create and manage school notices
                  </p>
               </div>

               <button
                  onClick={openCreateForm}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
               >
                  + Create Notice
               </button>
            </div>
         </header>

         {/* =========================
          MAIN
      ========================= */}

         <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* =========================
            STATS
        ========================= */}

            <div className="grid gap-4 sm:grid-cols-3">
               <StatCard
                  icon="📢"
                  title="Total Notices"
                  value={notices.length}
               />

               <StatCard
                  icon="⭐"
                  title="Important"
                  value={importantCount}
               />

               <StatCard
                  icon="👥"
                  title="Audiences"
                  value="4"
               />
            </div>

            {/* =========================
            SEARCH
        ========================= */}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                     🔍
                  </span>

                  <input
                     type="text"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Search notices..."
                     className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
               </div>
            </div>

            {/* =========================
            NOTICE LIST
        ========================= */}

            <section className="mt-8">
               <div className="mb-4">
                  <h2 className="text-xl font-black text-slate-950">
                     All Notices
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                     Manage announcements displayed on the school website.
                  </p>
               </div>

               {filteredNotices.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                     <div className="text-5xl">📢</div>

                     <h3 className="mt-4 text-lg font-black text-slate-900">
                        No notices found
                     </h3>

                     <p className="mt-1 text-sm text-slate-500">
                        Create a new notice to display announcements.
                     </p>

                     <button
                        onClick={openCreateForm}
                        className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                     >
                        + Create Notice
                     </button>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {filteredNotices.map((notice) => (
                        <div
                           key={notice.id}
                           className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                           <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                              {/* LEFT */}

                              <div className="flex gap-4">
                                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                                    📢
                                 </div>

                                 <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                       <h3 className="text-lg font-black text-slate-950">
                                          {notice.title}
                                       </h3>

                                       {notice.important && (
                                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                             ⭐ Important
                                          </span>
                                       )}
                                    </div>

                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                       {notice.description}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                       <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                          👥 {notice.audience}
                                       </span>

                                       <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                          📅 {formatDate(notice.date)}
                                       </span>
                                    </div>
                                 </div>
                              </div>

                              {/* ACTIONS */}

                              <div className="flex shrink-0 gap-2">
                                 <button
                                    onClick={() =>
                                       toggleImportant(notice.id)
                                    }
                                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${notice.important
                                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                       }`}
                                 >
                                    {notice.important
                                       ? "Unmark"
                                       : "Important"}
                                 </button>

                                 <button
                                    onClick={() => openEditForm(notice)}
                                    className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                                 >
                                    Edit
                                 </button>

                                 <button
                                    onClick={() => deleteNotice(notice.id)}
                                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                 >
                                    Delete
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>
         </main>

         {/* =========================
          CREATE / EDIT MODAL
      ========================= */}

         {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
               <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                  {/* MODAL HEADER */}

                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                     <div>
                        <h2 className="text-xl font-black text-slate-950">
                           {editingId
                              ? "Edit Notice"
                              : "Create New Notice"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                           Add announcement details below.
                        </p>
                     </div>

                     <button
                        onClick={() => {
                           setShowForm(false);
                           resetForm();
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xl font-bold text-slate-600 hover:bg-slate-200"
                     >
                        ×
                     </button>
                  </div>

                  {/* FORM */}

                  <form
                     onSubmit={handleSubmit}
                     className="space-y-5 p-6"
                  >
                     {/* TITLE */}

                     <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                           Notice Title
                        </label>

                        <input
                           type="text"
                           name="title"
                           value={formData.title}
                           onChange={handleChange}
                           placeholder="Enter notice title"
                           required
                           className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                     </div>

                     {/* DESCRIPTION */}

                     <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                           Notice Description
                        </label>

                        <textarea
                           name="description"
                           value={formData.description}
                           onChange={handleChange}
                           rows={5}
                           placeholder="Write your notice..."
                           required
                           className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                     </div>

                     {/* AUDIENCE + DATE */}

                     <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                           <label className="mb-2 block text-sm font-bold text-slate-700">
                              Audience
                           </label>

                           <select
                              name="audience"
                              value={formData.audience}
                              onChange={handleChange}
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                           >
                              <option value="All Students">
                                 All Students
                              </option>

                              <option value="Students">
                                 Students
                              </option>

                              <option value="Teachers">
                                 Teachers
                              </option>

                              <option value="Parents">
                                 Parents
                              </option>

                              <option value="Everyone">
                                 Everyone
                              </option>
                           </select>
                        </div>

                        <div>
                           <label className="mb-2 block text-sm font-bold text-slate-700">
                              Notice Date
                           </label>

                           <input
                              type="date"
                              name="date"
                              value={formData.date}
                              onChange={handleChange}
                              required
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                           />
                        </div>
                     </div>

                     {/* IMPORTANT */}

                     <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <input
                           type="checkbox"
                           name="important"
                           checked={formData.important}
                           onChange={handleChange}
                           className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <div>
                           <p className="text-sm font-bold text-slate-900">
                              Mark as Important
                           </p>

                           <p className="text-xs text-slate-500">
                              Important notices can be highlighted on the
                              public website.
                           </p>
                        </div>
                     </label>

                     {/* BUTTONS */}

                     <div className="flex gap-3 pt-2">
                        <button
                           type="button"
                           onClick={() => {
                              setShowForm(false);
                              resetForm();
                           }}
                           className="flex-1 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
                        >
                           Cancel
                        </button>

                        <button
                           type="submit"
                           className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                        >
                           {editingId
                              ? "Update Notice"
                              : "Create Notice"}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}

/* ======================================
   STAT CARD
====================================== */

function StatCard({ icon, title, value }) {
   return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
         <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
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
            Notice management
         </p>
      </div>
   );
}

/* ======================================
   DATE FORMAT
====================================== */

function formatDate(date) {
   if (!date) return "-";

   return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
   });
}