
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
   ArrowRight,
   ArrowUpRight,
   BookOpen,
   Brain,
   Building2,
   CheckCircle2,
   Compass,
   GraduationCap,
   Heart,
   Lightbulb,
   Microscope,
   Music,
   Palette,
   ShieldCheck,
   Sparkles,
   Target,
   Trophy,
   Users,
   Eye,
   Quote,
   Globe,
   Star,
   BookMarked,
} from "lucide-react";

const schoolImages = {
   campus:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=1200",
   classroom:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000",
   library:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000",
   science:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000",
   students:
      "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1000",
   activity:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000",
};

const values = [
   {
      icon: Heart,
      title: "Respect & Care",
      description:
         "Creating a welcoming environment where every student feels respected, supported and valued.",
   },
   {
      icon: Lightbulb,
      title: "Curiosity",
      description:
         "Encouraging students to ask questions, explore ideas and develop a lifelong love of learning.",
   },
   {
      icon: ShieldCheck,
      title: "Discipline",
      description:
         "Building responsibility, honesty, self-confidence and positive habits in everyday life.",
   },
   {
      icon: Trophy,
      title: "Excellence",
      description:
         "Inspiring every learner to give their best in academics, activities and personal growth.",
   },
];

const learningFeatures = [
   {
      icon: BookOpen,
      title: "Academic Learning",
      description:
         "A structured learning approach that develops strong foundations and independent thinking.",
   },
   {
      icon: Brain,
      title: "Creative Thinking",
      description:
         "Opportunities to explore, experiment, solve problems and discover new possibilities.",
   },
   {
      icon: Microscope,
      title: "Practical Education",
      description:
         "Learning through activities, demonstrations, experiments and real-world applications.",
   },
   {
      icon: Users,
      title: "Personal Development",
      description:
         "Building communication, teamwork, leadership and confidence beyond the classroom.",
   },
];

const facilities = [
   {
      image: schoolImages.classroom,
      title: "Modern Classrooms",
      description:
         "Comfortable learning spaces designed to encourage focus and participation.",
   },
   {
      image: schoolImages.library,
      title: "Learning Library",
      description:
         "A reading environment that encourages imagination, knowledge and exploration.",
   },
   {
      image: schoolImages.science,
      title: "Science & Discovery",
      description:
         "Practical learning opportunities that make concepts interesting and engaging.",
   },
   {
      image: schoolImages.activity,
      title: "Activities & Sports",
      description:
         "Opportunities for teamwork, creativity, fitness and all-round development.",
   },
];

const highlights = [
   { icon: GraduationCap, title: "Academic Focus" },
   { icon: Users, title: "Student Development" },
   { icon: Globe, title: "Future Readiness" },
   { icon: Heart, title: "Values & Character" },
];

function Reveal({ children, className = "" }) {
   return (
      <div className={`animate-about ${className}`}>
         {children}
      </div>
   );
}

