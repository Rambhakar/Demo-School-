
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
   ArrowLeft, LayoutDashboard, UserRound, GraduationCap,
   Mail, Phone, MapPin, CalendarDays, BookOpen,
   ShieldCheck, Pencil, Save, X, Camera, RefreshCw,
   CheckCircle2, AlertCircle, Briefcase, IdCard,
   Award, User, AtSign, Map, Building2, Sparkles
} from "lucide-react";

const API_URL = (
   import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () =>
   localStorage.getItem("schoolToken") ||
   sessionStorage.getItem("schoolToken") ||
   localStorage.getItem("token") ||
   sessionStorage.getItem("token");

const EMPTY_FORM = {
   name: "",
   fatherName: "",
   subject: "",
   qualification: "",
   phone: "",
   email: "",
   address: "",
   city: "",
   state: "",
   joiningDate: "",
   profilePhoto: "",
};

async function request(url, options = {}) {
   const token = getToken();

   if (!token) {
      throw new Error("Teacher login session nahi mili. Please login again.");
   }

   const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
         Authorization: `Bearer ${token}`,
         ...(options.body ? { "Content-Type": "application/json" } : {}),
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
         data.message || "Request complete nahi ho saki."
      );
   }

   return data;
}

function getTeacherFromResponse(data) {
   return data?.teacher || data?.data?.teacher || null;
}

function formatDate(value) {
   if (!value) return "Not available";

   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return "Not available";

   return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
   });
}

function formatDateInput(value) {
   if (!value) return "";

   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return "";

   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");

   return `${year}-${month}-${day}`;
}

function createForm(teacher) {
   return {
      name: teacher?.name || teacher?.user?.name || "",
      fatherName: teacher?.fatherName || "",
      subject: teacher?.subject || "",
      qualification: teacher?.qualification || "",
      phone: teacher?.phone || "",
      email: teacher?.email || "",
      address: teacher?.address || "",
      city: teacher?.city || "",
      state: teacher?.state || "",
      joiningDate: formatDateInput(teacher?.joiningDate),
      profilePhoto: teacher?.profilePhoto || "",
   };
}

function compressImage(file) {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
         const image = new Image();

         image.onload = () => {
            const max = 700;
            let width = image.width;
            let height = image.height;

            if (width > max || height > max) {
               if (width > height) {
                  height = Math.round((height / width) * max);
                  width = max;
               } else {
                  width = Math.round((width / height) * max);
                  height = max;
               }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            if (!context) {
               reject(new Error("Photo process nahi ho saki."));
               return;
            }

            context.drawImage(image, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.78));
         };

         image.onerror = () => reject(new Error("Invalid image file."));
         image.src = event.target.result;
      };

      reader.onerror = () => reject(new Error("File read nahi ho saki."));
      reader.readAsDataURL(file);
   });
}

