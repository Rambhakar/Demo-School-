
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
   ArrowRight,
   ArrowUpRight,
   BookOpen,
   GraduationCap,
   Users,
   Award,
   Trophy,
   Lightbulb,
   ShieldCheck,
   Heart,
   Star,
   CalendarDays,
   Clock3,
   MapPin,
   Phone,
   Mail,
   CheckCircle2,
   FlaskConical,
   Palette,
   Music,
   Dumbbell,
   Library,
   Target,
   Sparkles,
   Quote,
   ChevronRight,
   School,
   BookMarked,
   Globe2,
   Microscope,
   Medal,
   Bus,
   NotebookPen,
} from "lucide-react";

/* =========================================
   SCROLL REVEAL
========================================= */

function Reveal({ children, delay = 0, className = "" }) {
   const ref = useRef(null);
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      const element = ref.current;
      if (!element) return;

      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setVisible(true);
               observer.unobserve(element);
            }
         },
         { threshold: 0.12 }
      );

      observer.observe(element);
      return () => observer.disconnect();
   }, []);

   return (
      <div
         ref={ref}
         style={{ transitionDelay: `${delay}ms` }}
         className={`${className} transform transition-all duration-700 ease-out ${visible
               ? "translate-y-0 opacity-100"
               : "translate-y-10 opacity-0"
            }`}
      >
         {children}
      </div>
   );
}

/* =========================================
   ANIMATED COUNTER
========================================= */

function Counter({ end, suffix = "" }) {
   const ref = useRef(null);
   const [count, setCount] = useState(0);
   const [started, setStarted] = useState(false);

   useEffect(() => {
      const element = ref.current;
      if (!element) return;

      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setStarted(true);
               observer.disconnect();
            }
         },
         { threshold: 0.3 }
      );

      observer.observe(element);
      return () => observer.disconnect();
   }, []);

   useEffect(() => {
      if (!started) return;

      let frame;
      let startTime;

      const animate = (timestamp) => {
         if (!startTime) startTime = timestamp;

         const progress = Math.min(
            (timestamp - startTime) / 1800,
            1
         );

         const eased = 1 - Math.pow(1 - progress, 4);
         setCount(Math.floor(eased * end));

         if (progress < 1) {
            frame = requestAnimationFrame(animate);
         }
      };

      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
   }, [started, end]);

   return (
      <span ref={ref}>
         {count}
         {suffix}
      </span>
   );
}

/* =========================================
   SECTION HEADING
========================================= */

function SectionHeading({ eyebrow, title, description, center = true }) {
   return (
      <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
         <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d5b486]/20 bg-[#d5b486]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#dfc397] sm:text-xs">
            <Sparkles size={14} />
            {eyebrow}
         </div>

         <h2 className="text-3xl font-black leading-tight tracking-tight text-[#fff3e2] sm:text-4xl md:text-5xl">
            {title}
         </h2>

         {description && (
            <p className="mt-5 text-sm leading-8 text-[#b8a994] sm:text-base">
               {description}
            </p>
         )}
      </div>
   );
}

/* =========================================
   MAIN HOME PAGE
========================================= */

