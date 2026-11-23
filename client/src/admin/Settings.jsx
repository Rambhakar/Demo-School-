import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
   import.meta.env.VITE_API_URL ||
   "http://localhost:5000";

const DEFAULT_SCHOOL = {
   schoolName: "Demo School",
   schoolCode: "SCH001",
   principalName: "",
   email: "",
   phone: "",
   alternatePhone: "",
   website: "",
   address: "",
   city: "",
   state: "",
   pincode: "",
   affiliation: "",
   establishedYear: "",
};

const DEFAULT_NOTIFICATIONS = {
   newAdmission: true,
   admissionStatus: true,
   newStudent: true,
   newTeacher: true,
   systemUpdates: true,
};

const DEFAULT_WEBSITE = {
   maintenanceMode: false,
   showAdmissions: true,
   showNotices: true,
   showGallery: true,
   showContact: true,
};

const DEFAULT_APPEARANCE = {
   compactMode: false,
   showAnimations: true,
   sidebarCollapsed: false,
};

export default function Settings() {
   const navigate = useNavigate();

   const [activeTab, setActiveTab] =
      useState("school");

   const [saved, setSaved] =
      useState(false);

   const [message, setMessage] =
      useState("");

   const [messageType, setMessageType] =
      useState("success");

   const [adminUser, setAdminUser] =
      useState(null);

   const [schoolSettings, setSchoolSettings] =
      useState(DEFAULT_SCHOOL);

   const [adminSettings, setAdminSettings] =
      useState({
         name: "",
         email: "",
         phone: "",
      });

   const [passwordData, setPasswordData] =
      useState({
         currentPassword: "",
         newPassword: "",
         confirmPassword: "",
      });

   const [showCurrentPassword, setShowCurrentPassword] =
      useState(false);

   const [showNewPassword, setShowNewPassword] =
      useState(false);

   const [showConfirmPassword, setShowConfirmPassword] =
      useState(false);

   const [changingPassword, setChangingPassword] =
      useState(false);

   const [notifications, setNotifications] =
      useState(DEFAULT_NOTIFICATIONS);

   const [websiteSettings, setWebsiteSettings] =
      useState(DEFAULT_WEBSITE);

   const [appearance, setAppearance] =
      useState(DEFAULT_APPEARANCE);

   const [copied, setCopied] =
      useState(false);

   const [showDangerZone, setShowDangerZone] =
      useState(false);

   /* =====================================================
      GET TOKEN
   ===================================================== */

   const getToken = () => {
      return (
         localStorage.getItem("schoolToken") ||
         sessionStorage.getItem("schoolToken") ||
         ""
      );
   };

   /* =====================================================
      GET USER
   ===================================================== */

   const getStoredUser = () => {
      const stored =
         localStorage.getItem("schoolUser") ||
         sessionStorage.getItem("schoolUser");

      if (!stored) return null;

      try {
         return JSON.parse(stored);
      } catch {
         return null;
      }
   };

   /* =====================================================
      SHOW MESSAGE
   ===================================================== */

   const showMessage = (
      text,
      type = "success"
   ) => {
      setMessage(text);
      setMessageType(type);

      setTimeout(() => {
         setMessage("");
      }, 3500);
   };

   /* =====================================================
      LOAD SETTINGS
   ===================================================== */

   useEffect(() => {
      const user = getStoredUser();

      if (user) {
         setAdminUser(user);

         setAdminSettings({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
         });
      }

      try {
         const savedSchool =
            localStorage.getItem(
               "schoolSettings"
            );

         if (savedSchool) {
            setSchoolSettings(
               JSON.parse(savedSchool)
            );
         }

         const savedNotifications =
            localStorage.getItem(
               "schoolNotifications"
            );

         if (savedNotifications) {
            setNotifications(
               JSON.parse(savedNotifications)
            );
         }

         const savedWebsite =
            localStorage.getItem(
               "schoolWebsiteSettings"
            );

         if (savedWebsite) {
            setWebsiteSettings(
               JSON.parse(savedWebsite)
            );
         }

         const savedAppearance =
            localStorage.getItem(
               "schoolAppearance"
            );

         if (savedAppearance) {
            setAppearance(
               JSON.parse(savedAppearance)
            );
         }
      } catch (error) {
         console.error(
            "Settings load error:",
            error
         );
      }
   }, []);

   /* =====================================================
      SCHOOL CHANGE
   ===================================================== */

   const handleSchoolChange = (e) => {
      const {
         name,
         value,
      } = e.target;

      setSchoolSettings((previous) => ({
         ...previous,
         [name]: value,
      }));

      setSaved(false);
   };

   /* =====================================================
      ADMIN CHANGE
   ===================================================== */

   const handleAdminChange = (e) => {
      const {
         name,
         value,
      } = e.target;

      setAdminSettings((previous) => ({
         ...previous,
         [name]: value,
      }));

      setSaved(false);
   };

   /* =====================================================
      PASSWORD CHANGE
   ===================================================== */

   const handlePasswordChange = (e) => {
      const {
         name,
         value,
      } = e.target;

      setPasswordData((previous) => ({
         ...previous,
         [name]: value,
      }));

      setMessage("");
   };

   /* =====================================================
      NOTIFICATION CHANGE
   ===================================================== */

   const handleNotificationChange = (e) => {
      const {
         name,
         checked,
      } = e.target;

      setNotifications((previous) => ({
         ...previous,
         [name]: checked,
      }));

      setSaved(false);
   };

   /* =====================================================
      WEBSITE CHANGE
   ===================================================== */

   const handleWebsiteChange = (e) => {
      const {
         name,
         checked,
      } = e.target;

      setWebsiteSettings((previous) => ({
         ...previous,
         [name]: checked,
      }));

      setSaved(false);
   };

   /* =====================================================
      APPEARANCE CHANGE
   ===================================================== */

   const handleAppearanceChange = (e) => {
      const {
         name,
         checked,
      } = e.target;

      setAppearance((previous) => ({
         ...previous,
         [name]: checked,
      }));

      setSaved(false);
   };

   /* =====================================================
      SAVE SCHOOL
   ===================================================== */

   const saveSchoolSettings = (e) => {
      e.preventDefault();

      localStorage.setItem(
         "schoolSettings",
         JSON.stringify(schoolSettings)
      );

      setSaved(true);

      showMessage(
         "School settings saved successfully."
      );
   };

   /* =====================================================
      SAVE ADMIN PROFILE
   ===================================================== */

   const saveAdminProfile = (e) => {
      e.preventDefault();

      const storedUser =
         getStoredUser();

      if (!storedUser) {
         showMessage(
            "Admin account not found.",
            "error"
         );

         return;
      }

      const updatedUser = {
         ...storedUser,
         name: adminSettings.name,
         email: adminSettings.email,
         phone: adminSettings.phone,
      };

      if (
         localStorage.getItem(
            "schoolUser"
         )
      ) {
         localStorage.setItem(
            "schoolUser",
            JSON.stringify(updatedUser)
         );
      }

      if (
         sessionStorage.getItem(
            "schoolUser"
         )
      ) {
         sessionStorage.setItem(
            "schoolUser",
            JSON.stringify(updatedUser)
         );
      }

      setAdminUser(updatedUser);

      setSaved(true);

      showMessage(
         "Admin profile updated successfully."
      );
   };

   /* =====================================================
      CHANGE PASSWORD
   ===================================================== */

   const handlePasswordSubmit = async (
      e
   ) => {
      e.preventDefault();

      setMessage("");

      if (
         !passwordData.currentPassword ||
         !passwordData.newPassword ||
         !passwordData.confirmPassword
      ) {
         showMessage(
            "Please fill all password fields.",
            "error"
         );

         return;
      }

      if (
         passwordData.newPassword.length < 6
      ) {
         showMessage(
            "New password must contain at least 6 characters.",
            "error"
         );

         return;
      }

      if (
         passwordData.newPassword !==
         passwordData.confirmPassword
      ) {
         showMessage(
            "New password and confirm password do not match.",
            "error"
         );

         return;
      }

      if (
         passwordData.currentPassword ===
         passwordData.newPassword
      ) {
         showMessage(
            "New password must be different from current password.",
            "error"
         );

         return;
      }

      const token = getToken();

      const user =
         adminUser || getStoredUser();

      const userId =
         user?.userId ||
         user?._id;

      if (!token || !userId) {
         showMessage(
            "Admin session not found. Please login again.",
            "error"
         );

         return;
      }

      try {
         setChangingPassword(true);

         const response = await fetch(
            `${API_URL}/api/admin/users/${userId}/password`,
            {
               method: "PATCH",

               headers: {
                  Authorization:
                     `Bearer ${token}`,

                  "Content-Type":
                     "application/json",
               },

               body: JSON.stringify({
                  currentPassword:
                     passwordData.currentPassword,

                  newPassword:
                     passwordData.newPassword,
               }),
            }
         );

         const data =
            await response.json();

         if (!response.ok) {
            throw new Error(
               data?.message ||
               "Unable to change password."
            );
         }

         setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
         });

         showMessage(
            "Password changed successfully."
         );
      } catch (error) {
         console.error(
            "Password change error:",
            error
         );

         showMessage(
            error.message ||
            "Password change failed.",
            "error"
         );
      } finally {
         setChangingPassword(false);
      }
   };

   /* =====================================================
      SAVE NOTIFICATIONS
   ===================================================== */

   const saveNotifications = () => {
      localStorage.setItem(
         "schoolNotifications",
         JSON.stringify(notifications)
      );

      setSaved(true);

      showMessage(
         "Notification preferences saved."
      );
   };

   /* =====================================================
      SAVE WEBSITE
   ===================================================== */

   const saveWebsiteSettings = () => {
      localStorage.setItem(
         "schoolWebsiteSettings",
         JSON.stringify(
            websiteSettings
         )
      );

      setSaved(true);

      showMessage(
         "Website settings saved."
      );
   };

   /* =====================================================
      SAVE APPEARANCE
   ===================================================== */

   const saveAppearance = () => {
      localStorage.setItem(
         "schoolAppearance",
         JSON.stringify(
            appearance
         )
      );

      setSaved(true);

      showMessage(
         "Appearance settings saved."
      );
   };

   /* =====================================================
      COPY SCHOOL CODE
   ===================================================== */

   const copySchoolCode = async () => {
      if (!schoolSettings.schoolCode) {
         showMessage(
            "School code is empty.",
            "error"
         );

         return;
      }

      try {
         await navigator.clipboard.writeText(
            schoolSettings.schoolCode
         );

         setCopied(true);

         setTimeout(() => {
            setCopied(false);
         }, 2000);
      } catch {
         showMessage(
            "Unable to copy school code.",
            "error"
         );
      }
   };

   /* =====================================================
      RESET SCHOOL
   ===================================================== */

   const resetSchoolSettings = () => {
      const confirmReset =
         window.confirm(
            "Are you sure you want to reset school settings?"
         );

      if (!confirmReset) return;

      setSchoolSettings(
         DEFAULT_SCHOOL
      );

      localStorage.removeItem(
         "schoolSettings"
      );

      showMessage(
         "School settings reset."
      );
   };

   /* =====================================================
      RESET ALL SETTINGS
   ===================================================== */

   const resetAllSettings = () => {
      const confirmReset =
         window.confirm(
            "This will reset all locally saved settings. Continue?"
         );

      if (!confirmReset) return;

      localStorage.removeItem(
         "schoolSettings"
      );

      localStorage.removeItem(
         "schoolNotifications"
      );

      localStorage.removeItem(
         "schoolWebsiteSettings"
      );

      localStorage.removeItem(
         "schoolAppearance"
      );

      setSchoolSettings(
         DEFAULT_SCHOOL
      );

      setNotifications(
         DEFAULT_NOTIFICATIONS
      );

      setWebsiteSettings(
         DEFAULT_WEBSITE
      );

      setAppearance(
         DEFAULT_APPEARANCE
      );

      showMessage(
         "All local settings have been reset."
      );
   };

   /* =====================================================
      LOGOUT
   ===================================================== */

   const logout = () => {
      const confirmed =
         window.confirm(
            "Are you sure you want to logout?"
         );

      if (!confirmed) return;

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

      navigate("/", {
         replace: true,
      });
   };

   /* =====================================================
      TABS
   ===================================================== */

   const tabs = [
      {
         id: "school",
         icon: "🏫",
         title: "School",
         description:
            "School information",
      },

      {
         id: "profile",
         icon: "👤",
         title: "Admin Profile",
         description:
            "Your account",
      },

      {
         id: "security",
         icon: "🔐",
         title: "Security",
         description:
            "Password & security",
      },

      {
         id: "notifications",
         icon: "🔔",
         title: "Notifications",
         description:
            "Notification preferences",
      },

      {
         id: "website",
         icon: "🌐",
         title: "Website",
         description:
            "Website controls",
      },

      {
         id: "appearance",
         icon: "🎨",
         title: "Appearance",
         description:
            "Dashboard appearance",
      },

      {
         id: "system",
         icon: "⚙️",
         title: "System",
         description:
            "System tools",
      },
   ];

   /* =====================================================
      RENDER
   ===================================================== */

   return (
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900">

         {/* =================================================
             TOP HEADER
         ================================================= */}

         <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

            <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

               <div className="flex items-center gap-4">

                  <button
                     type="button"
                     onClick={() =>
                        navigate("/admin")
                     }
                     className="flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                  >
                     ←
                     <span className="hidden sm:inline">
                        Dashboard
                     </span>
                  </button>

                  <div className="hidden h-8 w-px bg-slate-200 sm:block" />

                  <div>
                     <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                        Settings
                     </h1>

                     <p className="hidden text-xs font-semibold text-slate-400 sm:block">
                        School administration control center
                     </p>
                  </div>

               </div>

               <div className="flex items-center gap-3">

                  {saved && (
                     <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 md:flex">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                           ✓
                        </span>

                        Saved
                     </div>
                  )}

                  <button
                     type="button"
                     onClick={logout}
                     className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-100"
                  >
                     Logout
                  </button>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-black text-white shadow-sm">
                     {adminSettings.name
                        ? adminSettings.name
                           .charAt(0)
                           .toUpperCase()
                        : "A"}
                  </div>

               </div>

            </div>

         </header>

         {/* =================================================
             MESSAGE
         ================================================= */}

         {message && (
            <div className="fixed right-5 top-24 z-[100] w-[calc(100%-40px)] max-w-md">

               <div
                  className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl ${messageType ===
                        "error"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                     }`}
               >

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black">
                     {messageType ===
                        "error"
                        ? "!"
                        : "✓"}
                  </div>

                  <div>
                     <p className="text-sm font-black">
                        {messageType ===
                           "error"
                           ? "Something went wrong"
                           : "Success"}
                     </p>

                     <p className="mt-1 text-xs font-semibold">
                        {message}
                     </p>
                  </div>

               </div>

            </div>
         )}

         {/* =================================================
             MAIN
         ================================================= */}

         <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

            <div className="grid gap-6 lg:grid-cols-[290px_1fr]">

               {/* =================================================
                   SETTINGS SIDEBAR
               ================================================= */}

               <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-28">

                  <div className="mb-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white">

                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                        ⚙️
                     </div>

                     <h2 className="mt-4 text-lg font-black">
                        Control Center
                     </h2>

                     <p className="mt-1 text-xs font-medium text-blue-100">
                        Manage your school system
                     </p>

                  </div>

                  <nav className="space-y-1">

                     {tabs.map((tab) => (
                        <button
                           key={tab.id}
                           type="button"
                           onClick={() =>
                              setActiveTab(
                                 tab.id
                              )
                           }
                           className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${activeTab ===
                                 tab.id
                                 ? "bg-blue-50 text-blue-700"
                                 : "text-slate-600 hover:bg-slate-50"
                              }`}
                        >

                           <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${activeTab ===
                                    tab.id
                                    ? "bg-white shadow-sm"
                                    : "bg-slate-100"
                                 }`}
                           >
                              {tab.icon}
                           </span>

                           <span className="min-w-0 flex-1">

                              <span className="block text-sm font-black">
                                 {tab.title}
                              </span>

                              <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-400">
                                 {tab.description}
                              </span>

                           </span>

                           {activeTab ===
                              tab.id && (
                                 <span className="h-2 w-2 rounded-full bg-blue-600" />
                              )}

                        </button>
                     ))}

                  </nav>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        System Status
                     </p>

                     <div className="mt-3 flex items-center gap-2">

                        <span className="relative flex h-3 w-3">
                           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                           <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                        </span>

                        <span className="text-xs font-black text-slate-700">
                           System Online
                        </span>

                     </div>

                  </div>

               </aside>

               {/* =================================================
                   CONTENT
               ================================================= */}

               <section className="min-w-0">

                  {/* =================================================
                      SCHOOL
                  ================================================= */}

                  {activeTab ===
                     "school" && (
                        <div className="space-y-5">

                           <SettingsCardHeader
                              icon="🏫"
                              title="School Information"
                              description="Manage your school's identity, contact information and official details."
                           />

                           <form
                              onSubmit={
                                 saveSchoolSettings
                              }
                              className="rounded-3xl border border-slate-200 bg-white shadow-sm"
                           >

                              <div className="p-5 sm:p-8">

                                 <div className="mb-8 grid gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:grid-cols-[1fr_auto] sm:items-center">

                                    <div>
                                       <p className="text-xs font-black uppercase tracking-widest text-blue-500">
                                          School Profile
                                       </p>

                                       <h3 className="mt-1 text-xl font-black text-slate-950">
                                          {schoolSettings.schoolName ||
                                             "Your School"}
                                       </h3>

                                       <p className="mt-1 text-sm text-slate-500">
                                          Keep these details updated for your school website.
                                       </p>
                                    </div>

                                    <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">

                                       <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                          School Code
                                       </p>

                                       <div className="mt-1 flex items-center gap-3">

                                          <span className="font-mono text-lg font-black text-blue-600">
                                             {schoolSettings.schoolCode ||
                                                "Not set"}
                                          </span>

                                          <button
                                             type="button"
                                             onClick={
                                                copySchoolCode
                                             }
                                             className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-200"
                                          >
                                             {copied
                                                ? "Copied"
                                                : "Copy"}
                                          </button>

                                       </div>

                                    </div>

                                 </div>

                                 <div className="grid gap-5 sm:grid-cols-2">

                                    <Input
                                       label="School Name"
                                       name="schoolName"
                                       value={
                                          schoolSettings.schoolName
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="Enter school name"
                                       required
                                    />

                                    <Input
                                       label="School Code"
                                       name="schoolCode"
                                       value={
                                          schoolSettings.schoolCode
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="SCH001"
                                    />

                                    <Input
                                       label="Principal Name"
                                       name="principalName"
                                       value={
                                          schoolSettings.principalName
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="Principal name"
                                    />

                                    <Input
                                       label="Affiliation"
                                       name="affiliation"
                                       value={
                                          schoolSettings.affiliation
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="CBSE / RBSE / Other"
                                    />

                                    <Input
                                       label="School Email"
                                       name="email"
                                       type="email"
                                       value={
                                          schoolSettings.email
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="school@example.com"
                                    />

                                    <Input
                                       label="Phone Number"
                                       name="phone"
                                       value={
                                          schoolSettings.phone
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="+91 XXXXX XXXXX"
                                    />

                                    <Input
                                       label="Alternate Phone"
                                       name="alternatePhone"
                                       value={
                                          schoolSettings.alternatePhone
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="Alternate phone"
                                    />

                                    <Input
                                       label="Website"
                                       name="website"
                                       value={
                                          schoolSettings.website
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="https://example.com"
                                    />

                                    <Input
                                       label="Established Year"
                                       name="establishedYear"
                                       value={
                                          schoolSettings.establishedYear
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="2005"
                                    />

                                    <Input
                                       label="PIN Code"
                                       name="pincode"
                                       value={
                                          schoolSettings.pincode
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="342001"
                                    />

                                    <Input
                                       label="City"
                                       name="city"
                                       value={
                                          schoolSettings.city
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="Jodhpur"
                                    />

                                    <Input
                                       label="State"
                                       name="state"
                                       value={
                                          schoolSettings.state
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="Rajasthan"
                                    />

                                 </div>

                                 <div className="mt-5">

                                    <Textarea
                                       label="School Address"
                                       name="address"
                                       value={
                                          schoolSettings.address
                                       }
                                       onChange={
                                          handleSchoolChange
                                       }
                                       placeholder="Enter complete school address"
                                    />

                                 </div>

                              </div>

                              <FormFooter
                                 onReset={
                                    resetSchoolSettings
                                 }
                                 submitText="Save School Settings"
                              />

                           </form>

                        </div>
                     )}

                  {/* =================================================
                      ADMIN PROFILE
                  ================================================= */}

                  {activeTab ===
                     "profile" && (
                        <div className="space-y-5">

                           <SettingsCardHeader
                              icon="👤"
                              title="Admin Profile"
                              description="Manage your administrator account information."
                           />

                           <form
                              onSubmit={
                                 saveAdminProfile
                              }
                              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
                           >

                              <div className="mb-8 flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white sm:flex-row sm:items-center">

                                 <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-4xl font-black shadow-xl">
                                    {adminSettings.name
                                       ? adminSettings.name
                                          .charAt(
                                             0
                                          )
                                          .toUpperCase()
                                       : "A"}
                                 </div>

                                 <div className="flex-1">

                                    <div className="flex flex-wrap items-center gap-2">

                                       <h2 className="text-2xl font-black">
                                          {adminSettings.name ||
                                             "School Administrator"}
                                       </h2>

                                       <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                                          Admin
                                       </span>

                                    </div>

                                    <p className="mt-1 text-sm text-slate-300">
                                       {adminSettings.email ||
                                          "Administrator account"}
                                    </p>

                                    <p className="mt-4 text-xs font-semibold text-slate-400">
                                       Account ID:{" "}
                                       <span className="font-mono text-slate-200">
                                          {adminUser?.userId ||
                                             adminUser?._id ||
                                             "ADMIN"}
                                       </span>
                                    </p>

                                 </div>

                              </div>

                              <div className="grid gap-5 sm:grid-cols-2">

                                 <Input
                                    label="Full Name"
                                    name="name"
                                    value={
                                       adminSettings.name
                                    }
                                    onChange={
                                       handleAdminChange
                                    }
                                    placeholder="Admin name"
                                    required
                                 />

                                 <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={
                                       adminSettings.email
                                    }
                                    onChange={
                                       handleAdminChange
                                    }
                                    placeholder="admin@example.com"
                                 />

                                 <Input
                                    label="Phone"
                                    name="phone"
                                    value={
                                       adminSettings.phone
                                    }
                                    onChange={
                                       handleAdminChange
                                    }
                                    placeholder="+91 XXXXX XXXXX"
                                 />

                                 <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                                    <p className="text-xs font-black uppercase tracking-wider text-blue-500">
                                       Role
                                    </p>

                                    <p className="mt-2 font-black text-blue-800">
                                       School Administrator
                                    </p>

                                 </div>

                              </div>

                              <div className="mt-8 flex justify-end">

                                 <button
                                    type="submit"
                                    className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
                                 >
                                    Save Admin Profile
                                 </button>

                              </div>

                           </form>

                        </div>
                     )}

                  {/* =================================================
                      SECURITY
                  ================================================= */}

                  {activeTab ===
                     "security" && (
                        <div className="space-y-5">

                           <SettingsCardHeader
                              icon="🔐"
                              title="Security"
                              description="Change your administrator password and protect your account."
                           />

                           <form
                              onSubmit={
                                 handlePasswordSubmit
                              }
                              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
                           >

                              <div className="max-w-2xl">

                                 <PasswordInput
                                    label="Current Password"
                                    name="currentPassword"
                                    value={
                                       passwordData.currentPassword
                                    }
                                    onChange={
                                       handlePasswordChange
                                    }
                                    show={
                                       showCurrentPassword
                                    }
                                    setShow={
                                       setShowCurrentPassword
                                    }
                                    placeholder="Enter current password"
                                 />

                                 <div className="mt-5">

                                    <PasswordInput
                                       label="New Password"
                                       name="newPassword"
                                       value={
                                          passwordData.newPassword
                                       }
                                       onChange={
                                          handlePasswordChange
                                       }
                                       show={
                                          showNewPassword
                                       }
                                       setShow={
                                          setShowNewPassword
                                       }
                                       placeholder="Enter new password"
                                    />

                                 </div>

                                 <div className="mt-5">

                                    <PasswordInput
                                       label="Confirm New Password"
                                       name="confirmPassword"
                                       value={
                                          passwordData.confirmPassword
                                       }
                                       onChange={
                                          handlePasswordChange
                                       }
                                       show={
                                          showConfirmPassword
                                       }
                                       setShow={
                                          setShowConfirmPassword
                                       }
                                       placeholder="Confirm new password"
                                    />

                                 </div>

                                 <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                                    <p className="font-black text-blue-900">
                                       🔒 Password requirements
                                    </p>

                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">

                                       <Requirement
                                          text="At least 6 characters"
                                          valid={
                                             passwordData.newPassword.length >=
                                             6
                                          }
                                       />

                                       <Requirement
                                          text="Passwords match"
                                          valid={
                                             passwordData.newPassword &&
                                             passwordData.newPassword ===
                                             passwordData.confirmPassword
                                          }
                                       />

                                       <Requirement
                                          text="Different from current"
                                          valid={
                                             passwordData.newPassword &&
                                             passwordData.newPassword !==
                                             passwordData.currentPassword
                                          }
                                       />

                                       <Requirement
                                          text="All fields completed"
                                          valid={
                                             passwordData.currentPassword &&
                                             passwordData.newPassword &&
                                             passwordData.confirmPassword
                                          }
                                       />

                                    </div>

                                 </div>

                                 <div className="mt-8 flex justify-end">

                                    <button
                                       type="submit"
                                       disabled={
                                          changingPassword
                                       }
                                       className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                       {changingPassword
                                          ? "Changing Password..."
                                          : "Update Password"}
                                    </button>

                                 </div>

                              </div>

                           </form>

                        </div>
                     )}

                  {/* =================================================
                      NOTIFICATIONS
                  ================================================= */}

                  {activeTab ===
                     "notifications" && (
                        <div className="space-y-5">

                           <SettingsCardHeader
                              icon="🔔"
                              title="Notifications"
                              description="Choose which school events should notify the administrator."
                           />

                           <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                              <ToggleRow
                                 name="newAdmission"
                                 checked={
                                    notifications.newAdmission
                                 }
                                 onChange={
                                    handleNotificationChange
                                 }
                                 title="New Admission"
                                 description="Notify when a new admission application is submitted."
                              />

                              <ToggleRow
                                 name="admissionStatus"
                                 checked={
                                    notifications.admissionStatus
                                 }
                                 onChange={
                                    handleNotificationChange
                                 }
                                 title="Admission Status"
                                 description="Notify when an admission status changes."
                              />

                              <ToggleRow
                                 name="newStudent"
                                 checked={
                                    notifications.newStudent
                                 }
                                 onChange={
                                    handleNotificationChange
                                 }
                                 title="New Student"
                                 description="Notify when a new student account is created."
                              />

                              <ToggleRow
                                 name="newTeacher"
                                 checked={
                                    notifications.newTeacher
                                 }
                                 onChange={
                                    handleNotificationChange
                                 }
                                 title="New Teacher"
                                 description="Notify when a new teacher account is created."
                              />

                              <ToggleRow
                                 name="systemUpdates"
                                 checked={
                                    notifications.systemUpdates
                                 }
                                 onChange={
                                    handleNotificationChange
                                 }
                                 title="System Updates"
                                 description="Receive important school management system updates."
                              />

                              <div className="flex justify-end border-t border-slate-100 p-6">

                                 <button
                                    type="button"
                                    onClick={
                                       saveNotifications
                                    }
                                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
                                 >
                                    Save Notification Settings
                                 </button>

                              </div>

                           </div>

                        </div>
                     )}

                  {/* =================================================
                      WEBSITE
                  ================================================= */}

                  {activeTab ===
                     "website" && (
                        <div className="space-y-5">

                           <SettingsCardHeader
                              icon="🌐"
                              title="Website Controls"
                              description="Control which sections of your public school website are visible."
                           />

                           <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6">

                                 <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                                       🌍
                                    </div>

                                    <div>
                                       <p className="text-sm font-black text-slate-900">
                                          Public Website
                                       </p>

                                       <p className="text-xs font-semibold text-slate-400">
                                          Control public-facing sections
                                       </p>
                                    </div>

                                 </div>

                              </div>

                              <ToggleRow
                                 name="maintenanceMode"
                                 checked={
                                    websiteSettings.maintenanceMode
                                 }
                                 onChange={
                                    handleWebsiteChange
                                 }
                                 title="Maintenance Mode"
                                 description="Temporarily place the public website into maintenance mode."
                                 danger
                              />

                              <ToggleRow
                                 name="showAdmissions"
                                 checked={
                                    websiteSettings.showAdmissions
                                 }
                                 onChange={
                                    handleWebsiteChange
                                 }
                                 title="Show Admissions"
                                 description="Display admissions information and application section."
                              />

                              <ToggleRow
                                 name="showNotices"
                                 checked={
                                    websiteSettings.showNotices
                                 }
                                 onChange={
                                    handleWebsiteChange
                                 }
                                 title="Show Notices"
                                 description="Display school notices on the public website."
                              />

                              <ToggleRow
                                 name="showGallery"
                                 checked={
                                    websiteSettings.showGallery
                                 }
                                 onChange={
                                    handleWebsiteChange
                                 }
                                 title="Show Gallery"
                                 description="Display the school gallery section."
                              />

                              <ToggleRow
                                 name="showContact"
                                 checked={
                                    websiteSettings.showContact
                                 }
                                 onChange={
                                    handleWebsiteChange
                                 }
                                 title="Show Contact"
                                 description="Display school contact information."
                              />

                              {websiteSettings.maintenanceMode && (
                                 <div className="mx-6 mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                                    <p className="font-black text-red-800">
                                       ⚠️ Maintenance Mode is ON
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-red-600">
                                       Your public website should display a maintenance message when your frontend reads this setting.
                                    </p>

                                 </div>
                              )}

                              <div className="flex justify-end border-t border-slate-100 p-6">

                                 <button
                                    type="button"
                                    onClick={
                                       saveWebsiteSettings
                                    }
                                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
                                 >
                                    Save Website Settings
                                 </button>

                              </div>

                           </div>

                        </div>
                     )}

                  {/* =================================================
                      APPEARANCE
                  ================================================= */}

                  {activeTab ===
                     "appearance" && (
                        <div className="space-y-5">

                           <SettingsCardHeader
                              icon="🎨"
                              title="Appearance"
                              description="Customize how your admin dashboard behaves and looks."
                           />

                           <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                              <ToggleRow
                                 name="compactMode"
                                 checked={
                                    appearance.compactMode
                                 }
                                 onChange={
                                    handleAppearanceChange
                                 }
                                 title="Compact Mode"
                                 description="Use a tighter layout to fit more information on the screen."
                              />

                              <ToggleRow
                                 name="showAnimations"
                                 checked={
                                    appearance.showAnimations
                                 }
                                 onChange={
                                    handleAppearanceChange
                                 }
                                 title="Dashboard Animations"
                                 description="Enable smooth transitions and visual animations."
                              />

                              <ToggleRow
                                 name="sidebarCollapsed"
                                 checked={
                                    appearance.sidebarCollapsed
                                 }
                                 onChange={
                                    handleAppearanceChange
                                 }
                                 title="Collapsed Sidebar"
                                 description="Remember a compact sidebar preference for the dashboard."
                              />

                              <div className="border-t border-slate-100 p-6">

                                 <div className="grid gap-4 sm:grid-cols-3">

                                    <PreviewCard
                                       icon="☀️"
                                       title="Clean"
                                       description="Bright and clear"
                                    />

                                    <PreviewCard
                                       icon="📊"
                                       title="Modern"
                                       description="Dashboard focused"
                                    />

                                    <PreviewCard
                                       icon="⚡"
                                       title="Fast"
                                       description="Minimal interface"
                                    />

                                 </div>

                              </div>

                              <div className="flex justify-end border-t border-slate-100 p-6">

                                 <button
                                    type="button"
                                    onClick={
                                       saveAppearance
                                    }
                                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
                                 >
                                    Save Appearance
                                 </button>

                              </div>

                           </div>

                        </div>
                     )}

                  {/* =================================================
                      SYSTEM
                  ================================================= */}

                  {activeTab ===
                     "system" && (
                        <div className="space-y-5">

                           <SettingsCardHeader
                              icon="⚙️"
                              title="System Tools"
                              description="Useful tools for managing this browser and admin panel."
                           />

                           <div className="grid gap-5 sm:grid-cols-2">

                              <SystemCard
                                 icon="🟢"
                                 title="System Status"
                                 value="Online"
                                 description="Admin panel is running."
                              />

                              <SystemCard
                                 icon="🔐"
                                 title="Authentication"
                                 value={
                                    getToken()
                                       ? "Active"
                                       : "Not Found"
                                 }
                                 description="Current administrator session."
                              />

                              <SystemCard
                                 icon="💾"
                                 title="Local Settings"
                                 value="Enabled"
                                 description="Preferences are saved in this browser."
                              />

                              <SystemCard
                                 icon="🌐"
                                 title="API Server"
                                 value="Connected"
                                 description={API_URL}
                              />

                           </div>

                           <div className="rounded-3xl border border-red-200 bg-white shadow-sm">

                              <button
                                 type="button"
                                 onClick={() =>
                                    setShowDangerZone(
                                       !showDangerZone
                                    )
                                 }
                                 className="flex w-full items-center justify-between p-6 text-left"
                              >

                                 <div>

                                    <p className="text-sm font-black text-red-700">
                                       Danger Zone
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                       Destructive local settings actions
                                    </p>

                                 </div>

                                 <span className="text-red-500">
                                    {showDangerZone
                                       ? "▲"
                                       : "▼"}
                                 </span>

                              </button>

                              {showDangerZone && (
                                 <div className="border-t border-red-100 bg-red-50 p-6">

                                    <p className="text-sm font-semibold text-red-700">
                                       These actions affect settings saved in this browser. They do not delete students, teachers or MongoDB data.
                                    </p>

                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                                       <button
                                          type="button"
                                          onClick={
                                             resetAllSettings
                                          }
                                          className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-black text-red-600 hover:bg-red-100"
                                       >
                                          Reset Local Settings
                                       </button>

                                       <button
                                          type="button"
                                          onClick={
                                             logout
                                          }
                                          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700"
                                       >
                                          Logout Admin
                                       </button>

                                    </div>

                                 </div>
                              )}

                           </div>

                        </div>
                     )}

               </section>

            </div>

         </main>

      </div>
   );
}

/* =========================================================
   SETTINGS HEADER
========================================================= */

function SettingsCardHeader({
   icon,
   title,
   description,
}) {
   return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

         <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
               {icon}
            </div>

            <div>

               <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                  {title}
               </h2>

               <p className="mt-1 text-sm font-medium text-slate-500">
                  {description}
               </p>

            </div>

         </div>

      </div>
   );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
   label,
   name,
   type = "text",
   value,
   onChange,
   placeholder,
   required = false,
}) {
   return (
      <div>

         <label className="mb-2 block text-sm font-black text-slate-700">
            {label}

            {required && (
               <span className="ml-1 text-red-500">
                  *
               </span>
            )}
         </label>

         <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
         />

      </div>
   );
}

/* =========================================================
   TEXTAREA
========================================================= */

function Textarea({
   label,
   name,
   value,
   onChange,
   placeholder,
}) {
   return (
      <div>

         <label className="mb-2 block text-sm font-black text-slate-700">
            {label}
         </label>

         <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
         />

      </div>
   );
}

/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
   label,
   name,
   value,
   onChange,
   show,
   setShow,
   placeholder,
}) {
   return (
      <div>

         <label className="mb-2 block text-sm font-black text-slate-700">
            {label}
         </label>

         <div className="relative">

            <input
               type={
                  show
                     ? "text"
                     : "password"
               }
               name={name}
               value={value}
               onChange={onChange}
               placeholder={placeholder}
               className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-14 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <button
               type="button"
               onClick={() =>
                  setShow(!show)
               }
               className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-black text-slate-500 hover:bg-slate-200"
            >
               {show
                  ? "Hide"
                  : "Show"}
            </button>

         </div>

      </div>
   );
}

/* =========================================================
   TOGGLE
========================================================= */

function ToggleRow({
   name,
   checked,
   onChange,
   title,
   description,
   danger = false,
}) {
   return (
      <div className="flex items-center justify-between gap-5 border-b border-slate-100 p-6 last:border-b-0">

         <div className="min-w-0">

            <h3
               className={`text-sm font-black ${danger
                     ? "text-red-700"
                     : "text-slate-900"
                  }`}
            >
               {title}
            </h3>

            <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500">
               {description}
            </p>

         </div>

         <label className="relative inline-flex shrink-0 cursor-pointer items-center">

            <input
               type="checkbox"
               name={name}
               checked={checked}
               onChange={onChange}
               className="peer sr-only"
            />

            <div
               className={`h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-100 ${danger
                     ? "peer-checked:bg-red-600"
                     : ""
                  }`}
            />

            <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />

         </label>

      </div>
   );
}

/* =========================================================
   FORM FOOTER
========================================================= */

function FormFooter({
   onReset,
   submitText,
}) {
   return (
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end sm:p-6">

         <button
            type="button"
            onClick={onReset}
            className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
         >
            Reset
         </button>

         <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
         >
            {submitText}
         </button>

      </div>
   );
}

/* =========================================================
   PASSWORD REQUIREMENT
========================================================= */

function Requirement({
   text,
   valid,
}) {
   return (
      <div className="flex items-center gap-2 text-xs font-bold text-blue-800">

         <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${valid
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-slate-400"
               }`}
         >
            {valid
               ? "✓"
               : "•"}
         </span>

         {text}

      </div>
   );
}

/* =========================================================
   PREVIEW CARD
========================================================= */

function PreviewCard({
   icon,
   title,
   description,
}) {
   return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">

         <div className="text-2xl">
            {icon}
         </div>

         <p className="mt-3 text-sm font-black text-slate-800">
            {title}
         </p>

         <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
         </p>

      </div>
   );
}

/* =========================================================
   SYSTEM CARD
========================================================= */

function SystemCard({
   icon,
   title,
   value,
   description,
}) {
   return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

         <div className="flex items-start justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-xl">
               {icon}
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
               Active
            </span>

         </div>

         <p className="mt-6 text-xs font-black uppercase tracking-wider text-slate-400">
            {title}
         </p>

         <p className="mt-1 break-all text-lg font-black text-slate-900">
            {value}
         </p>

         <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
         </p>

      </div>
   );
}









