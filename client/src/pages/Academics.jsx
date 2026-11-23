
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import {
   ArrowRight,
   ArrowUpRight,
   BookOpen,
   BookMarked,
   Brain,
   Calculator,
   CalendarDays,
   CheckCircle2,
   ChevronRight,
   Clock,
   Compass,
   FlaskConical,
   Globe,
   GraduationCap,
   Languages,
   Lightbulb,
   Microscope,
   Monitor,
   Music,
   Palette,
   PenTool,
   School,
   Sparkles,
   Target,
   Trophy,
   Users,
} from "lucide-react";

const images = {
   hero: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1400",
   primary: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900",
   middle: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=900",
   secondary: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900",
   senior: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900",
   science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900",
   library: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900",
   technology: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900",
};

const programs = [
   {
      level: "01",
      title: "Primary School",
      grades: "Classes 1 - 5",
      tagline: "Building Strong Foundations",
      description:
         "An engaging introduction to learning where children develop reading, writing, numeracy, communication and curiosity through structured classroom experiences.",
      image: images.primary,
      icon: BookOpen,
      subjects: ["English", "Hindi", "Mathematics", "EVS", "Art & Craft"],
      color: "from-amber-400/20 to-orange-500/5",
   },
   {
      level: "02",
      title: "Middle School",
      grades: "Classes 6 - 8",
      tagline: "Discovering New Possibilities",
      description:
         "Students strengthen their academic foundations, explore new concepts and develop independent thinking, problem-solving and collaboration skills.",
      image: images.middle,
      icon: Brain,
      subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"],
      color: "from-yellow-400/20 to-amber-500/5",
   },
   {
      level: "03",
      title: "Secondary School",
      grades: "Classes 9 - 10",
      tagline: "Preparing For Achievement",
      description:
         "A focused academic experience that encourages conceptual understanding, consistent practice, analytical thinking and examination readiness.",
      image: images.secondary,
      icon: Target,
      subjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"],
      color: "from-orange-400/20 to-amber-500/5",
   },
   {
      level: "04",
      title: "Senior Secondary",
      grades: "Classes 11 - 12",
      tagline: "Choosing Your Future",
      description:
         "An advanced learning stage where students explore subject combinations, develop deeper knowledge and prepare for higher education and future careers.",
      image: images.senior,
      icon: GraduationCap,
      subjects: ["Science", "Commerce", "Humanities"],
      color: "from-amber-400/20 to-yellow-500/5",
   },
];

const subjectAreas = [
   {
      icon: Languages,
      title: "Languages",
      description:
         "Reading, writing, communication, comprehension and expression.",
   },
   {
      icon: Calculator,
      title: "Mathematics",
      description:
         "Numerical understanding, logical reasoning and problem solving.",
   },
   {
      icon: FlaskConical,
      title: "Science",
      description:
         "Observation, experimentation, discovery and scientific thinking.",
   },
   {
      icon: Globe,
      title: "Social Science",
      description:
         "History, geography, society, culture and responsible citizenship.",
   },
   {
      icon: Monitor,
      title: "Computer Education",
      description:
         "Digital awareness, technology concepts and responsible computer use.",
   },
   {
      icon: Palette,
      title: "Creative Arts",
      description:
         "Art, design, imagination, creativity and visual expression.",
   },
];

const learningMethods = [
   {
      icon: Lightbulb,
      title: "Concept-Based Learning",
      description:
         "Understanding the reason behind every concept instead of relying only on memorisation.",
   },
   {
      icon: Users,
      title: "Collaborative Activities",
      description:
         "Group discussions and activities that encourage teamwork and communication.",
   },
   {
      icon: Microscope,
      title: "Practical Exploration",
      description:
         "Demonstrations, experiments and activities that connect learning with experience.",
   },
   {
      icon: Brain,
      title: "Critical Thinking",
      description:
         "Developing the ability to analyse information and find thoughtful solutions.",
   },
];