export default function Home() {
   const stats = [
      { number: 1500, suffix: "+", label: "Happy Students", icon: Users },
      { number: 80, suffix: "+", label: "Expert Teachers", icon: GraduationCap },
      { number: 25, suffix: "+", label: "Years Experience", icon: Award },
      { number: 95, suffix: "%", label: "Academic Results", icon: Trophy },
   ];

   const features = [
      {
         icon: BookOpen,
         title: "Quality Education",
         description:
            "A strong academic foundation with engaging lessons, individual attention and conceptual understanding.",
      },
      {
         icon: ShieldCheck,
         title: "Safe Environment",
         description:
            "A caring and disciplined campus where students feel supported, respected and confident.",
      },
      {
         icon: Lightbulb,
         title: "Creative Thinking",
         description:
            "Practical learning that encourages curiosity, independent thinking and problem-solving.",
      },
      {
         icon: Trophy,
         title: "All-Round Growth",
         description:
            "Sports, competitions and activities that help students discover their talents.",
      },
      {
         icon: Users,
         title: "Personal Attention",
         description:
            "Supportive teachers, regular feedback and a positive learning experience for every student.",
      },
      {
         icon: Globe2,
         title: "Future Ready",
         description:
            "Digital awareness, communication skills and modern learning for tomorrow.",
      },
   ];

   const programs = [
      {
         icon: BookMarked,
         title: "Primary School",
         classes: "Class I – V",
         description:
            "Building strong foundations through joyful learning, exploration and creativity.",
         color: "from-[#725439] to-[#39291c]",
      },
      {
         icon: Library,
         title: "Middle School",
         classes: "Class VI – VIII",
         description:
            "Developing knowledge, confidence and independent thinking across subjects.",
         color: "from-[#5b6349] to-[#303b2a]",
      },
      {
         icon: GraduationCap,
         title: "Senior School",
         classes: "Class IX – XII",
         description:
            "Focused academic preparation, career awareness and personal development.",
         color: "from-[#765747] to-[#3e2b24]",
      },
   ];

   const activities = [
      {
         icon: FlaskConical,
         title: "Science & Discovery",
         text: "Explore, experiment and learn through practical activities.",
      },
      {
         icon: Palette,
         title: "Art & Creativity",
         text: "Express imagination through art, craft and creative projects.",
      },
      {
         icon: Music,
         title: "Music & Culture",
         text: "Celebrate expression, rhythm and cultural traditions.",
      },
      {
         icon: Dumbbell,
         title: "Sports & Fitness",
         text: "Build teamwork, discipline and a healthy lifestyle.",
      },
      {
         icon: Microscope,
         title: "Practical Learning",
         text: "Discover new ideas through observation and exploration.",
      },
      {
         icon: NotebookPen,
         title: "Learning Skills",
         text: "Develop communication, curiosity and independent thinking.",
      },
   ];

   const notices = [
      {
         date: "05",
         month: "DEC",
         category: "Admissions",
         title: "Admissions Open for Academic Session 2026–27",
         description:
            "Registration enquiries are now welcome for eligible classes.",
      },
      {
         date: "12",
         month: "DEC",
         category: "School Event",
         title: "Annual Cultural Celebration",
         description:
            "Students will showcase their talents through performances and activities.",
      },
      {
         date: "18",
         month: "DEC",
         category: "Examination",
         title: "Term Assessment Schedule",
         description:
            "The assessment timetable and important instructions will be shared with students.",
      },
   ];

   const testimonials = [
      {
         quote:
            "The teachers create a positive environment where children feel encouraged to ask questions and learn with confidence.",
         name: "Parent of Class VI Student",
         role: "Parent Feedback",
         initial: "P",
      },
      {
         quote:
            "I enjoy the activities, classroom discussions and the opportunity to participate in school events.",
         name: "Student, Class VIII",
         role: "Student Feedback",
         initial: "S",
      },
      {
         quote:
            "A supportive school environment makes a meaningful difference in a child's academic and personal growth.",
         name: "Parent of Class IV Student",
         role: "Parent Feedback",
         initial: "P",
      },
   ];

   return (
      <main className="relative min-h-screen overflow-hidden bg-[#17130f] text-[#f7eddd]">

         {/* BACKGROUND DECORATION */}
         <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
            <div className="absolute -left-48 top-40 h-[450px] w-[450px] rounded-full bg-[#9b7042]/10 blur-[130px]" />
            <div className="absolute -right-48 top-[900px] h-[500px] w-[500px] rounded-full bg-[#c09a67]/10 blur-[140px]" />
            <div className="absolute left-1/2 top-[2200px] h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-[#715033]/10 blur-[140px]" />
         </div>

         {/* HERO */}
         <section className="relative isolate overflow-hidden bg-[#211a14]">
            <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#9b7042]/15 blur-[100px]" />
            <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#c09a67]/10 blur-[100px]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 md:py-28 lg:px-8">

               <Reveal>
                  <div className="relative z-10">
                     <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d7b98b]/30 bg-[#d7b98b]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e5c89b] sm:text-xs">
                        <GraduationCap size={17} />
                        A Place to Learn & Grow
                     </div>

                     <h1 className="max-w-2xl text-4xl font-black leading-[1.12] tracking-tight text-[#fff5e6] sm:text-5xl md:text-6xl lg:text-[4.3rem]">
                        Building Bright
                        <span className="mt-2 block bg-gradient-to-r from-[#e9cc9f] to-[#b88b54] bg-clip-text text-transparent">
                           Futures Together.
                        </span>
                     </h1>

                     <p className="mt-7 max-w-xl text-base leading-8 text-[#c5b5a1] sm:text-lg">
                        Welcome to Sunrise Public School, where every child is
                        encouraged to discover their potential, build confidence
                        and become a responsible lifelong learner.
                     </p>

                     <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Link
                           to="/admissions"
                           className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#e3c69a] to-[#bd9460] px-7 py-4 text-sm font-black text-[#302217] shadow-xl shadow-[#b68e5c]/15 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        >
                           Explore Admissions
                           <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                        </Link>

                        <Link
                           to="/about"
                           className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4b58b]/40 bg-white/[0.04] px-7 py-4 text-sm font-bold text-[#f2dfc4] transition duration-300 hover:-translate-y-1 hover:bg-white/10"
                        >
                           Discover Our School
                           <ArrowUpRight size={17} />
                        </Link>
                     </div>

                     <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-7 text-xs font-semibold text-[#b9a891] sm:text-sm">
                        <span className="inline-flex items-center gap-2">
                           <CheckCircle2 size={16} className="text-[#c9aa7c]" />
                           Experienced Educators
                        </span>
                        <span className="inline-flex items-center gap-2">
                           <CheckCircle2 size={16} className="text-[#c9aa7c]" />
                           Student-Focused Learning
                        </span>
                     </div>
                  </div>
               </Reveal>

               <Reveal delay={180}>
                  <div className="relative mx-auto w-full max-w-xl animate-float">
                     <div className="absolute -right-3 -top-5 z-20 flex items-center gap-3 rounded-2xl border border-[#e0c79f]/20 bg-[#33271d] p-3 shadow-2xl sm:-right-5 sm:p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7b88b]/15 text-[#e5c89b]">
                           <Award size={22} />
                        </div>
                        <div>
                           <p className="text-[10px] font-semibold text-[#b9a891]">
                              Our Commitment
                           </p>
                           <p className="text-xs font-black text-[#fff0d9] sm:text-sm">
                              Excellence in Learning
                           </p>
                        </div>
                     </div>

                     <div className="overflow-hidden rounded-[2rem] border border-[#d8bd96]/20 bg-[#30241a] p-3 shadow-2xl shadow-black/40">
                        <div className="relative overflow-hidden rounded-[1.5rem]">
                           <img
                              src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=85"
                              alt="School campus building"
                              className="h-[340px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[430px]"
                           />

                           <div className="absolute inset-0 bg-gradient-to-t from-[#1b130d] via-[#211a14]/20 to-transparent" />

                           <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1d5a8] backdrop-blur-md">
                                 <School size={13} />
                                 Sunrise Public School
                              </div>

                              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                                 Learn Today.
                                 <span className="block text-[#e8c797]">
                                    Lead Tomorrow.
                                 </span>
                              </h2>

                              <p className="mt-3 max-w-sm text-xs leading-6 text-white/75 sm:text-sm">
                                 Inspiring young minds through knowledge, values
                                 and meaningful experiences.
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="absolute -bottom-6 -left-2 z-20 flex items-center gap-3 rounded-2xl border border-[#d8bd96]/20 bg-[#33271d] px-4 py-3 shadow-2xl sm:-left-6 sm:px-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d7b88b]/15 text-[#e5c89b]">
                           <Heart size={22} />
                        </div>
                        <div>
                           <p className="text-[10px] text-[#b9a891]">Our Philosophy</p>
                           <p className="text-xs font-black text-[#fff0d9] sm:text-sm">
                              Every Child Matters
                           </p>
                        </div>
                     </div>
                  </div>
               </Reveal>
            </div>
         </section>

         {/* STATS */}
         <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-3 rounded-[2rem] border border-[#d7b98b]/15 bg-[#241c15] p-4 shadow-2xl shadow-black/20 sm:gap-5 sm:p-7 md:grid-cols-4">
               {stats.map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                     <Reveal key={stat.label} delay={index * 80}>
                        <div className="group rounded-2xl px-2 py-5 text-center transition duration-300 hover:bg-[#d7b98b]/[0.07] sm:px-4">
                           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7b98b]/20 bg-[#d7b98b]/10 text-[#d9b989] transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                              <Icon size={23} />
                           </div>

                           <h3 className="mt-4 text-3xl font-black text-[#f0d7b0] sm:text-4xl">
                              <Counter end={stat.number} suffix={stat.suffix} />
                           </h3>

                           <p className="mt-2 text-xs font-semibold text-[#b5a28b] sm:text-sm">
                              {stat.label}
                           </p>
                        </div>
                     </Reveal>
                  );
               })}
            </div>
            <p className="mt-3 text-center text-[10px] text-[#8f806e]">
               Illustrative demo statistics. Replace with verified school data.
            </p>
         </section>

         {/* ABOUT */}
         <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="grid items-center gap-14 md:grid-cols-2">
               <Reveal>
                  <div className="relative mx-auto w-full max-w-lg">
                     <div className="absolute -left-4 -top-4 h-24 w-24 rounded-tl-[3rem] border-l-2 border-t-2 border-[#b9915f]" />

                     <div className="relative overflow-hidden rounded-[2rem] border border-[#d7b98b]/20 bg-[#2b2118] p-3 shadow-2xl">
                        <img
                           src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85"
                           alt="Students learning in a classroom"
                           className="h-[390px] w-full rounded-[1.5rem] object-cover sm:h-[470px]"
                        />

                        <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/20 bg-[#211a14]/90 p-5 backdrop-blur-xl">
                           <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d9bd91] text-[#2b2118]">
                                 <GraduationCap size={26} />
                              </div>
                              <div>
                                 <p className="text-xs text-[#cbb99f]">Our Vision</p>
                                 <h3 className="text-base font-black text-[#fff2df]">
                                    Education for Everyone
                                 </h3>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="absolute -bottom-5 -right-5 h-24 w-24 rounded-br-[3rem] border-b-2 border-r-2 border-[#b9915f]" />
                  </div>
               </Reveal>

               <Reveal delay={150}>
                  <div>
                     <SectionHeading
                        eyebrow="About Our School"
                        title="A Learning Community That Inspires."
                        description="Sunrise Public School is committed to nurturing curious minds, strong character and a lifelong love of learning. We bring together academic excellence, personal development and a supportive school culture."
                        center={false}
                     />

                     <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[#d7b98b]/15 bg-[#241c15] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d7b98b]/40">
                           <Target className="text-[#d6b27e]" size={26} />
                           <h3 className="mt-4 font-black text-[#f4e4cc]">Our Mission</h3>
                           <p className="mt-2 text-xs leading-6 text-[#b5a28b] sm:text-sm">
                              Help every learner achieve their potential.
                           </p>
                        </div>

                        <div className="rounded-2xl border border-[#d7b98b]/15 bg-[#241c15] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d7b98b]/40">
                           <Lightbulb className="text-[#d6b27e]" size={26} />
                           <h3 className="mt-4 font-black text-[#f4e4cc]">Our Vision</h3>
                           <p className="mt-2 text-xs leading-6 text-[#b5a28b] sm:text-sm">
                              Prepare confident and responsible citizens.
                           </p>
                        </div>
                     </div>

                     <Link
                        to="/about"
                        className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#d9bd91] px-6 py-4 text-sm font-black text-[#2b2118] transition duration-300 hover:-translate-y-1 hover:bg-[#f0d8b2]"
                     >
                        Know More About Us
                        <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                     </Link>
                  </div>
               </Reveal>
            </div>
         </section>

         {/* WHY CHOOSE US */}
         <section className="bg-[#211a14] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
               <Reveal>
                  <SectionHeading
                     eyebrow="Why Choose Sunrise"
                     title="More Than Just a Classroom."
                     description="We create opportunities for students to learn, explore, participate and grow in every aspect of life."
                  />
               </Reveal>

               <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, index) => {
                     const Icon = feature.icon;

                     return (
                        <Reveal key={feature.title} delay={index * 70}>
                           <div className="group relative h-full overflow-hidden rounded-[1.7rem] border border-[#d7b98b]/15 bg-[#2b2118] p-7 transition duration-500 hover:-translate-y-2 hover:border-[#d7b98b]/40 hover:shadow-2xl hover:shadow-black/20 sm:p-8">
                              <span className="absolute right-6 top-5 text-5xl font-black text-white/[0.04]">
                                 0{index + 1}
                              </span>

                              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7b98b]/20 bg-[#d7b98b]/10 text-[#dfc092] transition duration-500 group-hover:rotate-6 group-hover:bg-[#d7b98b] group-hover:text-[#2b2118]">
                                 <Icon size={26} />
                              </div>

                              <h3 className="mt-7 text-xl font-black text-[#f6e8d4]">
                                 {feature.title}
                              </h3>

                              <p className="mt-3 text-sm leading-7 text-[#b6a590]">
                                 {feature.description}
                              </p>

                              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d5b17d]">
                                 Learn & Explore
                                 <ArrowUpRight size={15} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                              </div>
                           </div>
                        </Reveal>
                     );
                  })}
               </div>
            </div>
         </section>

         {/* ACADEMIC PROGRAMS */}
         <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <Reveal>
               <SectionHeading
                  eyebrow="Academic Programs"
                  title="Learning at Every Stage."
                  description="A structured learning journey designed to support students as they develop knowledge, skills and confidence."
               />
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
               {programs.map((program, index) => {
                  const Icon = program.icon;

                  return (
                     <Reveal key={program.title} delay={index * 100}>
                        <div className="group h-full overflow-hidden rounded-[1.8rem] border border-[#d7b98b]/15 bg-[#241c15] transition duration-500 hover:-translate-y-2 hover:border-[#d7b98b]/40 hover:shadow-2xl">
                           <div className={`relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${program.color}`}>
                              <div className="absolute h-40 w-40 rounded-full border border-white/15" />
                              <div className="absolute h-28 w-28 rounded-full border border-white/20" />

                              <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 text-[#f5e2c3] shadow-xl backdrop-blur-md transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                                 <Icon size={46} strokeWidth={1.5} />
                              </div>

                              <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                                 {program.classes}
                              </span>
                           </div>

                           <div className="p-7">
                              <h3 className="text-2xl font-black text-[#f4e5d0]">
                                 {program.title}
                              </h3>

                              <p className="mt-3 text-sm leading-7 text-[#b6a590]">
                                 {program.description}
                              </p>

                              <Link
                                 to="/academics"
                                 className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#d8b786] transition hover:gap-4"
                              >
                                 Explore Program
                                 <ArrowRight size={17} />
                              </Link>
                           </div>
                        </div>
                     </Reveal>
                  );
               })}
            </div>
         </section>

         {/* STUDENT DEVELOPMENT */}
         <section className="bg-[#302419] px-4 py-20 sm:px-6 md:py-24 lg:px-8">
            <div className="mx-auto max-w-7xl">
               <div className="grid items-center gap-12 md:grid-cols-2">
                  <Reveal>
                     <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7b98b]/25 bg-[#d7b98b]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e4c393]">
                           <Sparkles size={15} />
                           Beyond Academics
                        </div>

                        <h2 className="text-3xl font-black leading-tight text-[#fff1df] sm:text-4xl md:text-5xl">
                           Discover Talents.
                           <span className="block text-[#dcb984]">
                              Build Confidence.
                           </span>
                        </h2>

                        <p className="mt-6 max-w-xl text-sm leading-8 text-[#c2b09a] sm:text-base">
                           Education goes beyond textbooks. We encourage students
                           to participate in activities that help them develop
                           creativity, leadership, teamwork and confidence.
                        </p>

                        <Link
                           to="/gallery"
                           className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#d9bd91] px-6 py-4 text-sm font-black text-[#302217] transition duration-300 hover:-translate-y-1 hover:bg-[#f0d8b2]"
                        >
                           Explore School Activities
                           <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                        </Link>
                     </div>
                  </Reveal>

                  <div className="grid grid-cols-2 gap-4">
                     {activities.map((activity, index) => {
                        const Icon = activity.icon;

                        return (
                           <Reveal key={activity.title} delay={index * 80}>
                              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition duration-300 hover:-translate-y-2 hover:bg-white/[0.10] sm:p-7">
                                 <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d7b98b]/20 bg-[#d7b98b]/10 text-[#e2c394] transition group-hover:rotate-6">
                                    <Icon size={24} />
                                 </div>

                                 <h3 className="mt-5 text-base font-black text-[#f7e9d5] sm:text-lg">
                                    {activity.title}
                                 </h3>

                                 <p className="mt-3 text-xs leading-6 text-[#c0ae98] sm:text-sm">
                                    {activity.text}
                                 </p>
                              </div>
                           </Reveal>
                        );
                     })}
                  </div>
               </div>
            </div>
         </section>

         {/* CAMPUS PHOTO */}
         <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
            <Reveal>
               <div className="grid overflow-hidden rounded-[2rem] border border-[#d7b98b]/20 bg-[#241c15] md:grid-cols-2">
                  <div className="relative min-h-[300px] overflow-hidden">
                     <img
                        src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85"
                        alt="School campus architecture"
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#17130f]/60 to-transparent" />

                     <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                        <MapPin size={13} className="mr-2 inline" />
                        Our Learning Campus
                     </div>
                  </div>

                  <div className="flex flex-col justify-center p-7 sm:p-10 md:p-12">
                     <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d7b98b]/10 text-[#e2c394]">
                        <School size={28} />
                     </div>

                     <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b17d]">
                        A Place to Belong
                     </p>

                     <h2 className="mt-4 text-3xl font-black leading-tight text-[#fff1df] sm:text-4xl">
                        A Campus That Inspires Learning.
                     </h2>

                     <p className="mt-5 text-sm leading-8 text-[#b9a791]">
                        A welcoming learning environment gives students the
                        space to explore new ideas, build friendships and
                        discover what they can achieve.
                     </p>

                     <Link
                        to="/gallery"
                        className="group mt-8 inline-flex w-fit items-center gap-3 rounded-xl border border-[#d7b98b]/35 px-6 py-4 text-sm font-bold text-[#e8c99a] transition hover:bg-[#d7b98b]/10"
                     >
                        View School Gallery
                        <ArrowUpRight size={17} className="transition group-hover:rotate-45" />
                     </Link>
                  </div>
               </div>
            </Reveal>
         </section>

         {/* NOTICE BOARD */}
         <section className="bg-[#211a14] px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
               <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                  <Reveal>
                     <SectionHeading
                        eyebrow="Latest Updates"
                        title="What's Happening at School?"
                        description="Stay informed about school announcements, events and important academic updates."
                        center={false}
                     />
                  </Reveal>

                  <Link
                     to="/notices"
                     className="group inline-flex w-fit items-center gap-2 rounded-xl border border-[#d7b98b]/30 px-5 py-3 text-sm font-bold text-[#e1c08f] transition hover:bg-[#d7b98b]/10"
                  >
                     View All Notices
                     <ArrowUpRight size={17} className="transition group-hover:rotate-45" />
                  </Link>
               </div>

               <div className="mt-12 grid gap-5 lg:grid-cols-3">
                  {notices.map((notice, index) => (
                     <Reveal key={notice.title} delay={index * 100}>
                        <div className="group flex h-full gap-5 rounded-[1.5rem] border border-[#d7b98b]/15 bg-[#2b2118] p-5 transition duration-300 hover:-translate-y-2 hover:border-[#d7b98b]/40 hover:shadow-xl sm:p-6">
                           <div className="flex h-[76px] w-[70px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#d7b98b]/10 text-[#e4c391]">
                              <span className="text-2xl font-black">{notice.date}</span>
                              <span className="text-[10px] font-bold tracking-[0.2em]">
                                 {notice.month}
                              </span>
                           </div>

                           <div className="min-w-0">
                              <span className="inline-block rounded-full bg-[#d7b98b]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d9b783]">
                                 {notice.category}
                              </span>

                              <h3 className="mt-3 text-base font-black leading-snug text-[#f6e8d4] transition group-hover:text-[#e3c18f]">
                                 {notice.title}
                              </h3>

                              <p className="mt-2 text-xs leading-6 text-[#b8a590] sm:text-sm">
                                 {notice.description}
                              </p>
                           </div>
                        </div>
                     </Reveal>
                  ))}
               </div>

               <p className="mt-4 text-center text-[10px] text-[#92816c]">
                  Sample notice board content for website demonstration.
               </p>
            </div>
         </section>

         {/* TESTIMONIALS */}
         <section className="px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
               <Reveal>
                  <SectionHeading
                     eyebrow="Voices of Our Community"
                     title="A School Built on Trust."
                     description="A positive school experience grows through the partnership of students, parents and educators."
                  />
               </Reveal>

               <div className="mt-14 grid gap-5 md:grid-cols-3">
                  {testimonials.map((item, index) => (
                     <Reveal key={item.name} delay={index * 100}>
                        <div className="relative h-full rounded-[1.7rem] border border-[#d7b98b]/15 bg-[#241c15] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#d7b98b]/35 hover:shadow-2xl">
                           <Quote size={35} className="text-[#b28b5a]" fill="currentColor" />

                           <div className="mt-5 flex gap-1 text-[#d9b783]">
                              {[1, 2, 3, 4, 5].map((star) => (
                                 <Star key={star} size={15} fill="currentColor" />
                              ))}
                           </div>

                           <p className="mt-5 text-sm leading-8 text-[#c8b8a3]">
                              "{item.quote}"
                           </p>

                           <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d7b98b] text-lg font-black text-[#302217]">
                                 {item.initial}
                              </div>

                              <div>
                                 <h4 className="text-sm font-black text-[#f6e8d4]">
                                    {item.name}
                                 </h4>
                                 <p className="mt-1 text-xs text-[#a9967d]">
                                    {item.role}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </Reveal>
                  ))}
               </div>

               <p className="mt-5 text-center text-[10px] text-[#92816c]">
                  Illustrative demo testimonials. Replace with genuine approved feedback before publishing.
               </p>
            </div>
         </section>

         {/* TEACHER PROMO */}
         <section className="px-4 pb-20 sm:px-6 lg:px-8">
            <Reveal>
               <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#d7b98b]/20 bg-gradient-to-br from-[#35271c] to-[#201810] p-7 shadow-2xl sm:p-12 md:p-14">
                  <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#d7b98b]/10" />
                  <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full border border-[#d7b98b]/10" />

                  <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
                     <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d7b98b]/25 bg-[#d7b98b]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e4c393]">
                           <Users size={15} />
                           Teacher Community
                        </div>

                        <h2 className="mt-6 max-w-2xl text-3xl font-black leading-tight text-[#fff1df] sm:text-4xl md:text-5xl">
                           Empowering Teachers.
                           <span className="block text-[#dcb984]">
                              Inspiring Students.
                           </span>
                        </h2>

                        <p className="mt-5 max-w-xl text-sm leading-8 text-[#c2b09a] sm:text-base">
                           Our teachers play an important role in every student's
                           learning journey. Access the teacher portal to manage
                           classroom responsibilities and academic activities.
                        </p>

                        <Link
                           to="/teacher"
                           className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#d9bd91] px-7 py-4 text-sm font-black text-[#302217] transition duration-300 hover:-translate-y-1 hover:bg-[#f0d8b2]"
                        >
                           Teacher Portal
                           <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                        </Link>
                     </div>

                     <div className="hidden h-48 w-48 items-center justify-center rounded-[2rem] border border-[#d7b98b]/20 bg-[#d7b98b]/10 text-[#e6c99d] md:flex">
                        <Users size={85} strokeWidth={1.2} />
                     </div>
                  </div>
               </div>
            </Reveal>
         </section>

         {/* ADMISSION CTA */}
         <section className="px-4 pb-20 sm:px-6 md:pb-24 lg:px-8">
            <Reveal>
               <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#d8bc91] to-[#b58b58] px-6 py-14 text-center shadow-2xl shadow-black/20 sm:px-12 sm:py-20">
                  <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full border border-[#3e2c1b]/15" />
                  <div className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full border border-[#3e2c1b]/15" />

                  <div className="relative mx-auto max-w-3xl">
                     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#3e2c1b]/15 bg-[#3e2c1b]/10 text-[#3e2c1b]">
                        <GraduationCap size={34} />
                     </div>

                     <p className="mt-7 text-xs font-black uppercase tracking-[0.25em] text-[#513b25]">
                        Begin Your Journey
                     </p>

                     <h2 className="mt-4 text-3xl font-black leading-tight text-[#2d2117] sm:text-4xl md:text-5xl">
                        Give Your Child a
                        <span className="block text-[#fff3df]">
                           Brighter Tomorrow.
                        </span>
                     </h2>

                     <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-[#4d3925] sm:text-base">
                        Take the first step towards a meaningful learning journey.
                        Connect with our admissions team and discover what makes
                        our school special.
                     </p>

                     <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                           to="/admissions"
                           className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#302217] px-7 py-4 text-sm font-black text-[#f8e8cf] transition duration-300 hover:-translate-y-1 hover:bg-[#493526]"
                        >
                           Start Admission Enquiry
                           <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                        </Link>

                        <Link
                           to="/contact"
                           className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#493526]/35 px-7 py-4 text-sm font-black text-[#302217] transition hover:bg-white/20"
                        >
                           Contact Our School
                           <ArrowUpRight size={17} />
                        </Link>
                     </div>
                  </div>
               </div>
            </Reveal>
         </section>

         {/* CONTACT STRIP */}
         <section className="border-y border-[#d7b98b]/15 bg-[#241c15] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-7 sm:grid-cols-3">
               <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d7b98b]/10 text-[#d9b783]">
                     <Phone size={21} />
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-[#aa987f]">Call Us</p>
                     <p className="mt-1 text-sm font-black text-[#f4e5d0]">
                        Contact School Office
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d7b98b]/10 text-[#d9b783]">
                     <Mail size={21} />
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-[#aa987f]">Email Enquiries</p>
                     <p className="mt-1 text-sm font-black text-[#f4e5d0]">
                        Reach Our Admissions Team
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d7b98b]/10 text-[#d9b783]">
                     <MapPin size={21} />
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-[#aa987f]">Visit Us</p>
                     <p className="mt-1 text-sm font-black text-[#f4e5d0]">
                        Jodhpur, Rajasthan
                     </p>
                  </div>
               </div>
            </div>
         </section>

         {/* No Navbar or Footer here.
          They are rendered separately by App.jsx. */}

         <style>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      </main>
   );
}
