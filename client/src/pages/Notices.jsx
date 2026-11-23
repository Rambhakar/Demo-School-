
import React, { useMemo, useState } from "react";
import {
   Bell,
   CalendarDays,
   Search,
   Pin,
   Megaphone,
   GraduationCap,
   Trophy,
   PartyPopper,
   FileText,
   Clock,
   ArrowRight,
   X,
   Download,
   Filter,
   School,
   BookOpen,
   ClipboardList,
   AlertCircle,
   ChevronRight,
   Sparkles,
} from "lucide-react";

const notices = [
   {
      id: 1,
      date: "20 Sep 2026",
      title: "Parent Teacher Meeting",
      category: "Meeting",
      icon: GraduationCap,
      important: true,
      description:
         "Dear Parents, Sunrise Public School is organizing a Parent Teacher Meeting to discuss students' academic progress, attendance and overall development. Parents are requested to attend the meeting and interact with their child's class teacher.",
      details: [
         "Date: 20 September 2026",
         "Time: 10:00 AM to 1:00 PM",
         "Venue: School Campus",
         "Classes: All Classes",
      ],
      color: "amber",
   },
   {
      id: 2,
      date: "18 Sep 2026",
      title: "Half Yearly Examination Schedule",
      category: "Examination",
      icon: ClipboardList,
      important: true,
      description:
         "The school is publishing the demo half-yearly examination announcement. Students should prepare according to their class timetable and complete their syllabus revision.",
      details: [
         "Examination: Half Yearly",
         "Applicable Classes: 1 to 12",
         "Students should carry their school ID card.",
         "Reach the examination room on time.",
      ],
      color: "rose",
   },
   {
      id: 3,
      date: "15 Sep 2026",
      title: "Inter-School Sports Competition",
      category: "Sports",
      icon: Trophy,
      important: false,
      description:
         "Students interested in participating in the inter-school sports competition can register with their respective sports teacher. Multiple sports activities will be organized.",
      details: [
         "Event: Inter-School Sports Competition",
         "Registration: Contact Sports Department",
         "Venue: School Sports Ground",
         "Participants should wear their sports uniform.",
      ],
      color: "emerald",
   },
   {
      id: 4,
      date: "10 Sep 2026",
      title: "School Holiday Notice",
      category: "Holiday",
      icon: PartyPopper,
      important: false,
      description:
         "This is a sample holiday announcement for demonstration purposes. Please check the official school communication for confirmed holidays.",
      details: [
         "Notice Type: Holiday",
         "Applicable Classes: All Classes",
         "School office timings may vary.",
         "Please follow official school updates.",
      ],
      color: "violet",
   },
   {
      id: 5,
      date: "08 Sep 2026",
      title: "Science Exhibition Registration",
      category: "Events",
      icon: Sparkles,
      important: false,
      description:
         "Students from different classes are invited to participate in the school science exhibition. Students can present working models, experiments and creative scientific ideas.",
      details: [
         "Event: Science Exhibition",
         "Classes: 6 to 12",
         "Registration: Contact Science Department",
         "Bring your project ideas and models.",
      ],
      color: "cyan",
   },
   {
      id: 6,
      date: "05 Sep 2026",
      title: "Teachers' Day Celebration",
      category: "Events",
      icon: School,
      important: false,
      description:
         "The school is organizing a Teachers' Day celebration to appreciate the dedication and contribution of teachers. Students may participate in cultural activities.",
      details: [
         "Event: Teachers' Day",
         "Activities: Cultural performances",
         "Venue: School Auditorium",
         "Participants: All Classes",
      ],
      color: "orange",
   },
   {
      id: 7,
      date: "02 Sep 2026",
      title: "Library Book Return Reminder",
      category: "Academic",
      icon: BookOpen,
      important: false,
      description:
         "Students who have borrowed books from the school library are requested to return them within the due date to avoid overdue issues.",
      details: [
         "Department: School Library",
         "Applicable Classes: All Classes",
         "Return books at the library counter.",
      ],
      color: "blue",
   },
   {
      id: 8,
      date: "01 Sep 2026",
      title: "Student Attendance Reminder",
      category: "General",
      icon: CalendarDays,
      important: false,
      description:
         "Students are encouraged to maintain regular attendance and arrive at school before the morning assembly.",
      details: [
         "Assembly: As per school timetable",
         "Maintain regular attendance.",
         "Inform the school in case of absence.",
      ],
      color: "teal",
   },
];

