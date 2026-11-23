
import React, { useMemo, useState } from "react";
import {
   Search,
   GraduationCap,
   BookOpen,
   Users,
   Award,
   Mail,
   Phone,
   MapPin,
   Sparkles,
   Calculator,
   Microscope,
   Atom,
   Palette,
   Languages,
   FlaskConical,
   BriefcaseBusiness,
   Filter,
   School,
   Star,
   ArrowRight,
   ArrowUpRight,
} from "lucide-react";

const schoolInfo = {
   name: "Sunrise Public School",
   tagline: "Learn • Grow • Succeed",
   location: "Rajasthan, India",
};

// DEMO DATA: Replace with actual school staff details.
const classTeachers = [
   { className: "Class 1", name: "Anita Sharma", subject: "All Subjects", qualification: "B.Ed., B.A.", experience: "6 years", color: "from-amber-500 to-orange-700", initials: "AS", quote: "Building strong foundations with care and curiosity." },
   { className: "Class 2", name: "Neha Verma", subject: "All Subjects", qualification: "B.Ed., M.A.", experience: "8 years", color: "from-rose-500 to-pink-700", initials: "NV", quote: "Every child learns in their own wonderful way." },
   { className: "Class 3", name: "Pooja Joshi", subject: "All Subjects", qualification: "B.Ed., B.Sc.", experience: "5 years", color: "from-violet-500 to-purple-800", initials: "PJ", quote: "Making learning active, joyful and meaningful." },
   { className: "Class 4", name: "Kavita Singh", subject: "All Subjects", qualification: "B.Ed., M.A.", experience: "9 years", color: "from-cyan-500 to-blue-800", initials: "KS", quote: "Helping students ask questions and find answers." },
   { className: "Class 5", name: "Ritu Mehta", subject: "All Subjects", qualification: "B.Ed., B.Sc.", experience: "7 years", color: "from-emerald-500 to-teal-800", initials: "RM", quote: "Growing confidence one lesson at a time." },
   { className: "Class 6", name: "Suman Rathore", subject: "Class Teacher", qualification: "B.Ed., M.A.", experience: "10 years", color: "from-orange-500 to-red-800", initials: "SR", quote: "Encouraging independent thinking and teamwork." },
   { className: "Class 7", name: "Deepa Choudhary", subject: "Class Teacher", qualification: "B.Ed., M.Sc.", experience: "8 years", color: "from-blue-500 to-indigo-800", initials: "DC", quote: "Turning challenges into opportunities to learn." },
   { className: "Class 8", name: "Meena Yadav", subject: "Class Teacher", qualification: "B.Ed., M.A.", experience: "11 years", color: "from-fuchsia-500 to-purple-800", initials: "MY", quote: "Preparing learners for the next big step." },
   { className: "Class 9", name: "Rajesh Sharma", subject: "Class Teacher", qualification: "M.Sc., B.Ed.", experience: "12 years", color: "from-amber-500 to-yellow-800", initials: "RS", quote: "Discipline, direction and a love of learning." },
   { className: "Class 10", name: "Manoj Kumar", subject: "Class Teacher", qualification: "M.Sc., B.Ed.", experience: "14 years", color: "from-teal-500 to-cyan-800", initials: "MK", quote: "Guiding students towards confident exam preparation." },
   { className: "Class 11", name: "Anil Mathur", subject: "Senior Secondary Coordinator", qualification: "M.A., B.Ed.", experience: "15 years", color: "from-indigo-500 to-blue-900", initials: "AM", quote: "Helping students choose a path that fits their strengths." },
   { className: "Class 12", name: "Sunita Sharma", subject: "Senior Secondary Coordinator", qualification: "M.Sc., B.Ed.", experience: "16 years", color: "from-pink-500 to-rose-800", initials: "SS", quote: "Supporting students through their final school year." },
];

