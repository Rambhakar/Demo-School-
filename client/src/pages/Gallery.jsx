
import React, { useMemo, useState } from "react";
import {
   Search,
   Camera,
   Images,
   X,
   ChevronLeft,
   ChevronRight,
   Download,
   Maximize2,
   School,
   GraduationCap,
   Trophy,
   FlaskConical,
   Palette,
   Music,
   CalendarDays,
   Sparkles,
   Filter,
   Image as ImageIcon,
   ArrowRight,
} from "lucide-react";

// DEMO GALLERY DATA
// Replace sample images with actual school photographs before publishing.
const galleryImages = [
   {
      id: 1,
      title: "Our School Campus",
      category: "Campus",
      date: "20 Sep 2026",
      description: "A glimpse of the school campus and learning environment.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1000",
   },
   {
      id: 2,
      title: "Classroom Learning",
      category: "Academics",
      date: "18 Sep 2026",
      description: "Students learning together in a classroom environment.",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000",
   },
   {
      id: 3,
      title: "Annual Sports Day",
      category: "Sports",
      date: "15 Sep 2026",
      description: "Sports activities and moments of teamwork and enthusiasm.",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000",
   },
   {
      id: 4,
      title: "Science Laboratory",
      category: "Activities",
      date: "12 Sep 2026",
      description: "Students exploring science through practical learning.",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000",
   },
   {
      id: 5,
      title: "Art & Creativity",
      category: "Activities",
      date: "10 Sep 2026",
      description: "Creative activities that encourage imagination and expression.",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1000",
   },
   {
      id: 6,
      title: "Graduation Celebration",
      category: "Events",
      date: "08 Sep 2026",
      description: "Celebrating student achievements and important milestones.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000",
   },
   {
      id: 7,
      title: "School Library",
      category: "Campus",
      date: "05 Sep 2026",
      description: "A peaceful space for reading, research and discovery.",
      image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000",
   },
   {
      id: 8,
      title: "Music & Cultural Program",
      category: "Events",
      date: "03 Sep 2026",
      description: "Students showcasing their talent through cultural activities.",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1000",
   },
   {
      id: 9,
      title: "Football Activities",
      category: "Sports",
      date: "01 Sep 2026",
      description: "Encouraging fitness, teamwork and sportsmanship.",
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1000",
   },
   {
      id: 10,
      title: "Learning Together",
      category: "Academics",
      date: "28 Aug 2026",
      description: "Collaborative learning and classroom participation.",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000",
   },
   {
      id: 11,
      title: "School Celebration",
      category: "Events",
      date: "25 Aug 2026",
      description: "Special moments from school celebrations and gatherings.",
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1000",
   },
   {
      id: 12,
      title: "Creative Workshop",
      category: "Activities",
      date: "20 Aug 2026",
      description: "Students participating in creative workshops and projects.",
      image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000",
   },
];

const categories = [
   "All",
   "Campus",
   "Academics",
   "Sports",
   "Events",
   "Activities",
];

const categoryIcons = {
   Campus: School,
   Academics: GraduationCap,
   Sports: Trophy,
   Events: CalendarDays,
   Activities: Palette,
   All: Images,
};

