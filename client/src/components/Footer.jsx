
import React from "react";
import { Link } from "react-router-dom";

import {
   MapPin,
   Phone,
   Mail,
   ArrowUpRight,
   GraduationCap,
   Heart,
   Sparkles,
} from "lucide-react";

import {
   FaInstagram,
   FaFacebookF,
   FaYoutube,
} from "react-icons/fa";

export default function Footer() {
   const quickLinks = [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
      { name: "Academics", path: "/academics" },
      { name: "Admissions", path: "/admissions" },
      { name: "Notices", path: "/notices" },
      { name: "Gallery", path: "/gallery" },
      { name: "Contact Us", path: "/contact" },
      { name: "AI Study", path: "/student-ai" },
   ];

   const socialLinks = [
      {
         name: "Instagram",
         url: "https://www.instagram.com/",
         icon: FaInstagram,
      },
      {
         name: "Facebook",
         url: "https://www.facebook.com/",
         icon: FaFacebookF,
      },
      {
         name: "YouTube",
         url: "https://www.youtube.com/",
         icon: FaYoutube,
      },
   ];

   return (
      <footer className="relative overflow-hidden bg-[#100e0b] text-white">

         {/* Background Effects */}
         <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-amber-500/10 blur-[110px]" />
         <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-orange-500/10 blur-[110px]" />

         <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

            {/* Top CTA Section */}
            {/* <div className="border-b border-white/10 py-12">
               <div className="flex flex-col justify-between gap-8 rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-400/10 via-white/[0.03] to-orange-500/10 p-7 sm:p-10 lg:flex-row lg:items-center">

                  <div>
                     <div className="mb-3 flex items-center gap-2 text-amber-400">
                        <Sparkles size={18} />
                        <span className="text-xs font-bold uppercase tracking-[3px]">
                           Build Your Future
                        </span>
                     </div>

                     <h2 className="max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                        Your Child's Bright Future
                        <span className="block text-amber-400">
                           Starts With Us.
                        </span>
                     </h2>

                     <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                        Discover a place where knowledge, creativity and values
                        come together to shape tomorrow's leaders.
                     </p>
                  </div>

                  <Link
                     to="/admissions"
                     className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 px-7 py-4 text-sm font-extrabold text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-500/40"
                  >
                     Explore Admissions
                     <ArrowUpRight size={18} />
                  </Link>

               </div>
            </div> */}

            {/* Brand and Social Section */}
            <div className="grid gap-10 border-b border-white/10 py-12 lg:grid-cols-2 lg:items-center">

               <div>
                  <div className="mb-5 flex items-center gap-3">
                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-600 text-black shadow-lg shadow-amber-500/20">
                        <GraduationCap size={30} />
                     </div>

                     <div>
                        <h2 className="text-xl font-black tracking-wide sm:text-2xl">
                           Sunrise Public School
                        </h2>

                        <p className="mt-1 text-[10px] font-bold tracking-[3px] text-amber-400 sm:text-xs">
                           LEARN • GROW • SUCCEED
                        </p>
                     </div>
                  </div>

                  <p className="max-w-xl text-sm leading-7 text-slate-400">
                     Empowering students with knowledge, technology and values.
                     We believe in building confident minds, strong character
                     and a brighter future for every student.
                  </p>
               </div>

               <div className="lg:justify-self-end">
                  <h3 className="mb-2 text-lg font-bold">
                     Follow Our Journey
                  </h3>

                  <p className="mb-5 text-sm text-slate-400">
                     Connect with us on social media.
                  </p>

                  <div className="flex gap-3">
                     {socialLinks.map((social) => {
                        const Icon = social.icon;

                        return (
                           <a
                              key={social.name}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={social.name}
                              title={social.name}
                              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:bg-amber-400 hover:text-black hover:shadow-lg hover:shadow-amber-500/20"
                           >
                              <Icon size={21} />
                           </a>
                        );
                     })}
                  </div>
               </div>

            </div>

            {/* Footer Information Columns */}
            <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">

               {/* About */}
               <div>
                  <h3 className="mb-4 text-lg font-bold">
                     About Our School
                  </h3>

                  <div className="mb-5 h-1 w-12 rounded-full bg-amber-400" />

                  <p className="text-sm leading-7 text-slate-400">
                     Sunrise Public School provides a supportive learning
                     environment where students discover their potential,
                     develop creativity and prepare for tomorrow.
                  </p>

                  <p className="mt-5 text-sm font-semibold text-amber-400">
                     Learn Today, Lead Tomorrow.
                  </p>
               </div>

               {/* Quick Links */}
               <div>
                  <h3 className="mb-4 text-lg font-bold">
                     Quick Links
                  </h3>

                  <div className="mb-5 h-1 w-12 rounded-full bg-amber-400" />

                  <ul className="space-y-3">
                     {quickLinks.map((link) => (
                        <li key={link.path}>
                           <Link
                              to={link.path}
                              className="group flex items-center gap-2 text-sm text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-amber-400"
                           >
                              <ArrowUpRight
                                 size={15}
                                 className="text-amber-500"
                              />
                              {link.name}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Contact */}
               <div>
                  <h3 className="mb-4 text-lg font-bold">
                     Contact Information
                  </h3>

                  <div className="mb-5 h-1 w-12 rounded-full bg-amber-400" />

                  <ul className="space-y-5">

                     <li className="flex items-start gap-3">
                        <div className="rounded-lg bg-amber-400/10 p-2 text-amber-400">
                           <MapPin size={18} />
                        </div>

                        <div>
                           <p className="text-sm font-semibold text-white">
                              Our Location
                           </p>
                           <p className="mt-1 text-sm leading-6 text-slate-400">
                              Rajasthan, India
                           </p>
                        </div>
                     </li>

                     <li className="flex items-start gap-3">
                        <div className="rounded-lg bg-amber-400/10 p-2 text-amber-400">
                           <Phone size={18} />
                        </div>

                        <div>
                           <p className="text-sm font-semibold text-white">
                              Phone Number
                           </p>
                           <a
                              href="tel:+919876543210"
                              className="mt-1 block text-sm text-slate-400 hover:text-amber-400"
                           >
                              +91 98765 43210
                           </a>
                        </div>
                     </li>

                     <li className="flex items-start gap-3">
                        <div className="rounded-lg bg-amber-400/10 p-2 text-amber-400">
                           <Mail size={18} />
                        </div>

                        <div>
                           <p className="text-sm font-semibold text-white">
                              Email Address
                           </p>
                           <a
                              href="mailto:info@school.com"
                              className="mt-1 block break-all text-sm text-slate-400 hover:text-amber-400"
                           >
                              info@school.com
                           </a>
                        </div>
                     </li>

                  </ul>
               </div>

               {/* Vision */}
               <div>
                  <h3 className="mb-4 text-lg font-bold">
                     Our Vision
                  </h3>

                  <div className="mb-5 h-1 w-12 rounded-full bg-amber-400" />

                  <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-transparent p-5">
                     <GraduationCap
                        size={30}
                        className="mb-4 text-amber-400"
                     />

                     <p className="text-sm leading-7 text-slate-300">
                        "Education is the foundation of a successful life.
                        Learn today, lead tomorrow."
                     </p>

                     <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-400">
                        Sunrise Public School
                     </p>
                  </div>
               </div>

            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-center sm:flex-row sm:text-left">

               <p className="text-xs text-slate-500 sm:text-sm">
                  © {new Date().getFullYear()} Sunrise Public School.
                  All rights reserved.
               </p>

               <p className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                  Made with
                  <Heart
                     size={14}
                     className="fill-amber-400 text-amber-400"
                  />
                  for Education
               </p>

            </div>

         </div>
      </footer>
   );
}