const activities = [
   {
      icon: Trophy,
      title: "Sports & Fitness",
      description:
         "Physical activities, teamwork, fitness and the spirit of participation.",
   },
   {
      icon: Music,
      title: "Music & Performance",
      description:
         "Opportunities to explore music, rhythm, performance and self-expression.",
   },
   {
      icon: Palette,
      title: "Art & Creativity",
      description:
         "Creative projects, drawing, craft and imaginative expression.",
   },
   {
      icon: Compass,
      title: "Clubs & Exploration",
      description:
         "Learning activities that encourage curiosity, responsibility and collaboration.",
   },
];

const sampleCalendar = [
   {
      month: "APR",
      title: "Academic Session Begins",
      description: "Orientation and classroom learning activities.",
   },
   {
      month: "JUL",
      title: "Learning Review",
      description: "Progress discussions and academic review.",
   },
   {
      month: "OCT",
      title: "Term Assessment",
      description: "Assessment and learning progress evaluation.",
   },
   {
      month: "MAR",
      title: "Annual Evaluation",
      description: "Year-end assessment and academic review.",
   },
];

function Reveal({ children, className = "", delay = 0 }) {
   return (
      <div
         className={`academic-reveal ${className}`}
         style={{ transitionDelay: `${delay}ms` }}
      >
         {children}
      </div>
   );
}