export default function Profile() {
   const [teacher, setTeacher] = useState(null);
   const [form, setForm] = useState(EMPTY_FORM);

   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [editMode, setEditMode] = useState(false);

   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");

   const loadProfile = useCallback(async () => {
      try {
         setLoading(true);
         setError("");

         const data = await request("/api/teacher/profile");
         const teacherData = getTeacherFromResponse(data);

         if (!teacherData) {
            throw new Error("Teacher profile database mein nahi mili.");
         }

         setTeacher(teacherData);
         setForm(createForm(teacherData));
      } catch (err) {
         console.error("Teacher profile error:", err);
         setError(err.message || "Profile load nahi hui.");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      loadProfile();
   }, [loadProfile]);

   const handleChange = (event) => {
      const { name, value } = event.target;

      setForm((old) => ({
         ...old,
         [name]: value,
      }));

      setError("");
      setSuccess("");
   };

   const handlePhoto = async (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
         setError("Sirf image file select karein.");
         return;
      }

      if (file.size > 5 * 1024 * 1024) {
         setError("Photo 5MB se chhoti honi chahiye.");
         return;
      }

      try {
         setError("");
         const image = await compressImage(file);

         setForm((old) => ({
            ...old,
            profilePhoto: image,
         }));
      } catch (err) {
         setError(err.message || "Photo process nahi ho saki.");
      }

      event.target.value = "";
   };

   const handleSave = async (event) => {
      event.preventDefault();

      if (!form.name.trim()) {
         setError("Teacher ka naam required hai.");
         return;
      }

      try {
         setSaving(true);
         setError("");
         setSuccess("");

         const updateData = {
            name: form.name.trim(),
            fatherName: form.fatherName,
            subject: form.subject,
            qualification: form.qualification,
            phone: form.phone,
            email: form.email,
            address: form.address,
            city: form.city,
            state: form.state,
            joiningDate: form.joiningDate,
            profilePhoto: form.profilePhoto,
         };

         const data = await request("/api/teacher/profile", {
            method: "PUT",
            body: JSON.stringify(updateData),
         });

         const updatedTeacher =
            getTeacherFromResponse(data) || {
               ...teacher,
               ...updateData,
            };

         setTeacher(updatedTeacher);
         setForm(createForm(updatedTeacher));
         setEditMode(false);
         setSuccess("Profile successfully update ho gayi.");

         window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
         console.error("Update profile error:", err);
         setError(err.message || "Profile update nahi hui.");
      } finally {
         setSaving(false);
      }
   };

   const cancelEdit = () => {
      setForm(createForm(teacher));
      setEditMode(false);
      setError("");
      setSuccess("");
   };

   if (loading) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-[#080d1b] text-white">
            <div className="text-center">
               <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
               <p className="mt-4 text-sm text-slate-400">
                  Teacher profile load ho rahi hai...
               </p>
            </div>
         </div>
      );
   }

   if (!teacher) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-[#080d1b] px-4 text-white">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
               <AlertCircle className="mx-auto h-12 w-12 text-rose-400" />
               <h2 className="mt-5 text-2xl font-bold">Profile Not Found</h2>
               <p className="mt-3 text-sm text-slate-400">
                  {error || "Teacher profile database mein nahi mili."}
               </p>

               <button
                  onClick={loadProfile}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
               >
                  Try Again
               </button>

               <Link
                  to="/teacher/dashboard"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"
               >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
               </Link>
            </div>
         </div>
      );
   }

   const name =
      teacher.name || teacher.user?.name || "Teacher";

   const teacherId =
      teacher.teacherId || teacher.user?.userId || "N/A";

   const photo =
      form.profilePhoto || teacher.profilePhoto || "";

   const isActive = teacher.isActive !== false;

   return (
      <div className="min-h-screen overflow-hidden bg-[#080d1b] text-white">
         <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* PREMIUM PAGE HEADER */}
            <header className="relative mb-7 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#192747] via-[#111a31] to-[#0b1223] shadow-2xl shadow-black/30">
               <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
               <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

               <div className="relative p-5 sm:p-8">
                  <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
                     <Link
                        to="/teacher/dashboard"
                        className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-slate-200 transition hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-indigo-500/15 hover:text-white"
                     >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 transition group-hover:bg-indigo-500 group-hover:text-white">
                           <ArrowLeft className="h-5 w-5" />
                        </span>
                        <span>
                           <span className="block">Back to Dashboard</span>
                           <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
                              Teacher Dashboard
                           </span>
                        </span>
                     </Link>

                     <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">
                           Teacher Portal Active
                        </span>
                     </div>
                  </div>

                  <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                     <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                           <GraduationCap className="h-4 w-4" />
                           Teacher Workspace
                        </div>

                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                           My Profile
                           <span className="mt-1 block bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">
                              Personal Space
                           </span>
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                           View and manage your personal information,
                           professional details and contact information.
                        </p>
                     </div>

                     <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[350px]">
                        <MiniInfo
                           icon={IdCard}
                           label="Teacher ID"
                           value={teacherId}
                        />
                        <MiniInfo
                           icon={ShieldCheck}
                           label="Account Status"
                           value={isActive ? "Active" : "Inactive"}
                        />
                     </div>
                  </div>
               </div>
            </header>

            {/* ALERTS */}
            {error && (
               <Alert type="error" message={error} />
            )}

            {success && (
               <Alert type="success" message={success} />
            )}

            {/* PROFILE HERO */}
            <section className="relative mb-7 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#151f39] to-[#10182b] shadow-xl">
               <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-indigo-600/50 via-violet-600/30 to-blue-600/30" />
               <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

               <div className="relative px-5 pb-7 sm:px-8">
                  <div className="flex flex-col gap-5 pt-16 sm:flex-row sm:items-end">
                     <div className="relative mx-auto sm:mx-0">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[28px] border-4 border-[#151f39] bg-indigo-500/20 text-4xl font-black text-indigo-200 shadow-2xl sm:h-36 sm:w-36">
                           {photo ? (
                              <img
                                 src={photo}
                                 alt={name}
                                 className="h-full w-full object-cover"
                              />
                           ) : (
                              name.charAt(0).toUpperCase()
                           )}
                        </div>

                        {editMode && (
                           <label className="absolute -bottom-2 -right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-4 border-[#151f39] bg-indigo-600 text-white shadow-xl transition hover:bg-indigo-500">
                              <Camera className="h-5 w-5" />
                              <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handlePhoto}
                                 className="hidden"
                              />
                           </label>
                        )}
                     </div>

                     <div className="min-w-0 flex-1 text-center sm:pb-1 sm:text-left">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                           <h2 className="text-2xl font-black text-white sm:text-3xl">
                              {name}
                           </h2>
                           <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${isActive
                                 ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                 : "border-rose-400/20 bg-rose-400/10 text-rose-300"
                              }`}>
                              {isActive ? "ACTIVE" : "INACTIVE"}
                           </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                           Teacher ID: <span className="font-bold text-indigo-300">{teacherId}</span>
                        </p>

                        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                           {teacher.subject && (
                              <Pill icon={BookOpen} text={teacher.subject} />
                           )}
                           <Pill icon={GraduationCap} text="Teacher" />
                           {teacher.qualification && (
                              <Pill icon={Award} text={teacher.qualification} />
                           )}
                        </div>
                     </div>

                     <div className="flex flex-wrap justify-center gap-2 sm:pb-1">
                        {!editMode ? (
                           <button
                              onClick={() => {
                                 setError("");
                                 setSuccess("");
                                 setEditMode(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                           >
                              <Pencil className="h-4 w-4" />
                              Edit Profile
                           </button>
                        ) : (
                           <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 disabled:opacity-50"
                           >
                              <X className="h-4 w-4" />
                              Cancel Edit
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </section>

            {/* EDIT FORM */}
            {editMode ? (
               <form
                  onSubmit={handleSave}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl"
               >
                  <div className="border-b border-white/10 p-5 sm:p-7">
                     <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                           <Pencil className="h-5 w-5" />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold">Edit Your Profile</h2>
                           <p className="mt-1 text-xs text-slate-400">
                              Update your details and save your changes.
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                     <FormInput label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                     <FormInput label="Father's Name" name="fatherName" value={form.fatherName} onChange={handleChange} />
                     <FormInput label="Subject" name="subject" value={form.subject} onChange={handleChange} />
                     <FormInput label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} />
                     <FormInput label="Phone Number" name="phone" value={form.phone} onChange={handleChange} type="tel" />
                     <FormInput label="Email Address" name="email" value={form.email} onChange={handleChange} type="email" />
                     <FormInput label="City" name="city" value={form.city} onChange={handleChange} />
                     <FormInput label="State" name="state" value={form.state} onChange={handleChange} />
                     <FormInput label="Joining Date" name="joiningDate" value={form.joiningDate} onChange={handleChange} type="date" />

                     <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                           Teacher ID
                        </label>
                        <input
                           value={teacherId}
                           disabled
                           className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-500"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                           Teacher ID admin ke dwara assigned hai.
                        </p>
                     </div>

                     <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                           Address
                        </label>
                        <textarea
                           name="address"
                           value={form.address}
                           onChange={handleChange}
                           rows={4}
                           placeholder="Enter your full address..."
                           className="w-full resize-y rounded-xl border border-white/10 bg-[#111a2d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                     </div>

                     {/* PHOTO PREVIEW */}
                     <div className="sm:col-span-2">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                           <div className="flex flex-wrap items-center gap-4">
                              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-indigo-500/15 text-2xl font-bold text-indigo-300">
                                 {photo ? (
                                    <img src={photo} alt="Preview" className="h-full w-full object-cover" />
                                 ) : (
                                    name.charAt(0).toUpperCase()
                                 )}
                              </div>
                              <div className="flex-1">
                                 <h3 className="font-bold">Profile Photo</h3>
                                 <p className="mt-1 text-xs text-slate-400">
                                    JPG, PNG or WebP. Maximum 5MB.
                                 </p>
                                 <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10">
                                    <Camera className="h-4 w-4" />
                                    Choose Photo
                                    <input
                                       type="file"
                                       accept="image/*"
                                       onChange={handlePhoto}
                                       className="hidden"
                                    />
                                 </label>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:p-7">
                     <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                     >
                        Cancel
                     </button>

                     <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 disabled:opacity-50"
                     >
                        {saving ? (
                           <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Saving Profile...
                           </>
                        ) : (
                           <>
                              <Save className="h-4 w-4" />
                              Save Changes
                           </>
                        )}
                     </button>
                  </div>
               </form>
            ) : (
               <>
                  {/* PROFILE HIGHLIGHTS */}
                  <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                     <HighlightCard
                        icon={BookOpen}
                        label="Main Subject"
                        value={teacher.subject || "Not available"}
                        color="indigo"
                     />
                     <HighlightCard
                        icon={Award}
                        label="Qualification"
                        value={teacher.qualification || "Not available"}
                        color="violet"
                     />
                     <HighlightCard
                        icon={CalendarDays}
                        label="Joining Date"
                        value={formatDate(teacher.joiningDate)}
                        color="cyan"
                     />
                     <HighlightCard
                        icon={ShieldCheck}
                        label="Account Status"
                        value={isActive ? "Active" : "Inactive"}
                        color={isActive ? "emerald" : "rose"}
                     />
                  </section>

                  {/* PERSONAL INFORMATION */}
                  <Section
                     icon={User}
                     title="Personal Information"
                     subtitle="Your basic personal details"
                  >
                     <InfoItem icon={UserRound} label="Full Name" value={name} />
                     <InfoItem icon={IdCard} label="Teacher ID" value={teacherId} />
                     <InfoItem icon={User} label="Father's Name" value={teacher.fatherName} />
                     <InfoItem icon={CalendarDays} label="Joining Date" value={formatDate(teacher.joiningDate)} />
                  </Section>

                  {/* PROFESSIONAL INFORMATION */}
                  <Section
                     icon={Briefcase}
                     title="Professional Information"
                     subtitle="Your teaching and qualification details"
                  >
                     <InfoItem icon={BookOpen} label="Main Subject" value={teacher.subject} />
                     <InfoItem icon={Award} label="Qualification" value={teacher.qualification} />
                     <InfoItem icon={GraduationCap} label="Role" value="Teacher" />
                  </Section>

                  {/* CONTACT INFORMATION */}
                  <Section
                     icon={MapPin}
                     title="Contact Information"
                     subtitle="Your contact and location details"
                  >
                     <InfoItem icon={Phone} label="Phone Number" value={teacher.phone} />
                     <InfoItem icon={Mail} label="Email Address" value={teacher.email} />
                     <InfoItem icon={Map} label="City" value={teacher.city} />
                     <InfoItem icon={Building2} label="State" value={teacher.state} />
                     <InfoItem icon={MapPin} label="Address" value={teacher.address} wide />
                  </Section>
               </>
            )}

            {/* BOTTOM NAVIGATION */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row">
               <div>
                  <p className="text-sm font-bold text-slate-200">
                     Teacher Workspace
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                     Manage your teaching profile and account details.
                  </p>
               </div>

               <Link
                  to="/teacher/dashboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-3 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500 hover:text-white sm:w-auto"
               >
                  <LayoutDashboard className="h-4 w-4" />
                  Back to Teacher Dashboard
                  <ArrowLeft className="h-4 w-4 rotate-180" />
               </Link>
            </div>

            <footer className="py-7 text-center text-xs text-slate-600">
               <div className="mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Teacher Profile Management
               </div>
               Your profile information is managed through your school account.
            </footer>
         </div>
      </div>
   );
}

/* =========================================
   REUSABLE COMPONENTS
========================================= */

function MiniInfo({ icon: Icon, label, value }) {
   return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
         <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
               <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {label}
               </p>
               <p className="mt-1 truncate text-sm font-extrabold text-white">
                  {value}
               </p>
            </div>
         </div>
      </div>
   );
}

function Pill({ icon: Icon, text }) {
   return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-300">
         <Icon className="h-3.5 w-3.5 text-indigo-300" />
         {text}
      </span>
   );
}

function HighlightCard({ icon: Icon, label, value, color }) {
   const styles = {
      indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
      violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
      cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
   };

   return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">
         <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400">{label}</span>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${styles[color]}`}>
               <Icon className="h-5 w-5" />
            </span>
         </div>
         <p className="mt-4 break-words text-lg font-black text-white">{value}</p>
      </div>
   );
}

function Section({ icon: Icon, title, subtitle, children }) {
   return (
      <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10">
         <div className="flex items-center gap-4 border-b border-white/10 p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
               <Icon className="h-5 w-5" />
            </div>
            <div>
               <h2 className="text-lg font-bold text-white">{title}</h2>
               <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
            </div>
         </div>

         <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {children}
         </div>
      </section>
   );
}

function InfoItem({ icon: Icon, label, value, wide = false }) {
   return (
      <div className={`rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
         <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
               <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
               <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {label}
               </p>
               <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-200">
                  {value || "Not available"}
               </p>
            </div>
         </div>
      </div>
   );
}

function FormInput({
   label,
   name,
   value,
   onChange,
   type = "text",
   required = false,
}) {
   return (
      <div>
         <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label} {required && <span className="text-rose-400">*</span>}
         </label>
         <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            required={required}
            className="w-full rounded-xl border border-white/10 bg-[#111a2d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
         />
      </div>
   );
}

function Alert({ type, message }) {
   const isSuccess = type === "success";

   return (
      <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${isSuccess
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-rose-500/30 bg-rose-500/10 text-rose-300"
         }`}>
         {isSuccess
            ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
         }
         <span>{message}</span>
      </div>
   );
}