const categories = [
   "All",
   "Meeting",
   "Examination",
   "Sports",
   "Holiday",
   "Events",
   "Academic",
   "General",
];

const colorStyles = {
   amber: "bg-amber-400/10 text-amber-300 border-amber-400/20",
   rose: "bg-rose-400/10 text-rose-300 border-rose-400/20",
   emerald: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
   violet: "bg-violet-400/10 text-violet-300 border-violet-400/20",
   cyan: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
   orange: "bg-orange-400/10 text-orange-300 border-orange-400/20",
   blue: "bg-blue-400/10 text-blue-300 border-blue-400/20",
   teal: "bg-teal-400/10 text-teal-300 border-teal-400/20",
};

function NoticeCard({ notice, onView }) {
   const Icon = notice.icon;

   return (
      <article className="group relative overflow-hidden rounded-3xl border border-amber-400/10 bg-[#211910] p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl hover:shadow-black/20 sm:p-6">
         <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-400/[0.03] blur-2xl transition group-hover:bg-amber-400/10" />

         <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10 text-amber-400 transition group-hover:scale-110">
               <Icon size={27} />
            </div>

            <div className="min-w-0 flex-1">
               <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${colorStyles[notice.color] || colorStyles.amber}`}>
                     {notice.category}
                  </span>

                  {notice.important && (
                     <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-[10px] font-bold text-rose-300">
                        <Pin size={11} /> Important
                     </span>
                  )}
               </div>

               <h3 className="mt-3 text-lg font-black text-[#f5e8d1] transition group-hover:text-amber-300 sm:text-xl">
                  {notice.title}
               </h3>

               <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#a9977e]">
                  {notice.description}
               </p>

               <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <span className="flex items-center gap-2 text-xs font-semibold text-[#b7a58a]">
                     <CalendarDays size={15} className="text-amber-400" />
                     {notice.date}
                  </span>

                  <button
                     type="button"
                     onClick={() => onView(notice)}
                     className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-4 py-2.5 text-xs font-black text-[#21170d] transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                     View Notice <ArrowRight size={15} />
                  </button>
               </div>
            </div>
         </div>
      </article>
   );
}

function NoticeModal({ notice, onClose }) {
   if (!notice) return null;

   const Icon = notice.icon;

   const printNotice = () => {
      const details = notice.details
         .map((item) => `<li>${item}</li>`)
         .join("");

      const safeTitle = notice.title.replace(/[&<>"']/g, "");
      const safeDescription = notice.description.replace(/[&<>"']/g, "");

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
         alert("Please allow popups to print this notice.");
         return;
      }

      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${safeTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #222; }
            .header { border-bottom: 2px solid #b88a45; padding-bottom: 15px; }
            h1 { color: #8b622b; }
            li { margin: 12px 0; }
            .footer { margin-top: 50px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sunrise Public School</h1>
            <p>Learn • Grow • Succeed</p>
          </div>
          <h2>${safeTitle}</h2>
          <p><strong>Date:</strong> ${notice.date}</p>
          <p>${safeDescription}</p>
          <ul>${details}</ul>
          <div class="footer">Demo notice. Confirm details with the school office.</div>
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>
    `);

      printWindow.document.close();
   };

   return (
      <div
         className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
         onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
         }}
      >
         <div className="relative my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-amber-400/20 bg-[#211910] shadow-2xl">
            <div className="relative overflow-hidden bg-[#302216] p-6 sm:p-8">
               <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

               <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close notice"
                  className="absolute right-5 top-5 z-10 rounded-xl border border-white/10 bg-black/20 p-2 text-[#e7d5b8] hover:bg-white/10"
               >
                  <X size={20} />
               </button>

               <div className="relative flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400">
                     <Icon size={28} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black tracking-[2px] text-amber-400">
                        SUNRISE PUBLIC SCHOOL
                     </p>
                     <p className="mt-1 text-xs text-[#b7a58a]">
                        Official Notice Board • Demo
                     </p>
                  </div>
               </div>

               <h2 className="relative mt-7 pr-8 text-2xl font-black text-[#fff0d9] sm:text-3xl">
                  {notice.title}
               </h2>

               <div className="relative mt-4 flex flex-wrap gap-3 text-xs text-[#d1bd9e]">
                  <span className="flex items-center gap-2">
                     <CalendarDays size={15} className="text-amber-400" />
                     {notice.date}
                  </span>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-300">
                     {notice.category}
                  </span>
               </div>
            </div>

            <div className="p-6 sm:p-8">
               <p className="text-[10px] font-black tracking-[2px] text-amber-400">
                  NOTICE DETAILS
               </p>

               <p className="mt-4 text-sm leading-8 text-[#c9b89e]">
                  {notice.description}
               </p>

               <div className="mt-6 rounded-2xl border border-amber-400/10 bg-[#2a2016] p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-[#f5e8d1]">
                     <ClipboardList size={17} className="text-amber-400" />
                     Important Information
                  </h3>

                  <ul className="space-y-3">
                     {notice.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3 text-xs leading-6 text-[#c1ae91]">
                           <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                           {detail}
                        </li>
                     ))}
                  </ul>
               </div>

               <div className="mt-6 flex flex-wrap gap-3">
                  <button
                     type="button"
                     onClick={printNotice}
                     className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-3 text-xs font-black text-[#21170d] transition hover:-translate-y-0.5"
                  >
                     <Download size={16} /> Print / Save PDF
                  </button>

                  <button
                     type="button"
                     onClick={onClose}
                     className="rounded-xl border border-amber-400/20 px-5 py-3 text-xs font-bold text-[#d6c3a5] transition hover:bg-amber-400/10"
                  >
                     Close
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

export default function Notices() {
   const [search, setSearch] = useState("");
   const [activeCategory, setActiveCategory] = useState("All");
   const [importantOnly, setImportantOnly] = useState(false);
   const [selectedNotice, setSelectedNotice] = useState(null);

   const filteredNotices = useMemo(() => {
      const query = search.trim().toLowerCase();

      return notices.filter((notice) => {
         const matchesSearch =
            !query ||
            notice.title.toLowerCase().includes(query) ||
            notice.category.toLowerCase().includes(query) ||
            notice.description.toLowerCase().includes(query);

         const matchesCategory =
            activeCategory === "All" ||
            notice.category === activeCategory;

         const matchesImportant =
            !importantOnly || notice.important;

         return matchesSearch && matchesCategory && matchesImportant;
      });
   }, [search, activeCategory, importantOnly]);

   const importantNotices = notices.filter((notice) => notice.important);

   return (
      <main className="min-h-screen overflow-hidden bg-[#17120d] text-[#f5e8d1]">
         <style>{`
        @keyframes noticeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        .notice-float { animation: noticeFloat 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .notice-float { animation: none; }
        }
      `}</style>

         {/* HERO */}
         <section className="relative overflow-hidden border-b border-amber-400/10 bg-[#21180f] px-5 py-16 sm:px-8 lg:py-24">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[110px]" />
            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-orange-900/20 blur-[110px]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
               <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-[10px] font-black tracking-[2px] text-amber-300">
                     <Bell size={14} /> SCHOOL UPDATES & ANNOUNCEMENTS
                  </div>

                  <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                     Stay Informed.
                     <span className="mt-2 block text-amber-400">
                        Never Miss an Update.
                     </span>
                  </h1>

                  <p className="mt-6 max-w-xl text-sm leading-8 text-[#c2b29a] sm:text-base">
                     Find the latest school announcements, examination schedules,
                     events, holidays and important updates, all in one place.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                     <a
                        href="#all-notices"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3.5 text-sm font-black text-[#21170d] transition hover:-translate-y-1"
                     >
                        Explore Notices <ArrowRight size={17} />
                     </a>

                     <a
                        href="#important-notices"
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-white/[.03] px-6 py-3.5 text-sm font-bold text-[#f0dfc2] transition hover:bg-amber-400/10"
                     >
                        Important Updates <Pin size={15} />
                     </a>
                  </div>

                  <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                     {[
                        [notices.length, "Total Notices"],
                        [importantNotices.length, "Important"],
                        [categories.length - 1, "Categories"],
                     ].map(([number, label]) => (
                        <div key={label} className="rounded-2xl border border-amber-400/10 bg-[#2a1e13]/80 p-4">
                           <p className="text-2xl font-black text-amber-400">{number}</p>
                           <p className="mt-1 text-[10px] font-semibold text-[#b7a58a]">{label}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="notice-float relative mx-auto w-full max-w-md">
                  <div className="rounded-[30px] border border-amber-400/20 bg-[#2a1e13] p-6 shadow-2xl sm:p-8">
                     <div className="flex items-center justify-between border-b border-amber-400/10 pb-5">
                        <div>
                           <p className="text-[10px] font-black tracking-[2px] text-amber-400">
                              NOTICE BOARD
                           </p>
                           <h2 className="mt-2 text-xl font-black">Latest Updates</h2>
                        </div>
                        <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-400">
                           <Megaphone size={25} />
                        </div>
                     </div>

                     <div className="mt-5 space-y-4">
                        {notices.slice(0, 3).map((notice) => {
                           const Icon = notice.icon;

                           return (
                              <button
                                 type="button"
                                 key={notice.id}
                                 onClick={() => setSelectedNotice(notice)}
                                 className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-[#1b150f] p-4 text-left transition hover:border-amber-400/30"
                              >
                                 <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                                    <Icon size={20} />
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-extrabold">{notice.title}</p>
                                    <p className="mt-1 text-[10px] text-[#a9977e]">{notice.date}</p>
                                 </div>
                                 <ChevronRight size={17} className="shrink-0 text-amber-400" />
                              </button>
                           );
                        })}
                     </div>

                     <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
                        <Bell className="shrink-0 text-amber-400" size={23} />
                        <p className="text-xs leading-5 text-[#c5b394]">
                           Stay connected with school announcements and important information.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* IMPORTANT NOTICES */}
         <section id="important-notices" className="scroll-mt-24 px-5 py-14 sm:px-8">
            <div className="mx-auto max-w-7xl">
               <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                     <p className="text-[10px] font-black tracking-[3px] text-amber-400">
                        PLEASE READ
                     </p>
                     <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                        Important Notices
                     </h2>
                  </div>
                  <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-xs font-bold text-rose-300">
                     {importantNotices.length} Important Updates
                  </span>
               </div>

               <div className="grid gap-5 md:grid-cols-2">
                  {importantNotices.map((notice) => (
                     <NoticeCard
                        key={notice.id}
                        notice={notice}
                        onView={setSelectedNotice}
                     />
                  ))}
               </div>
            </div>
         </section>

         {/* ALL NOTICES */}
         <section id="all-notices" className="scroll-mt-24 border-t border-amber-400/10 bg-[#1d160f] px-5 py-16 sm:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
               <div className="mx-auto mb-10 max-w-2xl text-center">
                  <p className="text-[10px] font-black tracking-[3px] text-amber-400">
                     SCHOOL NOTICE BOARD
                  </p>
                  <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                     All Notices & Announcements
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#b7a58a]">
                     Browse school announcements by category or search for a specific update.
                  </p>
               </div>

               {/* SEARCH AND FILTER */}
               <div className="mb-8 rounded-3xl border border-amber-400/15 bg-[#211910] p-4 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                     <div className="relative w-full lg:max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
                        <input
                           type="search"
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           placeholder="Search notices, events, examinations..."
                           className="w-full rounded-xl border border-[#66513a] bg-[#17120d] py-3.5 pl-11 pr-4 text-sm text-[#f6e9d2] outline-none placeholder:text-[#9b896f] focus:border-amber-400"
                        />
                     </div>

                     <button
                        type="button"
                        onClick={() => setImportantOnly((previous) => !previous)}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition ${importantOnly
                              ? "border-amber-400 bg-amber-400 text-[#21170d]"
                              : "border-amber-400/20 text-[#d6c3a5] hover:bg-amber-400/10"
                           }`}
                     >
                        <Pin size={15} />
                        Important Only
                     </button>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                     <span className="mr-1 flex items-center gap-1 text-[10px] font-bold text-[#a9977e]">
                        <Filter size={14} /> CATEGORY
                     </span>

                     {categories.map((category) => (
                        <button
                           type="button"
                           key={category}
                           onClick={() => setActiveCategory(category)}
                           className={`rounded-full border px-4 py-2 text-[11px] font-bold transition ${activeCategory === category
                                 ? "border-amber-400 bg-amber-400 text-[#21170d]"
                                 : "border-amber-400/15 bg-[#2a2016] text-[#c5b394] hover:border-amber-400/50"
                              }`}
                        >
                           {category}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[#a9977e]">
                     Showing{" "}
                     <span className="font-black text-amber-300">
                        {filteredNotices.length}
                     </span>{" "}
                     notices
                  </p>

                  <button
                     type="button"
                     onClick={() => {
                        setSearch("");
                        setActiveCategory("All");
                        setImportantOnly(false);
                     }}
                     className="text-xs font-bold text-amber-400 transition hover:text-amber-200"
                  >
                     Reset Filters
                  </button>
               </div>

               {filteredNotices.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2">
                     {filteredNotices.map((notice) => (
                        <NoticeCard
                           key={notice.id}
                           notice={notice}
                           onView={setSelectedNotice}
                        />
                     ))}
                  </div>
               ) : (
                  <div className="rounded-3xl border border-amber-400/10 bg-[#211910] px-6 py-16 text-center">
                     <Search size={35} className="mx-auto text-amber-400" />
                     <h3 className="mt-4 text-xl font-black">
                        No Notices Found
                     </h3>
                     <p className="mt-2 text-sm text-[#a9977e]">
                        Try another search term or category.
                     </p>
                     <button
                        type="button"
                        onClick={() => {
                           setSearch("");
                           setActiveCategory("All");
                           setImportantOnly(false);
                        }}
                        className="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-[#21170d]"
                     >
                        Clear Filters
                     </button>
                  </div>
               )}
            </div>
         </section>

         {/* INFORMATION STRIP */}
         <section className="border-t border-amber-400/10 bg-[#211910] px-5 py-12 sm:px-8">
            <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
               {[
                  [Bell, "Stay Updated", "Check the notice board regularly for school announcements."],
                  [CalendarDays, "Important Dates", "Keep track of events, examinations and meetings."],
                  [School, "School Information", "For clarification, contact the school administration."],
               ].map(([Icon, title, description]) => (
                  <div key={title} className="flex items-center gap-4 rounded-2xl border border-amber-400/10 bg-[#251b12] p-5">
                     <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                        <Icon size={24} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black">{title}</h3>
                        <p className="mt-1 text-xs leading-5 text-[#a9977e]">{description}</p>
                     </div>
                  </div>
               ))}
            </div>

            <p className="mx-auto mt-8 max-w-7xl rounded-xl border border-amber-400/15 bg-amber-400/5 p-4 text-center text-[11px] leading-5 text-[#b7a58a]">
               Demo Notice Board: All notices, dates and announcements displayed here are sample content for website demonstration. Replace them with verified school announcements before publishing.
            </p>
         </section>

         {/* NOTICE DETAILS MODAL */}
         <NoticeModal
            notice={selectedNotice}
            onClose={() => setSelectedNotice(null)}
         />
      </main>
   );
}