export default function About() {
   useEffect(() => {
      const elements = document.querySelectorAll(".about-reveal");

      if (!("IntersectionObserver" in window)) {
         elements.forEach((element) => element.classList.add("is-visible"));
         return;
      }

      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  entry.target.classList.add("is-visible");
                  observer.unobserve(entry.target);
               }
            });
         },
         { threshold: 0.12 }
      );

      elements.forEach((element) => observer.observe(element));

      return () => observer.disconnect();
   }, []);

   return (
      <main className="min-h-screen overflow-hidden bg-[#f7f4ed] text-[#211b14]">

         <style>{`
        @keyframes aboutFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes aboutFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .animate-about {
          animation: aboutFadeUp .8s ease both;
        }

        .about-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .8s ease, transform .8s ease;
        }

        .about-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .about-float {
          animation: aboutFloat 5s ease-in-out infinite;
        }

        .about-image {
          transition: transform .7s ease;
        }

        .about-image:hover {
          transform: scale(1.05);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-about, .about-float {
            animation: none;
          }
          .about-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

         {/* ABOUT HERO */}
         <section className="relative flex min-h-[540px] items-center overflow-hidden bg-[#15110d] py-24 text-white lg:min-h-[620px]">

            <div className="absolute inset-0">
               <img
                  src={schoolImages.campus}
                  alt="Illustrative school campus"
                  className="h-full w-full object-cover opacity-25"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-[#100d09] via-[#100d09]/90 to-[#100d09]/40" />
            </div>

            <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />

            <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">

               <Reveal>
                  <div className="mb-6 flex items-center gap-3">
                     <span className="h-px w-10 bg-amber-400" />
                     <span className="text-xs font-bold tracking-[4px] text-amber-400">
                        DISCOVER OUR SCHOOL
                     </span>
                  </div>

                  <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                     More Than A School.
                     <span className="mt-2 block text-amber-400">
                        A Place To Grow.
                     </span>
                  </h1>

                  <p className="mt-7 max-w-xl text-sm leading-8 text-slate-300 sm:text-base">
                     Discover the philosophy, values and learning environment
                     behind Sunrise Public School. We believe education is
                     about developing knowledge, character and confidence
                     for a brighter tomorrow.
                  </p>

                  <div className="mt-9 flex flex-wrap gap-4">
                     <a
                        href="#our-story"
                        className="inline-flex items-center gap-3 rounded-full bg-amber-400 px-7 py-4 text-sm font-bold text-black transition hover:-translate-y-1 hover:bg-amber-300"
                     >
                        Discover Our Story
                        <ArrowRight size={18} />
                     </a>

                     <Link
                        to="/contact"
                        className="inline-flex items-center gap-3 rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-white transition hover:border-amber-400 hover:text-amber-400"
                     >
                        Contact School
                        <ArrowUpRight size={17} />
                     </Link>
                  </div>
               </Reveal>

               <div className="relative mx-auto w-full max-w-lg">
                  <div className="about-float relative">
                     <img
                        src={schoolImages.students}
                        alt="Students learning together"
                        className="h-[330px] w-full rounded-[28px] border border-white/10 object-cover shadow-2xl sm:h-[410px]"
                     />

                     <div className="absolute -bottom-6 -left-3 rounded-2xl border border-amber-400/20 bg-[#211a12] p-5 shadow-xl sm:-left-7">
                        <div className="flex items-center gap-3">
                           <div className="rounded-xl bg-amber-400/15 p-3 text-amber-400">
                              <GraduationCap size={27} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white">
                                 Learning With Purpose
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                 Knowledge • Values • Growth
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </section>

         {/* SCHOOL STORY */}
         <section id="our-story" className="scroll-mt-20 px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

               <div className="about-reveal relative">
                  <img
                     src={schoolImages.classroom}
                     alt="Students in a classroom"
                     className="h-[390px] w-full rounded-[28px] object-cover shadow-xl sm:h-[490px]"
                  />

                  <div className="absolute -bottom-7 -right-3 rounded-2xl bg-[#211a12] p-6 text-white shadow-xl sm:-right-7">
                     <Sparkles className="mb-3 text-amber-400" size={25} />
                     <p className="text-lg font-bold">A Better Way</p>
                     <p className="text-sm text-slate-400">
                        To Learn & Discover
                     </p>
                  </div>
               </div>

               <div className="about-reveal">
                  <p className="mb-4 text-xs font-extrabold tracking-[3px] text-amber-700">
                     OUR SCHOOL STORY
                  </p>

                  <h2 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                     Education That
                     <span className="block text-amber-700">
                        Shapes Tomorrow
                     </span>
                  </h2>

                  <p className="mt-7 text-sm leading-8 text-stone-600 sm:text-base">
                     Sunrise Public School is committed to providing students
                     with knowledge, confidence, creativity and strong values.
                     Our educational philosophy focuses on academic learning
                     as well as the overall development of every learner.
                  </p>

                  <p className="mt-5 text-sm leading-8 text-stone-600 sm:text-base">
                     We aim to create an encouraging atmosphere where students
                     can discover their interests, develop their abilities,
                     respect others and prepare themselves for the opportunities
                     and responsibilities of tomorrow.
                  </p>

                  <div className="mt-8 space-y-4">
                     {[
                        "Student-focused learning environment",
                        "Academic and personal development",
                        "Positive values and responsible behaviour",
                        "Creativity, confidence and curiosity",
                     ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                           <CheckCircle2
                              size={19}
                              className="shrink-0 text-amber-700"
                           />
                           <span className="text-sm font-semibold text-stone-700">
                              {item}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </section>

         {/* MISSION VISION */}
         <section className="bg-[#17120d] px-5 py-24 text-white sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <div className="about-reveal mx-auto mb-14 max-w-2xl text-center">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-400">
                     OUR PURPOSE & DIRECTION
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     What Guides
                     <span className="text-amber-400"> Our Journey</span>
                  </h2>

                  <p className="mt-5 text-sm leading-7 text-slate-400">
                     Our mission and vision reflect the kind of learning
                     community we strive to create.
                  </p>
               </div>

               <div className="grid gap-6 md:grid-cols-2">

                  <div className="about-reveal rounded-3xl border border-amber-400/20 bg-white/[0.04] p-8 transition hover:-translate-y-2 hover:bg-white/[0.07] sm:p-10">
                     <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-black">
                        <Target size={29} />
                     </div>

                     <h3 className="text-2xl font-bold">
                        Our Mission
                     </h3>

                     <p className="mt-5 text-sm leading-8 text-slate-400">
                        To create confident, responsible and knowledgeable
                        learners by providing meaningful educational experiences,
                        encouraging curiosity and nurturing strong values.
                     </p>
                  </div>

                  <div className="about-reveal rounded-3xl border border-amber-400/20 bg-white/[0.04] p-8 transition hover:-translate-y-2 hover:bg-white/[0.07] sm:p-10">
                     <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-black">
                        <Eye size={29} />
                     </div>

                     <h3 className="text-2xl font-bold">
                        Our Vision
                     </h3>

                     <p className="mt-5 text-sm leading-8 text-slate-400">
                        To build a future-ready learning community where every
                        student is inspired to achieve their potential and
                        contribute positively to society.
                     </p>
                  </div>

               </div>
            </div>
         </section>

         {/* CORE VALUES */}
         <section className="px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <div className="about-reveal mb-14 text-center">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-700">
                     THE FOUNDATION OF OUR CULTURE
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Values That Define Us
                  </h2>

                  <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-500">
                     Education is not only what students learn, but also
                     the values they carry throughout their lives.
                  </p>
               </div>

               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {values.map((item, index) => {
                     const Icon = item.icon;

                     return (
                        <div
                           key={item.title}
                           className="about-reveal group rounded-3xl border border-stone-200 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl"
                           style={{ transitionDelay: `${index * 100}ms` }}
                        >
                           <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 transition group-hover:bg-amber-400 group-hover:text-black">
                              <Icon size={27} />
                           </div>

                           <h3 className="text-lg font-extrabold">
                              {item.title}
                           </h3>

                           <p className="mt-4 text-sm leading-7 text-stone-500">
                              {item.description}
                           </p>
                        </div>
                     );
                  })}
               </div>

            </div>
         </section>

         {/* PRINCIPAL MESSAGE */}
         <section className="bg-[#eee7d9] px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

               <div className="about-reveal">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-800">
                     A MESSAGE FROM OUR LEADERSHIP
                  </p>

                  <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                     Learning Is A
                     <span className="block text-amber-800">
                        Journey For Life
                     </span>
                  </h2>

                  <Quote size={42} className="mt-8 text-amber-700/40" />

                  <p className="mt-3 text-base italic leading-9 text-stone-700">
                     "Every child has unique potential. Our responsibility
                     is to provide an environment where that potential can
                     grow through knowledge, encouragement, discipline
                     and meaningful experiences."
                  </p>

                  <div className="mt-8 border-l-4 border-amber-600 pl-5">
                     <p className="text-lg font-extrabold">
                        Principal
                     </p>
                     <p className="mt-1 text-sm text-stone-500">
                        Sunrise Public School
                     </p>
                  </div>

                  <p className="mt-6 text-xs text-stone-500">
                     Demo message. Replace with the principal's approved message.
                  </p>
               </div>

               <div className="about-reveal">
                  <img
                     src={schoolImages.students}
                     alt="Students participating in learning activities"
                     className="h-[400px] w-full rounded-[28px] object-cover shadow-xl sm:h-[480px]"
                  />
               </div>

            </div>
         </section>

         {/* LEARNING APPROACH */}
         <section className="px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <div className="about-reveal mb-14 max-w-2xl">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-700">
                     HOW WE APPROACH EDUCATION
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Learning Beyond
                     <span className="text-amber-700"> Textbooks</span>
                  </h2>

                  <p className="mt-5 text-sm leading-8 text-stone-500">
                     We believe students learn best when knowledge is
                     connected with curiosity, participation and experience.
                  </p>
               </div>

               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {learningFeatures.map((item, index) => {
                     const Icon = item.icon;

                     return (
                        <div
                           key={item.title}
                           className="about-reveal rounded-2xl bg-[#17120d] p-7 text-white transition duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-900/15"
                           style={{ transitionDelay: `${index * 100}ms` }}
                        >
                           <Icon size={32} className="text-amber-400" />

                           <h3 className="mt-7 text-lg font-bold">
                              {item.title}
                           </h3>

                           <p className="mt-4 text-sm leading-7 text-slate-400">
                              {item.description}
                           </p>
                        </div>
                     );
                  })}
               </div>

            </div>
         </section>

         {/* FACILITIES */}
         <section className="bg-[#17120d] px-5 py-24 text-white sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <div className="about-reveal mb-14 text-center">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-400">
                     SPACES THAT INSPIRE
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Explore Our Learning Environment
                  </h2>

                  <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                     A collection of illustrative school spaces and activities
                     representing an engaging educational environment.
                  </p>
               </div>

               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {facilities.map((item, index) => (
                     <div
                        key={item.title}
                        className="about-reveal group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                        style={{ transitionDelay: `${index * 100}ms` }}
                     >
                        <div className="h-56 overflow-hidden">
                           <img
                              src={item.image}
                              alt={item.title}
                              loading="lazy"
                              className="about-image h-full w-full object-cover"
                           />
                        </div>

                        <div className="p-6">
                           <h3 className="text-lg font-bold">
                              {item.title}
                           </h3>

                           <p className="mt-3 text-sm leading-7 text-slate-400">
                              {item.description}
                           </p>

                           <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
                              <Star size={14} />
                              Learning Environment
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

            </div>
         </section>

         {/* SCHOOL PHILOSOPHY HIGHLIGHTS */}
         <section className="px-5 py-24 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

               <div className="about-reveal mb-12 text-center">
                  <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-700">
                     OUR EDUCATIONAL COMMITMENT
                  </p>

                  <h2 className="text-3xl font-black sm:text-4xl">
                     Growing Together
                  </h2>
               </div>

               <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {highlights.map((item) => {
                     const Icon = item.icon;

                     return (
                        <div
                           key={item.title}
                           className="about-reveal rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm transition hover:border-amber-300 hover:shadow-lg sm:p-8"
                        >
                           <Icon
                              size={31}
                              className="mx-auto text-amber-700"
                           />

                           <h3 className="mt-5 text-sm font-bold sm:text-base">
                              {item.title}
                           </h3>
                        </div>
                     );
                  })}
               </div>

            </div>
         </section>

         {/* FINAL CTA */}
         <section className="relative overflow-hidden bg-[#17120d] px-5 py-20 text-center text-white sm:px-8">
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-500/10 blur-[100px]" />

            <div className="about-reveal relative mx-auto max-w-3xl">
               <Building2 size={40} className="mx-auto mb-6 text-amber-400" />

               <p className="mb-4 text-xs font-bold tracking-[3px] text-amber-400">
                  SUNRISE PUBLIC SCHOOL
               </p>

               <h2 className="text-3xl font-black leading-tight sm:text-5xl">
                  Let's Build A Brighter
                  <span className="block text-amber-400">
                     Future Together.
                  </span>
               </h2>

               <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-slate-400">
                  Discover our educational philosophy and connect with
                  our school to learn more about our learning environment.
               </p>

               <Link
                  to="/contact"
                  className="mt-9 inline-flex items-center gap-3 rounded-full bg-amber-400 px-8 py-4 text-sm font-extrabold text-black transition hover:-translate-y-1 hover:bg-amber-300"
               >
                  Get In Touch
                  <ArrowRight size={18} />
               </Link>
            </div>
         </section>

      </main>
   );
}