const subjectFaculty = [
   { name: "Amit Joshi", subject: "Mathematics", classes: "Classes 6–12", stream: "All streams", qualification: "M.Sc. Mathematics, B.Ed.", experience: "12 years", icon: Calculator, color: "amber", initials: "AJ", description: "Concept clarity, problem-solving and board exam preparation." },
   { name: "Kiran Patel", subject: "Mathematics", classes: "Classes 1–5", stream: "Primary", qualification: "B.Sc., B.Ed.", experience: "7 years", icon: Calculator, color: "amber", initials: "KP", description: "Building number sense through practical activities." },
   { name: "Dr. Nisha Saini", subject: "Biology", classes: "Classes 11–12", stream: "Science • Biology", qualification: "M.Sc. Botany, B.Ed.", experience: "10 years", icon: Microscope, color: "emerald", initials: "NS", description: "Life sciences, diagrams, practical concepts and revision." },
   { name: "Vikram Singh", subject: "Physics", classes: "Classes 11–12", stream: "Science • Mathematics / Biology", qualification: "M.Sc. Physics, B.Ed.", experience: "9 years", icon: Atom, color: "cyan", initials: "VS", description: "Connecting scientific principles with real-world applications." },
   { name: "Rachna Gupta", subject: "Chemistry", classes: "Classes 11–12", stream: "Science • Mathematics / Biology", qualification: "M.Sc. Chemistry, B.Ed.", experience: "8 years", icon: FlaskConical, color: "violet", initials: "RG", description: "Clear explanations of reactions, equations and lab concepts." },
   { name: "Sanjay Rathore", subject: "English", classes: "Classes 6–12", stream: "All streams", qualification: "M.A. English, B.Ed.", experience: "11 years", icon: Languages, color: "blue", initials: "SR", description: "Language skills, literature and confident communication." },
   { name: "Farah Khan", subject: "English", classes: "Classes 1–5", stream: "Primary", qualification: "B.A., B.Ed.", experience: "6 years", icon: Languages, color: "blue", initials: "FK", description: "Reading, writing, vocabulary and spoken English." },
   { name: "Mahesh Purohit", subject: "Social Science", classes: "Classes 6–10", stream: "Secondary", qualification: "M.A. History, B.Ed.", experience: "13 years", icon: BookOpen, color: "orange", initials: "MP", description: "History, geography, civics and understanding our world." },
   { name: "Shalini Vyas", subject: "Accountancy", classes: "Classes 11–12", stream: "Commerce", qualification: "M.Com., B.Ed.", experience: "9 years", icon: BriefcaseBusiness, color: "teal", initials: "SV", description: "Accounting principles, practice problems and financial literacy." },
   { name: "Gaurav Bansal", subject: "Business Studies", classes: "Classes 11–12", stream: "Commerce", qualification: "M.Com., MBA", experience: "8 years", icon: BriefcaseBusiness, color: "teal", initials: "GB", description: "Business concepts, management and case-based learning." },
   { name: "Rekha Pareek", subject: "Economics", classes: "Classes 11–12", stream: "Commerce / Arts", qualification: "M.A. Economics, B.Ed.", experience: "10 years", icon: BriefcaseBusiness, color: "teal", initials: "RP", description: "Economic thinking, diagrams and current examples." },
   { name: "Dinesh Choudhary", subject: "Political Science", classes: "Classes 11–12", stream: "Arts", qualification: "M.A. Political Science, B.Ed.", experience: "12 years", icon: School, color: "rose", initials: "DC", description: "Constitution, political ideas and public institutions." },
   { name: "Meera Rathore", subject: "Geography", classes: "Classes 11–12", stream: "Arts", qualification: "M.A. Geography, B.Ed.", experience: "9 years", icon: MapPin, color: "rose", initials: "MR", description: "Maps, environment, resources and human geography." },
   { name: "Arvind Sharma", subject: "History", classes: "Classes 11–12", stream: "Arts", qualification: "M.A. History, B.Ed.", experience: "14 years", icon: BookOpen, color: "rose", initials: "AS", description: "Exploring historical events, sources and perspectives." },
   { name: "Pallavi Jain", subject: "Hindi", classes: "Classes 1–12", stream: "All streams", qualification: "M.A. Hindi, B.Ed.", experience: "10 years", icon: Languages, color: "orange", initials: "PJ", description: "Hindi language, grammar and literature." },
];

const streamCards = [
   { name: "Science • Biology", classes: "11th & 12th", subjects: "Biology, Physics, Chemistry, English", icon: Microscope },
   { name: "Science • Mathematics", classes: "11th & 12th", subjects: "Mathematics, Physics, Chemistry, English", icon: Atom },
   { name: "Commerce", classes: "11th & 12th", subjects: "Accountancy, Business Studies, Economics, English", icon: BriefcaseBusiness },
   { name: "Arts / Humanities", classes: "11th & 12th", subjects: "History, Political Science, Geography, Economics, English", icon: Palette },
];

