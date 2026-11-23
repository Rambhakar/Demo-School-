
import React, { useState } from "react";
import {
   MapPin,
   Phone,
   Mail,
   Clock,
   Send,
   MessageCircle,
   Navigation,
   Globe,
   School,
   ChevronDown,
   ChevronUp,
   Headphones,
   CalendarDays,
   User,
   BookOpen,
   CheckCircle,
   Sparkles,
} from "lucide-react";

const schoolContact = {
   name: "Sunrise Public School",
   tagline: "Learn • Grow • Succeed",
   address: "School Road, Rajasthan, India",
   phone: "+91 8955419560",
   email: "ramniwasbhakar2008@gmail.com",
   whatsapp: "8955419560",
   timings: "Monday - Saturday",
   hours: "08:00 AM - 03:00 PM",
};

const faqs = [
   {
      question: "How can I apply for admission?",
      answer:
         "Visit our Admissions page and fill out the online admission enquiry form. Our admission team can guide you through the next steps.",
   },
   {
      question: "How can I contact the school office?",
      answer:
         "You can contact the school office by phone, email or by submitting the enquiry form on this page.",
   },
   {
      question: "Can I visit the school campus?",
      answer:
         "Yes. Please contact the school office during working hours to confirm a suitable campus visit time.",
   },
   {
      question: "Where can I find school notices?",
      answer:
         "Visit the Notice Board page on our website to explore school announcements, events and examination updates.",
   },
];

