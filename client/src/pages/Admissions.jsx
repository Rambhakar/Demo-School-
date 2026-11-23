import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, CheckCircle2, ChevronRight, FileText, GraduationCap,
  Mail, MapPin, Phone, ShieldCheck, Sparkles, User, Users, Send,
  AlertCircle, Award, BookOpen, Layers, ClipboardCheck
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialForm = {
  studentName: "",
  fatherName: "",
  motherName: "",
  dob: "",
  gender: "",
  classApplied: "",
  previousSchool: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  address: "",
  message: "",
};

// Nursery to Class 10, followed by stream-wise options for Classes 11 and 12.
// Stream is included inside classApplied so the existing backend contract remains unchanged.
const classGroups = [
  {
    label: "Pre-Primary",
    options: ["Nursery", "LKG", "UKG"],
  },
  {
    label: "Primary & Middle",
    options: Array.from({ length: 8 }, (_, i) => `Class ${i + 1}`),
  },
  {
    label: "Secondary",
    options: ["Class 9", "Class 10"],
  },
  {
    label: "Senior Secondary • Class 11",
    options: [
      "Class 11 - Arts",
      "Class 11 - Commerce",
      "Class 11 - Science (Biology)",
      "Class 11 - Science (Mathematics)",
    ],
  },
  {
    label: "Senior Secondary • Class 12",
    options: [
      "Class 12 - Arts",
      "Class 12 - Commerce",
      "Class 12 - Science (Biology)",
      "Class 12 - Science (Mathematics)",
    ],
  },
];

const allClassOptions = classGroups.flatMap((group) => group.options);

const inputClass =
  "w-full rounded-xl border border-[#66513a] bg-[#211910] px-4 py-3.5 text-sm text-[#f6e9d2] outline-none transition placeholder:text-[#9b896f] focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10";

const labelClass = "mb-2 block text-sm font-bold text-[#ead9bd]";