const filters = [
   "All", "Mathematics", "Science", "Biology", "Commerce",
   "Arts", "English", "Social Science",
];

const palette = {
   amber: "from-amber-500 to-orange-700",
   emerald: "from-emerald-500 to-teal-800",
   cyan: "from-cyan-500 to-blue-800",
   violet: "from-violet-500 to-purple-800",
   blue: "from-blue-500 to-indigo-800",
   orange: "from-orange-500 to-red-800",
   teal: "from-teal-500 to-cyan-800",
   rose: "from-rose-500 to-pink-800",
};

function TeacherAvatar({ initials, color, large = false }) {
   return (
      <div className={`relative flex shrink-0 items-center justify-center bg-gradient-to-br ${color || palette.amber} text-white shadow-lg ${large ? "h-24 w-24 rounded-[26px]" : "h-16 w-16 rounded-2xl"}`}>
         <span className={`font-black tracking-wide ${large ? "text-2xl" : "text-lg"}`}>
            {initials}
         </span>
         <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#211910] bg-amber-400 text-[#211910]">
            <GraduationCap size={13} />
         </span>
      </div>
   );
}

function SectionTitle({ eyebrow, title, description }) {
   return (
      <div className="mx-auto mb-10 max-w-2xl text-center">
         <p className="text-[10px] font-black tracking-[3px] text-amber-400">
            {eyebrow}
         </p>
         <h2 className="mt-3 text-3xl font-black text-[#f5e8d1] sm:text-4xl">
            {title}
         </h2>
         <p className="mt-4 text-sm leading-7 text-[#b7a58a]">
            {description}
         </p>
      </div>
   );
}