function GalleryCard({ item, onClick }) {
   return (
      <button
         type="button"
         onClick={onClick}
         className="group relative block w-full overflow-hidden rounded-3xl border border-amber-400/10 bg-[#211910] text-left transition duration-500 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-black/30"
      >
         <div className="relative aspect-[4/3] overflow-hidden bg-[#302419]">
            <img
               src={item.image}
               alt={item.title}
               loading="lazy"
               className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
               onError={(e) => {
                  e.currentTarget.style.display = "none";
               }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />

            <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
               {item.category}
            </div>

            <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-[#21170d] opacity-0 transition duration-300 group-hover:opacity-100">
               <Maximize2 size={16} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5">
               <p className="flex items-center gap-2 text-[10px] font-semibold text-amber-300">
                  <CalendarDays size={13} />
                  {item.date}
               </p>
               <h3 className="mt-2 text-lg font-black text-white">
                  {item.title}
               </h3>
               <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/70">
                  {item.description}
               </p>
            </div>
         </div>
      </button>
   );
}

function GalleryModal({ images, activeIndex, onClose, onChange }) {
   if (activeIndex === null || !images[activeIndex]) return null;

   const item = images[activeIndex];

   const previous = () => {
      onChange((activeIndex - 1 + images.length) % images.length);
   };

   const next = () => {
      onChange((activeIndex + 1) % images.length);
   };

   const downloadImage = async () => {
      try {
         const response = await fetch(item.image);
         if (!response.ok) throw new Error("Download failed");

         const blob = await response.blob();
         const url = URL.createObjectURL(blob);
         const link = document.createElement("a");

         link.href = url;
         link.download = `${item.title.replace(/[^a-z0-9]/gi, "-")}.jpg`;
         document.body.appendChild(link);
         link.click();
         link.remove();
         URL.revokeObjectURL(url);
      } catch {
         window.open(item.image, "_blank", "noopener,noreferrer");
      }
   };

   return (
      <div
         className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/90 p-3 backdrop-blur-md sm:p-6"
         onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
         }}
      >
         <div className="relative my-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-amber-400/20 bg-[#211910] shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-amber-400/10 px-5 py-4">
               <div className="min-w-0">
                  <p className="text-[10px] font-black tracking-[2px] text-amber-400">
                     SUNRISE PUBLIC SCHOOL GALLERY
                  </p>
                  <h2 className="mt-1 truncate text-sm font-bold text-[#f5e8d1] sm:text-base">
                     {item.title}
                  </h2>
               </div>

               <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close gallery preview"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white transition hover:bg-white/10"
               >
                  <X size={20} />
               </button>
            </div>

            <div className="relative flex items-center justify-center bg-black">
               <img
                  src={item.image}
                  alt={item.title}
                  className="max-h-[65vh] w-full object-contain"
               />

               {images.length > 1 && (
                  <>
                     <button
                        type="button"
                        onClick={previous}
                        aria-label="Previous image"
                        className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-amber-400 hover:text-black"
                     >
                        <ChevronLeft size={24} />
                     </button>

                     <button
                        type="button"
                        onClick={next}
                        aria-label="Next image"
                        className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-amber-400 hover:text-black"
                     >
                        <ChevronRight size={24} />
                     </button>
                  </>
               )}
            </div>

            <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
               <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#b7a58a]">
                     <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-300">
                        {item.category}
                     </span>
                     <span className="flex items-center gap-1">
                        <CalendarDays size={13} /> {item.date}
                     </span>
                     <span>{activeIndex + 1} / {images.length}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#c2b29a]">
                     {item.description}
                  </p>
               </div>

               <button
                  type="button"
                  onClick={downloadImage}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-3 text-xs font-black text-[#21170d] transition hover:-translate-y-0.5"
               >
                  <Download size={16} /> Download Image
               </button>
            </div>
         </div>
      </div>
   );
}

export default function Gallery() {
   const [search, setSearch] = useState("");
   const [activeCategory, setActiveCategory] = useState("All");
   const [activeIndex, setActiveIndex] = useState(null);

   const filteredImages = useMemo(() => {
      const query = search.trim().toLowerCase();

      return galleryImages.filter((item) => {
         const matchesCategory =
            activeCategory === "All" ||
            item.category === activeCategory;

         const matchesSearch =
            !query ||
            item.title.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query);

         return matchesCategory && matchesSearch;
      });
   }, [search, activeCategory]);

   const categoryCounts = useMemo(() => {
      return categories.map((category) => ({
         name: category,
         count:
            category === "All"
               ? galleryImages.length
               : galleryImages.filter((item) => item.category === category).length,
      }));
   }, []);

   const activeCategoryIcon =
      categoryIcons[activeCategory] || Images;

   const ActiveIcon = activeCategoryIcon;

   return (
      <main className="min-h-screen overflow-hidden bg-[#17120d] text-[#f5e8d1]">
         <style>{`
        @keyframes galleryFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .gallery-float { animation: galleryFloat 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .gallery-float { animation: none; }
        }
      `}</style>

         {/* HERO */}
         <section className="relative overflow-hidden border-b border-amber-400/10 bg-[#21180f] px-5 py-16 sm:px-8 lg:py-24">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[110px]" />
            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-orange-900/20 blur-[110px]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
               <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-[10px] font-black tracking-[2px] text-amber-300">
                     <Camera size={14} /> MOMENTS THAT MATTER
                  </div>

                  <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                     Memories Made.
                     <span className="mt-2 block text-amber-400">
                        Moments Captured.
                     </span>
                  </h1>

                  <p className="mt-6 max-w-xl text-sm leading-8 text-[#c2b29a] sm:text-base">
                     Explore the vibrant life of our school through photographs.
                     From classroom learning to sports, cultural celebrations
                     and creative activities, every picture tells a story.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                     <a
                        href="#school-photos"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3.5 text-sm font-black text-[#21170d] transition hover:-translate-y-1"
                     >
                        Explore Gallery <ArrowRight size={17} />
                     </a>

                     <a
                        href="#gallery-categories"
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-white/[.03] px-6 py-3.5 text-sm font-bold text-[#f0dfc2] transition hover:bg-amber-400/10"
                     >
                        Browse Categories <Filter size={16} />
                     </a>
                  </div>

                  <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                     {[
                        [galleryImages.length, "Demo Photos"],
                        [categories.length - 1, "Categories"],
                        ["100%", "Memories"],
                     ].map(([number, label]) => (
                        <div key={label} className="rounded-2xl border border-amber-400/10 bg-[#2a1e13]/80 p-4">
                           <p className="text-2xl font-black text-amber-400">{number}</p>
                           <p className="mt-1 text-[10px] font-semibold text-[#b7a58a]">{label}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="gallery-float relative mx-auto w-full max-w-lg">
                  <div className="overflow-hidden rounded-[30px] border border-amber-400/20 bg-[#2a1e13] p-3 shadow-2xl">
                     <div className="grid grid-cols-2 gap-3">
                        {galleryImages.slice(0, 4).map((item) => (
                           <button
                              type="button"
                              key={item.id}
                              onClick={() => setActiveIndex(filteredImages.findIndex((image) => image.id === item.id))}
                              className="group relative aspect-square overflow-hidden rounded-2xl bg-[#17120d]"
                           >
                              <img
                                 src={item.image}
                                 alt={item.title}
                                 loading="lazy"
                                 className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <span className="absolute bottom-3 left-3 right-3 truncate text-left text-xs font-bold text-white">
                                 {item.title}
                              </span>
                           </button>
                        ))}
                     </div>

                     <div className="mt-3 flex items-center gap-3 rounded-2xl border border-amber-400/10 bg-[#1b150f] p-4">
                        <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                           <Images size={23} />
                        </div>
                        <div>
                           <p className="text-sm font-black">Our School Memories</p>
                           <p className="mt-1 text-xs text-[#a9977e]">
                              Discover life beyond the classroom.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* CATEGORY OVERVIEW */}
         <section id="gallery-categories" className="scroll-mt-24 border-b border-amber-400/10 bg-[#1b150f] px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl">
               <div className="mb-7 text-center">
                  <p className="text-[10px] font-black tracking-[3px] text-amber-400">
                     EXPLORE BY CATEGORY
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                     Every Moment Has a Story
                  </h2>
               </div>

               <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {categoryCounts.map((category) => {
                     const Icon = categoryIcons[category.name] || Images;
                     const selected = activeCategory === category.name;

                     return (
                        <button
                           type="button"
                           key={category.name}
                           onClick={() => {
                              setActiveCategory(category.name);
                              document.getElementById("school-photos")?.scrollIntoView({
                                 behavior: "smooth",
                              });
                           }}
                           className={`rounded-2xl border p-4 text-center transition duration-300 hover:-translate-y-1 ${selected
                                 ? "border-amber-400 bg-amber-400/10"
                                 : "border-amber-400/10 bg-[#251b12] hover:border-amber-400/30"
                              }`}
                        >
                           <Icon size={25} className={`mx-auto ${selected ? "text-amber-300" : "text-[#b7a58a]"}`} />
                           <p className="mt-3 text-xs font-black">{category.name}</p>
                           <p className="mt-1 text-[10px] text-[#a9977e]">
                              {category.count} Photos
                           </p>
                        </button>
                     );
                  })}
               </div>
            </div>
         </section>

         {/* PHOTO GALLERY */}
         <section id="school-photos" className="scroll-mt-20 px-5 py-16 sm:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
               <div className="mx-auto mb-10 max-w-2xl text-center">
                  <p className="text-[10px] font-black tracking-[3px] text-amber-400">
                     PHOTO COLLECTION
                  </p>
                  <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                     School Gallery
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#b7a58a]">
                     Browse our demo collection of school events, activities,
                     campus and academic moments.
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
                           placeholder="Search photos, events or activities..."
                           className="w-full rounded-xl border border-[#66513a] bg-[#17120d] py-3.5 pl-11 pr-4 text-sm text-[#f6e9d2] outline-none placeholder:text-[#9b896f] focus:border-amber-400"
                        />
                     </div>

                     <div className="flex flex-wrap gap-2">
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
               </div>

               <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[#a9977e]">
                     Showing{" "}
                     <span className="font-black text-amber-300">
                        {filteredImages.length}
                     </span>{" "}
                     photos
                  </p>

                  <button
                     type="button"
                     onClick={() => {
                        setSearch("");
                        setActiveCategory("All");
                     }}
                     className="text-xs font-bold text-amber-400 transition hover:text-amber-200"
                  >
                     Reset Filters
                  </button>
               </div>

               {filteredImages.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                     {filteredImages.map((item) => (
                        <GalleryCard
                           key={item.id}
                           item={item}
                           onClick={() => setActiveIndex(filteredImages.findIndex((image) => image.id === item.id))}
                        />
                     ))}
                  </div>
               ) : (
                  <div className="rounded-3xl border border-amber-400/10 bg-[#211910] px-6 py-16 text-center">
                     <Search size={35} className="mx-auto text-amber-400" />
                     <h3 className="mt-4 text-xl font-black">
                        No Photos Found
                     </h3>
                     <p className="mt-2 text-sm text-[#a9977e]">
                        Try another search term or category.
                     </p>
                     <button
                        type="button"
                        onClick={() => {
                           setSearch("");
                           setActiveCategory("All");
                        }}
                        className="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-[#21170d]"
                     >
                        Clear Filters
                     </button>
                  </div>
               )}
            </div>
         </section>

         {/* GALLERY MESSAGE */}
         <section className="border-t border-amber-400/10 bg-[#211910] px-5 py-14 sm:px-8">
            <div className="mx-auto max-w-7xl">
               <div className="grid items-center gap-8 rounded-[30px] border border-amber-400/15 bg-[#2a1e13] p-7 sm:p-10 lg:grid-cols-[1fr_auto]">
                  <div>
                     <div className="flex items-center gap-2 text-amber-400">
                        <Sparkles size={18} />
                        <span className="text-[10px] font-black tracking-[3px]">
                           LIFE AT SUNRISE
                        </span>
                     </div>

                     <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                        Every Picture Tells a Story.
                     </h2>

                     <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b7a58a]">
                        Our gallery celebrates learning, friendship, creativity,
                        achievements and the wonderful experiences that make
                        school life memorable.
                     </p>
                  </div>

                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                     <Camera size={38} />
                  </div>
               </div>

               <p className="mt-8 rounded-xl border border-amber-400/15 bg-amber-400/5 p-4 text-center text-[11px] leading-5 text-[#b7a58a]">
                  Demo Gallery: These are sample photographs from external image sources for website demonstration. Replace them with authorized photographs of your actual school before publishing. Obtain appropriate permission before displaying identifiable student photographs.
               </p>
            </div>
         </section>

         {/* IMAGE PREVIEW MODAL */}
         <GalleryModal
            images={filteredImages}
            activeIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            onChange={setActiveIndex}
         />
      </main>
   );
}