export default function Academics() {
   useEffect(() => {
      const elements = document.querySelectorAll(".academic-reveal");

      if (!("IntersectionObserver" in window)) {
         elements.forEach((el) => el.classList.add("visible"));
         return;
      }

      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  entry.target.classList.add("visible");
                  observer.unobserve(entry.target);
               }
            });
         },
         { threshold: 0.12 }
      );

      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
   }, []);

   return (
      <main className="min-h-screen overflow-hidden bg-[#f7f3eb] text-[#241c14]">

         <style>{`
        .academic-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity .75s ease,
            transform .75s ease;
        }

        .academic-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes academicFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes academicGlow {
          0%, 100% { opacity: .4; }
          50% { opacity: .8; }
        }

        .academic-float {
          animation: academicFloat 5s ease-in-out infinite;
        }

        .academic-glow {
          animation: academicGlow 4s ease-in-out infinite;
        }

        .academic-image {
          transition: transform .7s ease;
        }

        .academic-image:hover {
          transform: scale(1.06);
        }

        @media (prefers-reduced-motion: reduce) {
          .academic-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .academic-float,
          .academic-glow {
            animation: none;
          }
        }
      `}</style>

         {/* HERO SECTION */}
         <section className="relative flex min-h-[590px] items-center overflow-hidden bg-[#17120d] py-24 text-white">

            <div className="absolute inset-0">
               <img
                  src={images.hero}
                  alt="Students learning in a classroom"
                  className="h-full w-full object-cover opacity-25"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-[#130f0b] via-[#17120d]/90 to-[#17120d]/40" />
            </div>

            <div className="academic-glow absolute -left-32 top-10 h-80 w-80 rounded-full bg-amber-500/15 blur-[110px]" />

            <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">

               <Reveal>
                  <div className="mb-6 flex items-center gap-3">
                     <span className="h-px w-10 bg-amber-400" />
                     <span className="text-xs font-bold tracking-[4px] text-amber-400">
                        ACADEMIC EXCELLENCE
                     </span>
                  </div>

                  <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                     Learning Today.
                     <span className="mt-2 block text-amber-400">
                        Leading Tomorrow.
                     </span>
                  </h1>

                  <p className="mt-7 max-w-xl text-sm leading-8 text-slate-300 sm:text-base">
                     Explore an academic journey designed to develop knowledge,
                     confidence, creativity and independent thinking at every
                     stage of a student's education.
                  </p>

                  <div className="mt-9 flex flex-wrap gap-4">
                     <a
                        href="#programs"
                        className="inline-flex items-center gap-3 rounded-full bg-amber-400 px-7 py-4 text-sm font-bold text-black transition hover:-translate-y-1 hover:bg-amber-300"
                     >
                        Explore Programs
                        <ArrowRight size={18} />
                     </a>

                     <Link
                        to="/contact"
                        className="inline-flex items-center gap-3 rounded-full border border-white/25 px-7 py-4 text-sm font-semibold transition hover:border-amber-400 hover:text-amber-400"
                     >
                        Enquire Now
                        <ArrowUpRight size={17} />
                     </Link>
                  </div>
               </Reveal>

               <div className="relative mx-auto w-full max-w-lg">
                  <div className="academic-float relative">
                     <img
                        src={images.science}
                        alt="Students exploring science"
                        className="h-[340px] w-full rounded-[28px] border border-white/10 object-cover shadow-2xl sm:h-[420px]"
                     />

                     <div className="absolute -bottom-6 -left-3 rounded-2xl border border-amber-400/20 bg-[#241b12] p-5 shadow-xl sm:-left-7">
                        <div className="flex items-center gap-3">
                           <div className="rounded-xl bg-amber-400/15 p-3 text-amber-400">
                              <BookOpen size={26} />
                           </div>
                           <div>
                              <p className="font-bold">Explore. Learn. Grow.</p>
                              <p className="mt-1 text-xs text-slate-400">
                                 An Inspired Learning Journey
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </section>

         {/* INTRODUCTION */}
         <section className="px-5 py-20 sm:px-8 lg:px-10">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

               <Reveal>
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-800">
                     OUR ACADEMIC PHILOSOPHY
                  </p>

                  <h2 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                     Every Stage Has
                     <span className="block text-amber-800">
                        A New Opportunity
                     </span>
                  </h2>

                  <p className="mt-6 text-sm leading-8 text-stone-600 sm:text-base">
                     At Sunrise Public School, academic learning is planned
                     around the changing needs of students as they grow.
                     Our approach aims to build strong foundations, develop
                     deeper understanding and encourage students to become
                     confident independent learners.
                  </p>

                  <p className="mt-5 text-sm leading-8 text-stone-600 sm:text-base">
                     From early academic foundations to senior secondary
                     subject exploration, each stage offers opportunities
                     to learn, practise, ask questions and develop new skills.
                  </p>

                  <div className="mt-8 flex items-center gap-3 text-sm font-bold text-amber-800">
                     <CheckCircle2 size={20} />
                     Learning With Purpose And Progress
                  </div>
               </Reveal>

               <Reveal delay={150}>
                  <div className="relative">
                     <img
                        src={images.library}
                        alt="Illustrative school library"
                        className="h-[390px] w-full rounded-[28px] object-cover shadow-xl sm:h-[460px]"
                     />

                     <div className="absolute -bottom-6 -right-3 rounded-2xl bg-[#211910] p-6 text-white shadow-xl sm:-right-6">
                        <BookMarked size={27} className="mb-3 text-amber-400" />
                        <p className="text-lg font-bold">Knowledge For Life</p>
                        <p className="mt-1 text-xs text-slate-400">
                           Beyond The Classroom
                        </p>
                     </div>
                  </div>
               </Reveal>

            </div>
         </section>

         {/* PROGRAMS */}
         <section id="programs" className="scroll-mt-20 bg-[#17120d] px-5 py-24 text-white sm:px-8 lg:px-10">

            <div className="mx-auto max-w-7xl">

               <Reveal className="mb-14 text-center">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-400">
                     OUR ACADEMIC PROGRAMS
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">
                     A Learning Path For
                     <span className="text-amber-400"> Every Stage</span>
                  </h2>

                  <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-400">
                     Explore the four broad academic stages and the learning
                     experiences associated with each one.
                  </p>
               </Reveal>

               <div className="grid gap-7 md:grid-cols-2">
                  {programs.map((program, index) => {
                     const Icon = program.icon;

                     return (
                        <Reveal key={program.title} delay={index * 100}>
                           <article className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition duration-500 hover:-translate-y-2 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-950/20">

                              <div className="relative h-60 overflow-hidden">
                                 <img
                                    src={program.image}
                                    alt={`${program.title} illustrative learning`}
                                    loading="lazy"
                                    className="academic-image h-full w-full object-cover"
                                 />

                                 <div className="absolute inset-0 bg-gradient-to-t from-[#17120d] via-transparent to-black/10" />

                                 <div className="absolute left-5 top-5 rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-xs font-black tracking-widest text-amber-300 backdrop-blur-md">
                                    LEVEL {program.level}
                                 </div>

                                 <div className="absolute bottom-5 left-6 flex items-center gap-3">
                                    <div className="rounded-xl bg-amber-400 p-3 text-black">
                                       <Icon size={23} />
                                    </div>

                                    <div>
                                       <p className="text-xl font-extrabold">
                                          {program.title}
                                       </p>
                                       <p className="text-sm text-amber-300">
                                          {program.grades}
                                       </p>
                                    </div>
                                 </div>
                              </div>

                              <div className="p-7">
                                 <p className="text-sm font-bold text-amber-400">
                                    {program.tagline}
                                 </p>

                                 <p className="mt-4 text-sm leading-7 text-slate-400">
                                    {program.description}
                                 </p>

                                 <div className="mt-6 border-t border-white/10 pt-5">
                                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-300">
                                       Learning Areas
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                       {program.subjects.map((subject) => (
                                          <span
                                             key={subject}
                                             className="rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-3 py-2 text-xs text-amber-100"
                                          >
                                             {subject}
                                          </span>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                                    <span className="text-xs font-semibold text-slate-400">
                                       Academic Learning Stage
                                    </span>

                                    <ArrowUpRight
                                       size={19}
                                       className="text-amber-400 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                                    />
                                 </div>
                              </div>

                           </article>
                        </Reveal>
                     );
                  })}
               </div>

            </div>
         </section>

         {/* SUBJECT AREAS */}
         <section className="px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <Reveal className="mb-14">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-800">
                     AREAS OF LEARNING
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Explore Different
                     <span className="text-amber-800"> Subjects</span>
                  </h2>

                  <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-500">
                     A broad range of learning areas helps students develop
                     knowledge, communication, reasoning and creativity.
                  </p>
               </Reveal>

               <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {subjectAreas.map((subject, index) => {
                     const Icon = subject.icon;

                     return (
                        <Reveal key={subject.title} delay={index * 80}>
                           <div className="group flex h-full gap-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#251b12] text-amber-400 transition group-hover:bg-amber-400 group-hover:text-black">
                                 <Icon size={26} />
                              </div>

                              <div>
                                 <h3 className="text-lg font-extrabold">
                                    {subject.title}
                                 </h3>

                                 <p className="mt-3 text-sm leading-7 text-stone-500">
                                    {subject.description}
                                 </p>
                              </div>
                           </div>
                        </Reveal>
                     );
                  })}
               </div>

            </div>
         </section>

         {/* TEACHING METHODOLOGY */}
         <section className="bg-[#eee6d8] px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <Reveal className="mb-14 text-center">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-800">
                     THE WAY WE LEARN
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Our Teaching Approach
                  </h2>

                  <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-stone-600">
                     Encouraging students to participate actively, understand
                     concepts and connect knowledge with everyday experiences.
                  </p>
               </Reveal>

               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {learningMethods.map((method, index) => {
                     const Icon = method.icon;

                     return (
                        <Reveal key={method.title} delay={index * 90}>
                           <div className="h-full rounded-3xl border border-stone-300/70 bg-[#faf8f3] p-7 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#211910] text-amber-400">
                                 <Icon size={27} />
                              </div>

                              <h3 className="mt-7 text-lg font-extrabold">
                                 {method.title}
                              </h3>

                              <p className="mt-4 text-sm leading-7 text-stone-500">
                                 {method.description}
                              </p>
                           </div>
                        </Reveal>
                     );
                  })}
               </div>

            </div>
         </section>

         {/* LEARNING ENVIRONMENT */}
         <section className="px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

               <Reveal>
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-800">
                     LEARNING SPACES
                  </p>

                  <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                     Discover. Experiment.
                     <span className="block text-amber-800">
                        Create.
                     </span>
                  </h2>

                  <p className="mt-6 text-sm leading-8 text-stone-600">
                     A supportive educational environment can help students
                     turn curiosity into understanding. Learning resources,
                     classroom activities and opportunities for exploration
                     all play an important role in the educational journey.
                  </p>

                  <div className="mt-8 space-y-5">
                     {[
                        {
                           icon: BookMarked,
                           title: "Reading & Research",
                           text: "Encouraging independent reading and information discovery.",
                        },
                        {
                           icon: Microscope,
                           title: "Science Exploration",
                           text: "Making scientific concepts interesting through practical learning.",
                        },
                        {
                           icon: Monitor,
                           title: "Digital Awareness",
                           text: "Introducing technology and responsible digital learning.",
                        },
                     ].map((item) => {
                        const Icon = item.icon;

                        return (
                           <div key={item.title} className="flex gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#211910] text-amber-400">
                                 <Icon size={23} />
                              </div>

                              <div>
                                 <h3 className="font-bold">{item.title}</h3>
                                 <p className="mt-1 text-sm leading-6 text-stone-500">
                                    {item.text}
                                 </p>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </Reveal>

               <Reveal delay={150}>
                  <div className="grid grid-cols-2 gap-4">
                     <img
                        src={images.library}
                        alt="Library learning"
                        loading="lazy"
                        className="h-64 w-full rounded-2xl object-cover"
                     />

                     <img
                        src={images.technology}
                        alt="Digital learning"
                        loading="lazy"
                        className="mt-10 h-64 w-full rounded-2xl object-cover"
                     />

                     <img
                        src={images.science}
                        alt="Science exploration"
                        loading="lazy"
                        className="-mt-6 h-64 w-full rounded-2xl object-cover"
                     />

                     <img
                        src={images.primary}
                        alt="Students learning"
                        loading="lazy"
                        className="h-64 w-full rounded-2xl object-cover"
                     />
                  </div>
               </Reveal>

            </div>
         </section>

         {/* CO-CURRICULAR ACTIVITIES */}
         <section className="bg-[#17120d] px-5 py-24 text-white sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <Reveal className="mb-14 text-center">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-400">
                     BEYOND ACADEMICS
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Learning Through
                     <span className="text-amber-400"> Activities</span>
                  </h2>

                  <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-400">
                     Students also need opportunities to discover interests,
                     express creativity, develop teamwork and enjoy learning.
                  </p>
               </Reveal>

               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {activities.map((activity, index) => {
                     const Icon = activity.icon;

                     return (
                        <Reveal key={activity.title} delay={index * 90}>
                           <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-2 hover:border-amber-400/40 hover:bg-white/[0.07]">
                              <Icon size={32} className="text-amber-400" />

                              <h3 className="mt-6 text-lg font-bold">
                                 {activity.title}
                              </h3>

                              <p className="mt-4 text-sm leading-7 text-slate-400">
                                 {activity.description}
                              </p>
                           </div>
                        </Reveal>
                     );
                  })}
               </div>

            </div>
         </section>

         {/* ASSESSMENT */}
         <section className="px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

               <Reveal>
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-800">
                     STUDENT PROGRESS
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Assessment & Evaluation
                  </h2>

                  <p className="mt-6 text-sm leading-8 text-stone-600">
                     Assessment can help teachers and students understand
                     academic progress, identify learning needs and plan
                     the next steps in the educational journey.
                  </p>

                  <div className="mt-8 space-y-5">
                     {[
                        "Regular classroom assessments",
                        "Assignments and subject activities",
                        "Periodic academic reviews",
                        "Feedback and improvement guidance",
                        "Year-end academic evaluation",
                     ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                           <CheckCircle2
                              size={19}
                              className="shrink-0 text-amber-700"
                           />
                           <p className="text-sm font-semibold text-stone-700">
                              {item}
                           </p>
                        </div>
                     ))}
                  </div>
               </Reveal>

               <Reveal delay={150}>
                  <div className="rounded-3xl bg-[#211910] p-8 text-white shadow-2xl sm:p-10">
                     <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-black">
                        <Target size={28} />
                     </div>

                     <h3 className="text-2xl font-black">
                        Progress With Purpose
                     </h3>

                     <p className="mt-5 text-sm leading-8 text-slate-400">
                        Every student learns differently. Thoughtful assessment
                        and constructive feedback can help learners recognise
                        their strengths and work towards improvement.
                     </p>

                     <div className="mt-8 border-t border-white/10 pt-7">
                        <div className="flex items-center justify-between gap-4">
                           <div>
                              <p className="font-bold text-amber-400">
                                 Understand
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                 Recognise learning needs
                              </p>
                           </div>

                           <ArrowRight className="text-amber-400" />

                           <div>
                              <p className="font-bold text-amber-400">
                                 Improve
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                 Work towards progress
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </Reveal>

            </div>
         </section>

         {/* ACADEMIC CALENDAR */}
         <section className="bg-[#eee6d8] px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <Reveal className="mb-14">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-800">
                     A PLANNED LEARNING JOURNEY
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Academic Year Overview
                  </h2>

                  <p className="mt-5 max-w-2xl text-sm leading-8 text-stone-600">
                     An illustrative academic calendar showing how a school
                     year may be organised. Actual dates and activities should
                     be updated by the school administration.
                  </p>
               </Reveal>

               <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {sampleCalendar.map((item, index) => (
                     <Reveal key={item.month} delay={index * 90}>
                        <div className="relative h-full rounded-2xl border border-stone-300 bg-[#faf8f3] p-7 shadow-sm">
                           <div className="mb-6 flex items-center justify-between">
                              <span className="rounded-xl bg-[#211910] px-4 py-3 text-sm font-black tracking-widest text-amber-400">
                                 {item.month}
                              </span>

                              <CalendarDays className="text-amber-700" size={23} />
                           </div>

                           <h3 className="text-lg font-extrabold">
                              {item.title}
                           </h3>

                           <p className="mt-4 text-sm leading-7 text-stone-500">
                              {item.description}
                           </p>
                        </div>
                     </Reveal>
                  ))}
               </div>

            </div>
         </section>

         {/* FINAL CTA */}
         <section className="relative overflow-hidden bg-[#17120d] px-5 py-24 text-center text-white sm:px-8">
            <div className="academic-glow absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/15 blur-[100px]" />

            <Reveal className="relative mx-auto max-w-3xl">
               <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-black">
                  <GraduationCap size={34} />
               </div>

               <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-400">
                  YOUR ACADEMIC JOURNEY
               </p>

               <h2 className="text-3xl font-black leading-tight sm:text-5xl">
                  Every Great Future
                  <span className="block text-amber-400">
                     Begins With Learning.
                  </span>
               </h2>

               <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-slate-400">
                  Discover the academic opportunities at Sunrise Public
                  School and connect with us to learn more.
               </p>

               <div className="mt-9 flex flex-wrap justify-center gap-4">
                  <Link
                     to="/admissions"
                     className="inline-flex items-center gap-3 rounded-full bg-amber-400 px-8 py-4 text-sm font-extrabold text-black transition hover:-translate-y-1 hover:bg-amber-300"
                  >
                     Explore Admissions
                     <ArrowRight size={18} />
                  </Link>

                  <Link
                     to="/contact"
                     className="inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-sm font-bold transition hover:border-amber-400 hover:text-amber-400"
                  >
                     Contact Us
                     <ArrowUpRight size={18} />
                  </Link>
               </div>
            </Reveal>
         </section>

      </main>
   );
}