export default function Teachers() {
   const [search, setSearch] = useState("");
   const [activeFilter, setActiveFilter] = useState("All");
   const [activeClass, setActiveClass] = useState("All Classes");

   const visibleFaculty = useMemo(() => {
      const q = search.trim().toLowerCase();

      return subjectFaculty.filter((teacher) => {
         const searchableValues = [
            teacher.name,
            teacher.subject,
            teacher.classes,
            teacher.stream,
            teacher.qualification,
         ];

         const matchesSearch =
            !q ||
            searchableValues.some((value) =>
               String(value ?? "").toLowerCase().includes(q)
            );

         const subject = String(teacher.subject || "").toLowerCase();
         const stream = String(teacher.stream || "").toLowerCase();
         const filter = activeFilter.toLowerCase();

         let matchesFilter = activeFilter === "All";

         if (activeFilter === "Science") {
            matchesFilter =
               ["biology", "physics", "chemistry"].includes(subject);
         } else if (activeFilter === "Arts") {
            matchesFilter = stream.includes("arts");
         } else if (activeFilter === "Commerce") {
            matchesFilter = stream.includes("commerce");
         } else if (!matchesFilter) {
            matchesFilter =
               subject.includes(filter) || stream.includes(filter);
         }

         return matchesSearch && matchesFilter;
      });
   }, [search, activeFilter]);

   const visibleClasses = useMemo(
      () =>
         classTeachers.filter(
            (teacher) =>
               activeClass === "All Classes" ||
               teacher.className === activeClass
         ),
      [activeClass]
   );

   return (
      <main className="min-h-screen overflow-hidden bg-[#17120d] text-[#f5e8d1]">
         <style>{`
        @keyframes teacherFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .teacher-float { animation: teacherFloat 6s ease-in-out infinite; }
        .teacher-card {
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .teacher-card:hover {
          transform: translateY(-5px);
          border-color: rgba(251,191,36,.42);
          box-shadow: 0 20px 55px rgba(0,0,0,.22);
        }
        @media (prefers-reduced-motion: reduce) {
          .teacher-float { animation: none; }
          .teacher-card { transition: none; }
        }
      `}</style>

         {/* HERO */}
         <section className="relative overflow-hidden border-b border-amber-400/10 bg-[#20170f] px-5 py-16 sm:px-8 lg:py-24">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[110px]" />
            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-orange-900/20 blur-[110px]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
               <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-[10px] font-black tracking-[2px] text-amber-300">
                     <Sparkles size={14} /> MEET OUR EDUCATORS
                  </div>

                  <h1 className="mt-7 text-4xl font-black leading-[1.12] sm:text-5xl lg:text-6xl">
                     The People Who
                     <span className="mt-2 block text-amber-400">
                        Make Learning Matter.
                     </span>
                  </h1>

                  <p className="mt-6 max-w-xl text-sm leading-8 text-[#c2b29a] sm:text-base">
                     Meet the teachers who guide, encourage and inspire our
                     students. Explore class teachers from Class 1 to 12 and
                     subject specialists across Science, Commerce and Arts.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                     <a href="#class-teachers" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3.5 text-sm font-black text-[#21170d] transition hover:-translate-y-1">
                        Explore Teachers <ArrowRight size={17} />
                     </a>
                     <a href="#subject-faculty" className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-white/[.03] px-6 py-3.5 text-sm font-bold text-[#f0dfc2] transition hover:bg-amber-400/10">
                        Find by Subject <Search size={16} />
                     </a>
                  </div>

                  <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                     {[
                        ["12", "Class Teachers"],
                        ["15", "Subject Faculty"],
                        ["4", "Senior Streams"],
                     ].map(([number, label]) => (
                        <div key={label} className="rounded-2xl border border-amber-400/10 bg-[#2a1e13]/80 p-4">
                           <p className="text-2xl font-black text-amber-400">{number}</p>
                           <p className="mt-1 text-[10px] font-semibold text-[#b7a58a]">{label}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="teacher-float relative mx-auto w-full max-w-xl">
                  <div className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-amber-500/15 to-transparent blur-2xl" />
                  <div className="relative rounded-[30px] border border-amber-400/20 bg-[#2a1e13] p-5 shadow-2xl sm:p-7">
                     <div className="flex items-center justify-between border-b border-amber-400/10 pb-5">
                        <div>
                           <p className="text-[10px] font-black tracking-[2px] text-amber-400">OUR SCHOOL COMMUNITY</p>
                           <h2 className="mt-2 text-xl font-black">A team that inspires</h2>
                        </div>
                        <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-400">
                           <Users size={25} />
                        </div>
                     </div>

                     <div className="mt-6 grid grid-cols-2 gap-3">
                        {classTeachers.slice(0, 4).map((teacher) => (
                           <div key={teacher.className} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#1b150f] p-3">
                              <TeacherAvatar initials={teacher.initials} color={teacher.color} />
                              <div className="min-w-0">
                                 <p className="truncate text-xs font-extrabold">{teacher.name}</p>
                                 <p className="mt-1 text-[10px] text-[#a9977e]">{teacher.className} Teacher</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
                        <Award className="shrink-0 text-amber-400" size={25} />
                        <p className="text-xs leading-5 text-[#c5b394]">
                           Dedicated educators. Individual attention. A supportive learning environment.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* INTRO */}
         <section className="border-b border-amber-400/10 bg-[#1b150f] px-5 py-7 sm:px-8">
            <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
               {[
                  [GraduationCap, "Qualified Educators", "Experienced and subject-focused teaching team."],
                  [BookOpen, "Class-wise Guidance", "A class teacher contact point for every grade."],
                  [Star, "Student First", "Encouragement, support and meaningful learning."],
               ].map(([Icon, title, description]) => (
                  <div key={title} className="flex items-center gap-4 rounded-2xl border border-amber-400/10 bg-[#251b12] p-5">
                     <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                        <Icon size={23} />
                     </div>
                     <div>
                        <h3 className="text-sm font-extrabold">{title}</h3>
                        <p className="mt-1 text-xs text-[#a9977e]">{description}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* CLASS TEACHERS */}
         <section id="class-teachers" className="scroll-mt-20 px-5 py-16 sm:px-8 lg:py-20">
            <SectionTitle
               eyebrow="CLASS-WISE FACULTY"
               title="Who Is the Class Teacher?"
               description="Find the class teacher for each grade from Class 1 to Class 12. These demo profiles show how your school's class-wise teacher directory can look."
            />

            <div className="mx-auto max-w-7xl">
               <div className="mb-7 flex flex-wrap items-center justify-center gap-2">
                  {["All Classes", ...classTeachers.map((teacher) => teacher.className)].map((name) => (
                     <button
                        key={name}
                        type="button"
                        onClick={() => setActiveClass(name)}
                        className={`rounded-full border px-4 py-2 text-xs font-bold transition ${activeClass === name
                              ? "border-amber-400 bg-amber-400 text-[#21170d]"
                              : "border-amber-400/15 bg-[#241a11] text-[#c5b394] hover:border-amber-400/50"
                           }`}
                     >
                        {name}
                     </button>
                  ))}
               </div>

               <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleClasses.map((teacher) => (
                     <article key={teacher.className} className="teacher-card rounded-[24px] border border-amber-400/10 bg-[#211910] p-6">
                        <div className="flex items-start justify-between gap-4">
                           <TeacherAvatar initials={teacher.initials} color={teacher.color} large />
                           <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black text-amber-300">
                              {teacher.className}
                           </span>
                        </div>
                        <h3 className="mt-5 text-xl font-black">{teacher.name}</h3>
                        <p className="mt-1 text-xs font-bold text-amber-400">{teacher.subject}</p>
                        <p className="mt-4 text-sm leading-6 text-[#b7a58a]">“{teacher.quote}”</p>
                        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                           <div>
                              <p className="text-[10px] text-[#8f7d64]">QUALIFICATION</p>
                              <p className="mt-1 text-xs font-semibold text-[#e6d5b8]">{teacher.qualification}</p>
                           </div>
                           <div>
                              <p className="text-[10px] text-[#8f7d64]">EXPERIENCE</p>
                              <p className="mt-1 text-xs font-semibold text-[#e6d5b8]">{teacher.experience}</p>
                           </div>
                        </div>
                     </article>
                  ))}
               </div>
            </div>
         </section>

         {/* STREAMS */}
         <section className="border-y border-amber-400/10 bg-[#1d160f] px-5 py-16 sm:px-8 lg:py-20">
            <SectionTitle
               eyebrow="SENIOR SECONDARY"
               title="Class 11 & 12 Streams"
               description="Explore the subject combinations and specialist faculty areas for senior secondary students."
            />

            <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
               {streamCards.map((stream) => {
                  const Icon = stream.icon;
                  return (
                     <article key={stream.name} className="teacher-card rounded-[24px] border border-amber-400/10 bg-[#251b12] p-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                           <Icon size={27} />
                        </div>
                        <p className="mt-5 text-[10px] font-black tracking-[2px] text-amber-400">{stream.classes}</p>
                        <h3 className="mt-2 text-xl font-black">{stream.name}</h3>
                        <p className="mt-4 text-xs leading-6 text-[#b7a58a]">{stream.subjects}</p>
                        <a href="#subject-faculty" className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold text-amber-300 hover:text-amber-200">
                           Meet subject faculty <ArrowUpRight size={15} />
                        </a>
                     </article>
                  );
               })}
            </div>

            <p className="mx-auto mt-6 max-w-7xl text-center text-[11px] leading-5 text-[#8f7d64]">
               Subject combinations shown are sample website content. Confirm the subjects actually offered by your school before publishing.
            </p>
         </section>

         {/* SUBJECT FACULTY */}
         <section id="subject-faculty" className="scroll-mt-20 px-5 py-16 sm:px-8 lg:py-20">
            <SectionTitle
               eyebrow="SUBJECT SPECIALISTS"
               title="Meet Our Subject Teachers"
               description="Looking for the Mathematics, Biology, Physics, Chemistry, Commerce or Arts teacher? Search or filter the demo faculty directory below."
            />

            <div className="mx-auto max-w-7xl">
               <div className="mb-7 rounded-[24px] border border-amber-400/15 bg-[#211910] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                     <div className="relative w-full lg:max-w-sm">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
                        <input
                           type="search"
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           placeholder="Search teacher, subject or stream..."
                           className="w-full rounded-xl border border-[#66513a] bg-[#17120d] py-3 pl-11 pr-4 text-sm text-[#f6e9d2] outline-none placeholder:text-[#9b896f] focus:border-amber-400"
                        />
                     </div>

                     <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 flex items-center gap-1 text-[10px] font-bold text-[#a9977e]">
                           <Filter size={14} /> FILTER
                        </span>
                        {filters.map((filter) => (
                           <button
                              key={filter}
                              type="button"
                              onClick={() => setActiveFilter(filter)}
                              className={`rounded-full border px-3 py-2 text-[11px] font-bold transition ${activeFilter === filter
                                    ? "border-amber-400 bg-amber-400 text-[#21170d]"
                                    : "border-amber-400/15 bg-[#2a2016] text-[#c5b394] hover:border-amber-400/50"
                                 }`}
                           >
                              {filter}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <p className="mb-5 text-xs text-[#a9977e]">
                  Showing <span className="font-bold text-amber-300">{visibleFaculty.length}</span> demo subject teacher profiles
               </p>

               {visibleFaculty.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                     {visibleFaculty.map((teacher) => {
                        const Icon = teacher.icon;
                        return (
                           <article key={`${teacher.name}-${teacher.subject}`} className="teacher-card rounded-[24px] border border-amber-400/10 bg-[#211910] p-6">
                              <div className="flex items-start justify-between gap-3">
                                 <TeacherAvatar
                                    initials={teacher.initials}
                                    color={palette[teacher.color] || palette.amber}
                                 />
                                 <span className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-amber-400">
                                    <Icon size={21} />
                                 </span>
                              </div>

                              <h3 className="mt-5 text-xl font-black">{teacher.name}</h3>
                              <p className="mt-1 text-sm font-extrabold text-amber-400">{teacher.subject}</p>

                              <div className="mt-4 flex flex-wrap gap-2">
                                 <span className="rounded-full bg-[#342719] px-3 py-1.5 text-[10px] font-bold text-[#e5d1ae]">{teacher.classes}</span>
                                 <span className="rounded-full bg-[#342719] px-3 py-1.5 text-[10px] font-bold text-[#e5d1ae]">{teacher.stream}</span>
                              </div>

                              <p className="mt-4 text-xs leading-6 text-[#b7a58a]">{teacher.description}</p>

                              <div className="mt-5 border-t border-white/10 pt-4">
                                 <p className="text-[10px] font-black tracking-[1px] text-[#8f7d64]">QUALIFICATION</p>
                                 <p className="mt-1 text-xs font-semibold text-[#e6d5b8]">{teacher.qualification}</p>
                                 <p className="mt-3 text-xs text-[#a9977e]">{teacher.experience} teaching experience</p>
                              </div>
                           </article>
                        );
                     })}
                  </div>
               ) : (
                  <div className="rounded-2xl border border-amber-400/15 bg-[#211910] px-6 py-14 text-center">
                     <Search className="mx-auto text-amber-400" size={30} />
                     <h3 className="mt-4 text-lg font-black">No matching teacher found</h3>
                     <p className="mt-2 text-sm text-[#a9977e]">Try another teacher name, subject or filter.</p>
                     <button
                        type="button"
                        onClick={() => {
                           setSearch("");
                           setActiveFilter("All");
                        }}
                        className="mt-5 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-[#21170d]"
                     >
                        Clear Filters
                     </button>
                  </div>
               )}
            </div>
         </section>

         {/* CONTACT / FOOTER SECTION */}
         <section className="border-t border-amber-400/10 bg-[#211910] px-5 py-16 sm:px-8">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
               <div>
                  <p className="text-[10px] font-black tracking-[3px] text-amber-400">OUR COMMITMENT</p>
                  <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                     Every student deserves a teacher who believes in them.
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-[#b7a58a]">
                     At {schoolInfo.name}, our aim is to create a welcoming learning
                     environment where students can ask questions, build confidence
                     and discover their strengths.
                  </p>
               </div>

               <div className="rounded-[26px] border border-amber-400/15 bg-[#2a1e13] p-7">
                  <div className="flex items-center gap-3">
                     <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                        <School size={24} />
                     </div>
                     <div>
                        <h3 className="font-black">Want to know more?</h3>
                        <p className="mt-1 text-xs text-[#a9977e]">
                           Contact the school office for verified faculty information.
                        </p>
                     </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-[#e6d5b8]">
                     <p className="flex items-center gap-3"><MapPin size={17} className="text-amber-400" /> {schoolInfo.location}</p>
                     <p className="flex items-center gap-3"><Mail size={17} className="text-amber-400" /> info@school.com <span className="text-[10px] text-[#8f7d64]">(demo)</span></p>
                     <p className="flex items-center gap-3"><Phone size={17} className="text-amber-400" /> +91 98765 43210 <span className="text-[10px] text-[#8f7d64]">(demo)</span></p>
                  </div>
               </div>
            </div>

            <p className="mx-auto mt-10 max-w-7xl rounded-xl border border-amber-400/15 bg-amber-400/5 p-4 text-center text-[11px] leading-5 text-[#b7a58a]">
               Demo notice: All teacher names, qualifications, experience and
               contact details on this page are illustrative sample data, not
               verified Sunrise Public School staff information. Replace them
               with approved school records before publishing.
            </p>
         </section>
      </main>
   );
}
