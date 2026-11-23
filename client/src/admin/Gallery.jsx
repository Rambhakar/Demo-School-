import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Gallery() {
   const navigate = useNavigate();

   const [images, setImages] = useState([
      {
         id: 1,
         title: "Annual Function",
         category: "Events",
         image:
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
      },
      {
         id: 2,
         title: "School Campus",
         category: "Campus",
         image:
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80",
      },
      {
         id: 3,
         title: "Students Activity",
         category: "Students",
         image:
            "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
      },
   ]);

   const [showForm, setShowForm] = useState(false);

   const [formData, setFormData] = useState({
      title: "",
      category: "Events",
      image: "",
   });

   const [preview, setPreview] = useState("");

   const handleChange = (e) => {
      const { name, value } = e.target;

      setFormData((previous) => ({
         ...previous,
         [name]: value,
      }));

      if (name === "image") {
         setPreview(value);
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      if (!formData.title || !formData.image) {
         alert("Please enter title and image URL.");
         return;
      }

      const newImage = {
         id: Date.now(),
         title: formData.title,
         category: formData.category,
         image: formData.image,
      };

      setImages((previous) => [newImage, ...previous]);

      setFormData({
         title: "",
         category: "Events",
         image: "",
      });

      setPreview("");
      setShowForm(false);
   };

   const deleteImage = (id) => {
      const confirmDelete = window.confirm(
         "Are you sure you want to delete this image?"
      );

      if (!confirmDelete) return;

      setImages((previous) =>
         previous.filter((image) => image.id !== id)
      );
   };

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
                     Gallery
                  </h1>

                  <p className="text-sm text-slate-500">
                     Manage school gallery images
                  </p>
               </div>

               <button
                  onClick={() => setShowForm(true)}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
               >
                  + Add Image
               </button>
            </div>
         </header>

         {/* =========================
          CONTENT
      ========================= */}
         <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* TOP INFO */}
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
               <p className="text-sm font-semibold text-blue-100">
                  School Gallery
               </p>

               <h2 className="mt-1 text-2xl font-black">
                  Photos & Memories
               </h2>

               <p className="mt-2 max-w-2xl text-sm text-blue-100">
                  Add school events, campus photos, student activities
                  and other important moments.
               </p>
            </div>

            {/* =========================
            STATS
        ========================= */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
               <StatCard
                  icon="🖼️"
                  title="Total Images"
                  value={images.length}
               />

               <StatCard
                  icon="🎉"
                  title="Events"
                  value={
                     images.filter(
                        (image) => image.category === "Events"
                     ).length
                  }
               />

               <StatCard
                  icon="🏫"
                  title="Campus"
                  value={
                     images.filter(
                        (image) => image.category === "Campus"
                     ).length
                  }
               />
            </div>

            {/* =========================
            GALLERY
        ========================= */}
            {images.length === 0 ? (
               <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <div className="text-5xl">🖼️</div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                     No images found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                     Add your first gallery image.
                  </p>

                  <button
                     onClick={() => setShowForm(true)}
                     className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                  >
                     + Add Image
                  </button>
               </div>
            ) : (
               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((item) => (
                     <div
                        key={item.id}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                     >
                        {/* IMAGE */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                           <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                           />

                           <div className="absolute left-3 top-3">
                              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-700 shadow">
                                 {item.category}
                              </span>
                           </div>

                           {/* DELETE */}
                           <button
                              onClick={() => deleteImage(item.id)}
                              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-red-600"
                              title="Delete image"
                           >
                              🗑️
                           </button>
                        </div>

                        {/* DETAILS */}
                        <div className="p-5">
                           <h3 className="text-lg font-black text-slate-900">
                              {item.title}
                           </h3>

                           <p className="mt-1 text-sm text-slate-500">
                              {item.category}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </main>

         {/* =========================
          ADD IMAGE MODAL
      ========================= */}
         {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
               <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
                  {/* MODAL HEADER */}
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                     <div>
                        <h2 className="text-xl font-black text-slate-950">
                           Add Gallery Image
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                           Add a new image to the school gallery.
                        </p>
                     </div>

                     <button
                        onClick={() => {
                           setShowForm(false);
                           setPreview("");
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
                           Image Title
                        </label>

                        <input
                           type="text"
                           name="title"
                           value={formData.title}
                           onChange={handleChange}
                           placeholder="e.g. Annual Function 2026"
                           required
                           className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                     </div>

                     {/* CATEGORY */}
                     <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                           Category
                        </label>

                        <select
                           name="category"
                           value={formData.category}
                           onChange={handleChange}
                           className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                           <option value="Events">Events</option>
                           <option value="Campus">Campus</option>
                           <option value="Students">Students</option>
                           <option value="Sports">Sports</option>
                           <option value="Activities">Activities</option>
                           <option value="Other">Other</option>
                        </select>
                     </div>

                     {/* IMAGE URL */}
                     <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                           Image URL
                        </label>

                        <input
                           type="url"
                           name="image"
                           value={formData.image}
                           onChange={handleChange}
                           placeholder="https://example.com/image.jpg"
                           required
                           className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                           Paste a publicly accessible image URL.
                        </p>
                     </div>

                     {/* PREVIEW */}
                     {preview && (
                        <div>
                           <p className="mb-2 text-sm font-bold text-slate-700">
                              Preview
                           </p>

                           <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                              <img
                                 src={preview}
                                 alt="Preview"
                                 className="max-h-64 w-full object-cover"
                                 onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                 }}
                              />
                           </div>
                        </div>
                     )}

                     {/* BUTTONS */}
                     <div className="flex gap-3 pt-2">
                        <button
                           type="button"
                           onClick={() => {
                              setShowForm(false);
                              setPreview("");
                           }}
                           className="flex-1 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
                        >
                           Cancel
                        </button>

                        <button
                           type="submit"
                           className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                        >
                           Add Image
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
            Gallery management
         </p>
      </div>
   );
}