export default function Contact() {
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      subject: "General Enquiry",
      message: "",
   });

   const [submitted, setSubmitted] = useState(false);
   const [openFaq, setOpenFaq] = useState(0);

   const handleChange = (e) => {
      const { name, value } = e.target;

      setFormData((previous) => ({
         ...previous,
         [name]: value,
      }));

      setSubmitted(false);
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      const phone = formData.phone.replace(/\D/g, "");

      if (phone.length !== 10) {
         alert("Please enter a valid 10-digit mobile number.");
         return;
      }

      // Frontend demo: opens WhatsApp with the enquiry details.
      // Replace the demo WhatsApp number with the school's real number.
      const message = `
New School Enquiry

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Subject: ${formData.subject}

Message:
${formData.message}
    `.trim();

      const whatsappUrl =
         `https://wa.me/${schoolContact.whatsapp}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setSubmitted(true);
      setFormData({
         name: "",
         email: "",
         phone: "",
         subject: "General Enquiry",
         message: "",
      });
   };

   const openMap = () => {
      const query = encodeURIComponent(schoolContact.address);
      window.open(
         `https://www.google.com/maps/search/?api=1&query=${query}`,
         "_blank",
         "noopener,noreferrer"
      );
   };

   return (
      <main className="min-h-screen overflow-hidden bg-[#17120d] text-[#f5e8d1]">

         <style>{`
        @keyframes contactFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .contact-float {
          animation: contactFloat 5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .contact-float { animation: none; }
        }
      `}</style>

         {/* HERO SECTION */}
         <section className="relative overflow-hidden border-b border-amber-400/10 bg-[#21180f] px-5 py-16 sm:px-8 lg:py-24">

            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[110px]" />
            <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-orange-900/20 blur-[110px]" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">

               <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-[10px] font-black tracking-[2px] text-amber-300">
                     <MessageCircle size={14} />
                     WE WOULD LOVE TO HEAR FROM YOU
                  </div>

                  <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                     Let's Start a
                     <span className="mt-2 block text-amber-400">
                        Conversation.
                     </span>
                  </h1>

                  <p className="mt-6 max-w-xl text-sm leading-8 text-[#c2b29a] sm:text-base">
                     Have questions about admissions, academics or school
                     activities? Our team is here to help. Get in touch
                     with Sunrise Public School.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">

                     <a
                        href={`tel:${schoolContact.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3.5 text-sm font-black text-[#21170d] transition hover:-translate-y-1"
                     >
                        <Phone size={17} />
                        Call School
                     </a>

                     <a
                        href={`mailto:${schoolContact.email}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-white/[.03] px-6 py-3.5 text-sm font-bold text-[#f0dfc2] transition hover:bg-amber-400/10"
                     >
                        <Mail size={17} />
                        Send Email
                     </a>

                  </div>

                  <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">

                     {[
                        ["Phone", "Call Us"],
                        ["Email", "Write Us"],
                        ["Visit", "Meet Us"],
                     ].map(([number, label]) => (
                        <div
                           key={number}
                           className="rounded-2xl border border-amber-400/10 bg-[#2a1e13]/80 p-4"
                        >
                           <p className="text-lg font-black text-amber-400">
                              {number}
                           </p>
                           <p className="mt-1 text-[10px] font-semibold text-[#b7a58a]">
                              {label}
                           </p>
                        </div>
                     ))}

                  </div>
               </div>

               {/* HERO CONTACT CARD */}
               <div className="contact-float relative mx-auto w-full max-w-md">

                  <div className="rounded-[30px] border border-amber-400/20 bg-[#2a1e13] p-6 shadow-2xl sm:p-8">

                     <div className="flex items-center justify-between border-b border-amber-400/10 pb-5">

                        <div>
                           <p className="text-[10px] font-black tracking-[2px] text-amber-400">
                              SCHOOL CONTACT
                           </p>
                           <h2 className="mt-2 text-xl font-black">
                              Get in Touch
                           </h2>
                        </div>

                        <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-400">
                           <School size={27} />
                        </div>

                     </div>

                     <div className="mt-6 space-y-5">

                        {[
                           {
                              icon: Phone,
                              title: "Phone Number",
                              value: schoolContact.phone,
                           },
                           {
                              icon: Mail,
                              title: "Email Address",
                              value: schoolContact.email,
                           },
                           {
                              icon: MapPin,
                              title: "School Location",
                              value: schoolContact.address,
                           },
                           {
                              icon: Clock,
                              title: "Office Hours",
                              value: schoolContact.hours,
                           },
                        ].map((item) => {
                           const Icon = item.icon;

                           return (
                              <div key={item.title} className="flex items-start gap-4">

                                 <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                                    <Icon size={20} />
                                 </div>

                                 <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-[#9e8a70]">
                                       {item.title}
                                    </p>

                                    <p className="mt-1 break-words text-sm font-bold text-[#f5e8d1]">
                                       {item.value}
                                    </p>
                                 </div>

                              </div>
                           );
                        })}

                     </div>

                     <button
                        type="button"
                        onClick={openMap}
                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-5 py-3 text-xs font-black text-amber-300 transition hover:bg-amber-400/20"
                     >
                        <Navigation size={16} />
                        Get Directions
                     </button>

                  </div>
               </div>

            </div>
         </section>

         {/* CONTACT INFORMATION CARDS */}
         <section className="border-b border-amber-400/10 bg-[#1b150f] px-5 py-14 sm:px-8">

            <div className="mx-auto max-w-7xl">

               <div className="mb-9 text-center">
                  <p className="text-[10px] font-black tracking-[3px] text-amber-400">
                     CONTACT INFORMATION
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                     We're Just a Call Away
                  </h2>
               </div>

               <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                  {[
                     {
                        icon: Phone,
                        title: "Call Us",
                        value: schoolContact.phone,
                        description: "Speak with our school office.",
                        link: `tel:${schoolContact.phone.replace(/\s/g, "")}`,
                        action: "Call Now",
                     },
                     {
                        icon: Mail,
                        title: "Email Us",
                        value: schoolContact.email,
                        description: "Send us your questions.",
                        link: `mailto:${schoolContact.email}`,
                        action: "Send Email",
                     },
                     {
                        icon: MapPin,
                        title: "Visit Us",
                        value: schoolContact.address,
                        description: "Find our school location.",
                        link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(schoolContact.address)}`,
                        action: "View Map",
                     },
                     {
                        icon: MessageCircle,
                        title: "WhatsApp",
                        value: "Chat with our team",
                        description: "Send us a quick message.",
                        link: `https://wa.me/${schoolContact.whatsapp}`,
                        action: "Chat Now",
                     },
                  ].map((item) => {
                     const Icon = item.icon;

                     return (
                        <div
                           key={item.title}
                           className="group rounded-3xl border border-amber-400/10 bg-[#211910] p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40"
                        >

                           <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 transition group-hover:scale-110">
                              <Icon size={26} />
                           </div>

                           <h3 className="mt-5 text-lg font-black">
                              {item.title}
                           </h3>

                           <p className="mt-2 break-words text-sm font-bold text-amber-300">
                              {item.value}
                           </p>

                           <p className="mt-2 text-xs text-[#a9977e]">
                              {item.description}
                           </p>

                           <a
                              href={item.link}
                              target={item.title === "Visit Us" || item.title === "WhatsApp" ? "_blank" : undefined}
                              rel="noopener noreferrer"
                              className="mt-5 inline-flex items-center gap-2 text-xs font-black text-amber-400 hover:text-amber-200"
                           >
                              {item.action}
                              <Navigation size={14} />
                           </a>

                        </div>
                     );
                  })}

               </div>
            </div>
         </section>

         {/* CONTACT FORM */}
         <section className="px-5 py-16 sm:px-8 lg:py-20">

            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr]">

               <div>

                  <p className="text-[10px] font-black tracking-[3px] text-amber-400">
                     SEND US AN ENQUIRY
                  </p>

                  <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                     How Can We
                     <span className="block text-amber-400">Help You?</span>
                  </h2>

                  <p className="mt-5 text-sm leading-8 text-[#b7a58a]">
                     Fill in the enquiry form with your details and
                     question. Our school team can connect with you
                     through the contact details you provide.
                  </p>

                  <div className="mt-8 space-y-4">

                     {[
                        [CheckCircle, "Admission Enquiries", "Get information about admissions and classes."],
                        [BookOpen, "Academic Information", "Ask about academics and school activities."],
                        [Headphones, "General Support", "Get help with general school enquiries."],
                     ].map(([Icon, title, description]) => (
                        <div key={title} className="flex items-center gap-4 rounded-2xl border border-amber-400/10 bg-[#211910] p-4">

                           <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                              <Icon size={22} />
                           </div>

                           <div>
                              <h3 className="text-sm font-black">{title}</h3>
                              <p className="mt-1 text-xs text-[#a9977e]">
                                 {description}
                              </p>
                           </div>

                        </div>
                     ))}

                  </div>

               </div>

               {/* FORM */}
               <div className="rounded-[30px] border border-amber-400/15 bg-[#211910] p-6 shadow-2xl sm:p-9">

                  <div className="mb-7">
                     <h3 className="text-2xl font-black">
                        Send an Enquiry
                     </h3>

                     <p className="mt-2 text-xs text-[#a9977e]">
                        Please fill in all required details.
                     </p>
                  </div>

                  {submitted && (
                     <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                        <CheckCircle size={20} className="shrink-0" />
                        WhatsApp enquiry opened. Please send the message to complete your enquiry.
                     </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">

                     <div className="grid gap-5 sm:grid-cols-2">

                        <div>
                           <label className="mb-2 block text-xs font-bold text-[#d8c5a6]">
                              Full Name *
                           </label>

                           <div className="relative">
                              <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />

                              <input
                                 type="text"
                                 name="name"
                                 required
                                 value={formData.name}
                                 onChange={handleChange}
                                 placeholder="Enter your name"
                                 className="w-full rounded-xl border border-[#66513a] bg-[#17120d] py-3.5 pl-11 pr-4 text-sm text-[#f5e8d1] outline-none placeholder:text-[#8f7d64] focus:border-amber-400"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="mb-2 block text-xs font-bold text-[#d8c5a6]">
                              Email Address *
                           </label>

                           <div className="relative">
                              <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />

                              <input
                                 type="email"
                                 name="email"
                                 required
                                 value={formData.email}
                                 onChange={handleChange}
                                 placeholder="Enter your email"
                                 className="w-full rounded-xl border border-[#66513a] bg-[#17120d] py-3.5 pl-11 pr-4 text-sm text-[#f5e8d1] outline-none placeholder:text-[#8f7d64] focus:border-amber-400"
                              />
                           </div>
                        </div>

                     </div>

                     <div className="grid gap-5 sm:grid-cols-2">

                        <div>
                           <label className="mb-2 block text-xs font-bold text-[#d8c5a6]">
                              Mobile Number *
                           </label>

                           <div className="relative">
                              <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />

                              <input
                                 type="tel"
                                 name="phone"
                                 required
                                 value={formData.phone}
                                 onChange={handleChange}
                                 maxLength={10}
                                 placeholder="10 digit mobile number"
                                 className="w-full rounded-xl border border-[#66513a] bg-[#17120d] py-3.5 pl-11 pr-4 text-sm text-[#f5e8d1] outline-none placeholder:text-[#8f7d64] focus:border-amber-400"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="mb-2 block text-xs font-bold text-[#d8c5a6]">
                              Enquiry Subject *
                           </label>

                           <select
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              className="w-full rounded-xl border border-[#66513a] bg-[#17120d] px-4 py-3.5 text-sm text-[#f5e8d1] outline-none focus:border-amber-400"
                           >
                              <option>General Enquiry</option>
                              <option>Admission Enquiry</option>
                              <option>Academic Information</option>
                              <option>Fee Information</option>
                              <option>School Events</option>
                              <option>Other</option>
                           </select>
                        </div>

                     </div>

                     <div>
                        <label className="mb-2 block text-xs font-bold text-[#d8c5a6]">
                           Your Message *
                        </label>

                        <textarea
                           name="message"
                           required
                           rows={5}
                           value={formData.message}
                           onChange={handleChange}
                           placeholder="Write your question or enquiry here..."
                           className="w-full resize-y rounded-xl border border-[#66513a] bg-[#17120d] px-4 py-3.5 text-sm text-[#f5e8d1] outline-none placeholder:text-[#8f7d64] focus:border-amber-400"
                        />
                     </div>

                     <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-4 text-sm font-black text-[#21170d] shadow-lg transition hover:-translate-y-1 hover:shadow-amber-500/10"
                     >
                        Send Enquiry on WhatsApp
                        <Send size={17} />
                     </button>

                     <p className="text-center text-[10px] leading-5 text-[#8f7d64]">
                        Demo form: Submitting opens WhatsApp with your enquiry.
                        It does not save the enquiry in the school database.
                     </p>

                  </form>

               </div>

            </div>
         </section>

         {/* GOOGLE MAP */}
         <section className="border-y border-amber-400/10 bg-[#1d160f] px-5 py-16 sm:px-8 lg:py-20">

            <div className="mx-auto max-w-7xl">

               <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                  <div>
                     <p className="text-[10px] font-black tracking-[3px] text-amber-400">
                        FIND OUR LOCATION
                     </p>

                     <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                        Find Us on the Map
                     </h2>

                     <p className="mt-3 text-sm text-[#b7a58a]">
                        Explore the school location and get directions.
                     </p>
                  </div>

                  <button
                     type="button"
                     onClick={openMap}
                     className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-[#21170d] transition hover:-translate-y-1"
                  >
                     <Navigation size={16} />
                     Open Google Maps
                  </button>

               </div>

               <div className="overflow-hidden rounded-[28px] border border-amber-400/20 bg-[#211910] p-2">

                  <iframe
                     title="School Location Map"
                     src={`https://maps.google.com/maps?q=${encodeURIComponent(schoolContact.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                     width="100%"
                     height="450"
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                     className="rounded-2xl border-0 grayscale-[20%] contrast-[90%]"
                     allowFullScreen
                  />

                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">

                     <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                           <MapPin size={21} />
                        </div>

                        <div>
                           <p className="text-sm font-black">
                              {schoolContact.name}
                           </p>
                           <p className="mt-1 text-xs text-[#a9977e]">
                              {schoolContact.address}
                           </p>
                        </div>
                     </div>

                     <span className="text-[10px] text-amber-300">
                        Demo location. Confirm the actual school address.
                     </span>

                  </div>

               </div>

            </div>
         </section>

         {/* OFFICE HOURS */}
         <section className="px-5 py-16 sm:px-8">

            <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">

               <div className="rounded-[28px] border border-amber-400/15 bg-[#211910] p-7 sm:p-9">

                  <div className="flex items-center gap-3">
                     <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                        <Clock size={24} />
                     </div>

                     <div>
                        <p className="text-[10px] font-black tracking-[2px] text-amber-400">
                           OFFICE HOURS
                        </p>
                        <h3 className="mt-1 text-xl font-black">
                           When Can You Visit?
                        </h3>
                     </div>
                  </div>

                  <div className="mt-7 space-y-4">

                     {[
                        ["Monday - Saturday", "08:00 AM - 03:00 PM"],
                        ["Sunday", "Closed"],
                     ].map(([day, time]) => (
                        <div
                           key={day}
                           className="flex items-center justify-between gap-3 border-b border-white/10 pb-4"
                        >
                           <span className="text-sm font-semibold text-[#c7b494]">
                              {day}
                           </span>

                           <span className="text-xs font-bold text-amber-300">
                              {time}
                           </span>
                        </div>
                     ))}

                  </div>

                  <p className="mt-5 text-xs leading-6 text-[#8f7d64]">
                     Demo timings only. Please confirm the school's actual
                     working hours before visiting.
                  </p>

               </div>

               <div className="rounded-[28px] border border-amber-400/15 bg-[#211910] p-7 sm:p-9">

                  <div className="flex items-center gap-3">
                     <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400">
                        <Headphones size={24} />
                     </div>

                     <div>
                        <p className="text-[10px] font-black tracking-[2px] text-amber-400">
                           WE ARE HERE TO HELP
                        </p>
                        <h3 className="mt-1 text-xl font-black">
                           Need Assistance?
                        </h3>
                     </div>
                  </div>

                  <p className="mt-6 text-sm leading-7 text-[#b7a58a]">
                     Our school office can guide parents and students
                     regarding admissions, academic information, school
                     activities and general enquiries.
                  </p>

                  <a
                     href={`https://wa.me/${schoolContact.whatsapp}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black text-white transition hover:-translate-y-1 hover:bg-emerald-400"
                  >
                     <MessageCircle size={17} />
                     Chat on WhatsApp
                  </a>

               </div>

            </div>
         </section>

         {/* FAQ */}
         <section className="border-t border-amber-400/10 bg-[#1d160f] px-5 py-16 sm:px-8">

            <div className="mx-auto max-w-4xl">

               <div className="mb-10 text-center">
                  <p className="text-[10px] font-black tracking-[3px] text-amber-400">
                     QUICK ANSWERS
                  </p>

                  <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                     Frequently Asked Questions
                  </h2>

                  <p className="mt-4 text-sm text-[#b7a58a]">
                     Some helpful answers to common school enquiries.
                  </p>
               </div>

               <div className="space-y-3">

                  {faqs.map((faq, index) => {
                     const isOpen = openFaq === index;

                     return (
                        <div
                           key={faq.question}
                           className="overflow-hidden rounded-2xl border border-amber-400/10 bg-[#211910]"
                        >

                           <button
                              type="button"
                              onClick={() => setOpenFaq(isOpen ? -1 : index)}
                              className="flex w-full items-center justify-between gap-4 p-5 text-left"
                           >
                              <span className="text-sm font-bold text-[#f0dfc2]">
                                 {faq.question}
                              </span>

                              {isOpen ? (
                                 <ChevronUp size={19} className="shrink-0 text-amber-400" />
                              ) : (
                                 <ChevronDown size={19} className="shrink-0 text-amber-400" />
                              )}
                           </button>

                           {isOpen && (
                              <div className="border-t border-white/10 px-5 pb-5 pt-4">
                                 <p className="text-sm leading-7 text-[#b7a58a]">
                                    {faq.answer}
                                 </p>
                              </div>
                           )}

                        </div>
                     );
                  })}

               </div>

            </div>
         </section>

         {/* FINAL CTA */}
         <section className="border-t border-amber-400/10 bg-[#211910] px-5 py-16 sm:px-8">

            <div className="mx-auto max-w-7xl rounded-[30px] border border-amber-400/15 bg-[#2a1e13] p-8 text-center sm:p-12">

               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                  <Sparkles size={31} />
               </div>

               <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                  We Look Forward to
                  <span className="block text-amber-400">
                     Connecting With You.
                  </span>
               </h2>

               <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#b7a58a]">
                  Whether you are a parent, student or visitor,
                  we are happy to hear from you.
               </p>

               <a
                  href={`tel:${schoolContact.phone.replace(/\s/g, "")}`}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-7 py-4 text-sm font-black text-[#21170d] transition hover:-translate-y-1"
               >
                  <Phone size={17} />
                  Contact School Office
               </a>

            </div>

            <p className="mx-auto mt-8 max-w-7xl text-center text-[10px] leading-5 text-[#8f7d64]">
               Demo contact details: Replace the phone number, email, WhatsApp number,
               address, office timings and map location with verified school information
               before publishing.
            </p>

         </section>

      </main>
   );
}