function Field({ label, children, full = false, optional = false }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className={labelClass}>
        {label}
        {optional && (
          <span className="ml-2 text-xs font-normal text-[#a89476]">
            Optional
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ number, icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
        <Icon size={23} />
      </div>
      <div>
        <p className="mb-1 text-[10px] font-black tracking-[2px] text-amber-500">
          SECTION {number}
        </p>
        <h3 className="text-lg font-extrabold text-[#f4e6ce] sm:text-xl">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-[#a99a83]">{description}</p>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 py-3 last:border-0">
      <span className="text-xs text-[#a9977b]">{label}</span>
      <span className="max-w-[60%] break-words text-right text-xs font-semibold text-[#f0dfc2]">
        {value || "Not provided"}
      </span>
    </div>
  );
}

export default function Admissions() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const nodes = document.querySelectorAll(".admission-reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("visible"));
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
      { threshold: 0.08 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: value }));
  };

  const selectedClassGroup = useMemo(
    () => classGroups.find((group) => group.options.includes(form.classApplied)),
    [form.classApplied]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (
      !form.studentName.trim() ||
      !form.fatherName.trim() ||
      !form.classApplied ||
      !form.dob ||
      !form.gender
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (!accepted) {
      setError("Please confirm the information before submitting.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to submit your application.");
      }

      setSuccess({
        applicationNumber:
          data.admission?.applicationNumber ||
          data.application?.applicationNumber ||
          data.applicationNumber ||
          "",
      });
      setForm(initialForm);
      setAccepted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <main className="min-h-screen overflow-hidden bg-[#17120d] text-[#f5e8d1]">
      <style>{`
        .admission-reveal {
          opacity: 0;
          transform: translateY(25px);
          transition: opacity .7s ease, transform .7s ease;
        }
        .admission-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes coffeeFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .coffee-float { animation: coffeeFloat 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .admission-reveal { opacity: 1; transform: none; transition: none; }
          .coffee-float { animation: none; }
        }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-amber-400/10 bg-[#20170f] px-5 py-16 sm:px-8 lg:py-20">
        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-amber-600/10 blur-[110px]" />
        <div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-orange-900/20 blur-[100px]" />

        <div className="admission-reveal relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-bold tracking-[2px] text-amber-300">
              <Sparkles size={15} /> ONLINE ADMISSION 2026-27
            </div>
            <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Your Child&apos;s Future
              <span className="mt-2 block text-amber-400">Starts With Us.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-8 text-[#c2b29a] sm:text-base">
              Begin a meaningful learning journey at Sunrise Public School.
              Complete the admission enquiry and our school team can guide you
              through the next steps.
            </p>
            <a
              href="#admission-form"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-7 py-4 text-sm font-black text-[#21170d] shadow-lg shadow-amber-900/20 transition hover:-translate-y-1 hover:brightness-110"
            >
              Start Admission Enquiry <ArrowRight size={19} />
            </a>
            <div className="mt-9 flex flex-wrap gap-5 text-xs font-semibold text-[#c7b89f]">
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-amber-400" /> Secure Enquiry</span>
              <span className="flex items-center gap-2"><Users size={16} className="text-amber-400" /> Parent Guidance</span>
              <span className="flex items-center gap-2"><GraduationCap size={16} className="text-amber-400" /> Student Focus</span>
            </div>
          </div>

          <div className="coffee-float relative mx-auto w-full max-w-lg">
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1100"
              alt="Students learning in a classroom"
              className="h-[300px] w-full rounded-[28px] border border-amber-300/20 object-cover opacity-85 shadow-2xl sm:h-[390px]"
            />
            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-amber-400/20 bg-[#2b2015] p-5 shadow-2xl sm:-left-7">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-400 p-3 text-[#20170f]"><GraduationCap size={27} /></div>
                <div>
                  <p className="font-extrabold text-[#f5e8d1]">Learn • Grow • Succeed</p>
                  <p className="mt-1 text-xs text-[#b7a58a]">A journey of possibilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="border-b border-amber-400/10 bg-[#1b150f] px-5 py-7 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          {[
            [FileText, "Online Application", "Submit enquiry details online"],
            [Phone, "School Follow-up", "The team can contact your family"],
            [BookOpen, "Admission Guidance", "Learn about the next steps"],
          ].map(([Icon, title, text]) => (
            <div key={title} className="flex items-center gap-4 rounded-2xl border border-amber-400/10 bg-[#251b12] p-5 transition hover:border-amber-400/40">
              <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400"><Icon size={23} /></div>
              <div>
                <h3 className="text-sm font-extrabold">{title}</h3>
                <p className="mt-1 text-xs text-[#a9977e]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUCCESS */}
      {success && (
        <section className="mx-auto max-w-7xl px-5 pt-8">
          <div className="rounded-2xl border border-emerald-500/30 bg-[#19291e] p-6 text-emerald-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={30} className="text-emerald-400" />
              <div>
                <h2 className="text-xl font-black">Enquiry Submitted Successfully!</h2>
                <p className="mt-1 text-sm text-emerald-200/70">Thank you. The admission team can contact you soon.</p>
              </div>
            </div>
            {success.applicationNumber && (
              <p className="mt-4 rounded-xl border border-emerald-400/20 bg-black/20 p-3 text-sm font-bold">
                Application Number: {success.applicationNumber}
              </p>
            )}
          </div>
        </section>
      )}

      {/* FORM + LIVE PREVIEW */}
      <section id="admission-form" className="scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-start gap-8 xl:grid-cols-[minmax(0,1fr)_370px]">
          {/* FORM COLUMN */}
          <div className="admission-reveal overflow-hidden rounded-[26px] border border-amber-400/15 bg-[#211910] shadow-2xl shadow-black/20">
            <div className="border-b border-amber-400/15 bg-gradient-to-r from-[#302216] to-[#211910] px-6 py-8 sm:px-9">
              <p className="text-xs font-black tracking-[3px] text-amber-400">SUNRISE PUBLIC SCHOOL</p>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">Admission Application</h2>
              <p className="mt-2 text-sm text-[#b7a58a]">Complete the details below to submit your admission enquiry.</p>
              <p className="mt-4 text-xs text-amber-300/80">* Required fields</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-9 p-5 sm:p-9">
              <section>
                <SectionHeading number="01" icon={User} title="Student Information" description="Basic details about the student." />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Student Full Name *">
                    <input name="studentName" value={form.studentName} onChange={updateField} required maxLength={100} placeholder="Enter student name" className={inputClass} />
                  </Field>
                  <Field label="Date of Birth *">
                    <input type="date" name="dob" value={form.dob} onChange={updateField} max={today} required className={inputClass} />
                  </Field>
                  <Field label="Gender *">
                    <select name="gender" value={form.gender} onChange={updateField} required className={inputClass}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Applying For Class *">
                    <select name="classApplied" value={form.classApplied} onChange={updateField} required className={inputClass}>
                      <option value="">Select Class / Stream</option>
                      {classGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <p className="mt-2 text-xs leading-5 text-[#a9977e]">
                      Nursery, LKG, UKG, Classes 1 to 10, and Classes 11 to 12 with Arts, Commerce, Science (Biology) or Science (Mathematics).
                    </p>
                  </Field>
                  {selectedClassGroup && (
                    <div className="sm:col-span-2 rounded-xl border border-amber-400/15 bg-amber-400/5 p-4">
                      <div className="flex items-center gap-3">
                        <Layers size={19} className="text-amber-400" />
                        <div>
                          <p className="text-xs font-bold text-amber-300">Selected admission level</p>
                          <p className="mt-1 text-sm font-semibold text-[#f0dfc2]">
                            {selectedClassGroup.label} · {form.classApplied}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <Field label="Previous School" optional full>
                    <input name="previousSchool" value={form.previousSchool} onChange={updateField} maxLength={150} placeholder="Previous school name" className={inputClass} />
                  </Field>
                </div>
              </section>

              <div className="border-t border-amber-400/10" />

              <section>
                <SectionHeading number="02" icon={Users} title="Parent / Guardian Details" description="Parent or guardian contact information." />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Father's Name *">
                    <input name="fatherName" value={form.fatherName} onChange={updateField} required maxLength={100} placeholder="Father's full name" className={inputClass} />
                  </Field>
                  <Field label="Mother's Name" optional>
                    <input name="motherName" value={form.motherName} onChange={updateField} maxLength={100} placeholder="Mother's full name" className={inputClass} />
                  </Field>
                  <Field label="Mobile Number *">
                    <input type="tel" name="phone" value={form.phone} onChange={handlePhoneChange} required inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" className={inputClass} />
                  </Field>
                  <Field label="Email Address" optional>
                    <input type="email" name="email" value={form.email} onChange={updateField} maxLength={150} placeholder="parent@example.com" className={inputClass} />
                  </Field>
                </div>
              </section>

              <div className="border-t border-amber-400/10" />

              <section>
                <SectionHeading number="03" icon={MapPin} title="Address Details" description="Residential address of the family." />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="City" optional>
                    <input name="city" value={form.city} onChange={updateField} maxLength={100} placeholder="Enter city" className={inputClass} />
                  </Field>
                  <Field label="State" optional>
                    <input name="state" value={form.state} onChange={updateField} maxLength={100} placeholder="Enter state" className={inputClass} />
                  </Field>
                  <Field label="Full Address" optional full>
                    <textarea name="address" value={form.address} onChange={updateField} rows={3} maxLength={500} placeholder="House number, street, area, landmark..." className={`${inputClass} resize-y`} />
                  </Field>
                </div>
              </section>

              <div className="border-t border-amber-400/10" />

              <section>
                <SectionHeading number="04" icon={FileText} title="Additional Information" description="Any questions or additional details." />
                <div className="mt-6">
                  <Field label="Message / Enquiry" optional>
                    <textarea name="message" value={form.message} onChange={updateField} rows={4} maxLength={1000} placeholder="Write your enquiry here..." className={`${inputClass} resize-y`} />
                    <p className="mt-2 text-right text-xs text-[#9b896f]">{form.message.length}/1000</p>
                  </Field>
                </div>
              </section>

              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="border-t border-amber-400/10 pt-7">
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-7 text-[#c0af95]">
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required className="mt-1 h-4 w-4 shrink-0 accent-amber-500" />
                  <span>I confirm that the information provided is accurate and agree to be contacted by the school regarding this admission enquiry.</span>
                </label>
                <button type="submit" disabled={loading} className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-4 text-sm font-black text-[#21170d] shadow-lg shadow-amber-900/20 transition hover:-translate-y-1 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-72">
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      Submitting Application...
                    </>
                  ) : (
                    <><Send size={18} /> Submit Admission Enquiry <ArrowRight size={18} /></>
                  )}
                </button>
                <p className="mt-4 flex items-center gap-2 text-xs text-[#9b896f]">
                  <ShieldCheck size={15} /> Your information is submitted to the school admission system.
                </p>
              </div>
            </form>
          </div>

          {/* LIVE DEMO PREVIEW COLUMN */}
          <aside className="space-y-6 xl:sticky xl:top-24">
            <div className="admission-reveal overflow-hidden rounded-[26px] border border-amber-400/20 bg-[#261c12] shadow-2xl">
              <div className="border-b border-amber-400/15 bg-gradient-to-r from-[#3b2a19] to-[#241a11] p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black tracking-[3px] text-amber-400">LIVE DEMO</p>
                    <h3 className="mt-2 text-xl font-black">Application Preview</h3>
                  </div>
                  <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400"><FileText size={24} /></div>
                </div>
                <p className="mt-3 text-xs leading-6 text-[#b7a58a]">As you fill the form, your entered information will appear here.</p>
              </div>

              <div className="p-6">
                <div className="rounded-2xl border border-amber-400/20 bg-[#17120d] p-5">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-[#21170d]"><GraduationCap size={24} /></div>
                    <div>
                      <h4 className="text-sm font-black">Sunrise Public School</h4>
                      <p className="mt-1 text-[9px] font-bold tracking-[2px] text-amber-400">LEARN • GROW • SUCCEED</p>
                    </div>
                  </div>
                  <div className="py-4 text-center">
                    <p className="text-[10px] font-bold tracking-[2px] text-amber-400">ADMISSION ENQUIRY</p>
                    <p className="mt-2 text-lg font-black">Student Profile</p>
                    <p className="mt-1 text-[10px] text-[#9b896f]">Demo preview • Not an official application receipt</p>
                  </div>
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-400/10 bg-[#251b12] p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10 text-amber-400"><User size={23} /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{form.studentName || "Student Full Name"}</p>
                      <p className="mt-1 text-xs text-[#a9977e]">{form.classApplied || "Class not selected"}</p>
                    </div>
                  </div>
                  <PreviewRow label="Date of Birth" value={form.dob} />
                  <PreviewRow label="Gender" value={form.gender} />
                  <PreviewRow label="Father" value={form.fatherName} />
                  <PreviewRow label="Mother" value={form.motherName} />
                  <PreviewRow label="Previous School" value={form.previousSchool} />
                  <PreviewRow label="Mobile" value={form.phone} />
                  <PreviewRow label="Email" value={form.email} />
                  <PreviewRow label="City" value={form.city} />
                  <PreviewRow label="State" value={form.state} />
                  <PreviewRow label="Address" value={form.address} />
                  <PreviewRow label="Message" value={form.message} />
                  <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-center">
                    <p className="text-[10px] font-bold tracking-[2px] text-amber-400">APPLICATION STATUS</p>
                    <p className="mt-2 text-sm font-extrabold text-[#e7d5b6]">Draft Preview</p>
                  </div>
                </div>
                <p className="mt-4 text-center text-[11px] leading-5 text-[#9b896f]">
                  This is only a live visual preview. Your application is submitted only when you press the submit button.
                </p>
              </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="admission-reveal rounded-[26px] border border-amber-400/15 bg-[#211910] p-6">
              <p className="text-[10px] font-black tracking-[3px] text-amber-400">ADMISSION PROCESS</p>
              <h3 className="mt-2 text-xl font-black">How It Works</h3>
              <div className="mt-6 space-y-6">
                {[
                  ["01", "Choose Class & Stream", "Select Nursery to Class 10, or choose Arts, Commerce, Science Biology or Science Mathematics for Classes 11 and 12."],
                  ["02", "Fill Student Details", "Enter student and parent information."],
                  ["03", "Submit Enquiry", "Send your application to the school."],
                  ["04", "School Follow-up", "The admission team can contact you with the next steps."],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-xs font-black text-amber-400">{number}</div>
                    <div>
                      <h4 className="text-sm font-bold">{title}</h4>
                      <p className="mt-1 text-xs leading-5 text-[#a9977e]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CLASS / STREAM GUIDE */}
            <div className="admission-reveal rounded-[26px] border border-amber-400/15 bg-[#211910] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-400/10 p-3 text-amber-400"><ClipboardCheck size={21} /></div>
                <div>
                  <p className="text-[10px] font-black tracking-[2px] text-amber-400">CLASS SELECTION GUIDE</p>
                  <h3 className="mt-1 text-lg font-black">Available Classes</h3>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {classGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-bold text-[#ead9bd]">{group.label}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.options.map((item) => (
                        <span key={item} className={`rounded-lg border px-2.5 py-1.5 text-[10px] ${form.classApplied === item ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-amber-400/10 bg-[#2a2016] text-[#b7a58a]"}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-5 text-[#9b896f]">
                Stream availability should be confirmed with the school before publishing the form.
              </p>
            </div>

            {/* CONTACT CARD */}
            <div className="admission-reveal rounded-[26px] border border-amber-400/15 bg-[#2b2015] p-6">
              <h3 className="text-lg font-black">Need Help?</h3>
              <p className="mt-2 text-xs leading-6 text-[#b7a58a]">Contact the school for admission-related enquiries.</p>
              <div className="mt-5 space-y-4">
                <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-[#ead9bd] transition hover:text-amber-400">
                  <Phone size={18} className="text-amber-400" /> +91 98765 43210
                </a>
                <a href="mailto:info@school.com" className="flex items-center gap-3 break-all text-sm text-[#ead9bd] transition hover:text-amber-400">
                  <Mail size={18} className="shrink-0 text-amber-400" /> info@school.com
                </a>
                <div className="flex items-center gap-3 text-sm text-[#ead9bd]">
                  <MapPin size={18} className="text-amber-400" /> Rajasthan, India
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="border-t border-amber-400/10 bg-[#211910] px-5 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <Award size={34} className="mx-auto text-amber-400" />
          <h2 className="mt-5 text-3xl font-black sm:text-4xl">
            Every Great Journey <span className="text-amber-400">Begins Here.</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#b7a58a]">
            Take the first step towards a bright educational future with Sunrise Public School.
          </p>
          <a href="#admission-form" className="mt-8 inline-flex items-center gap-3 rounded-xl bg-amber-400 px-7 py-4 text-sm font-black text-[#21170d] transition hover:-translate-y-1 hover:bg-amber-300">
            Fill Admission Form <ChevronRight size={19} />
          </a>
        </div>
      </section>
    </main>
  );
}
