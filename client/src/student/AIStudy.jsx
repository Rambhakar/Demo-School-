import { useState } from "react";
import { Link } from "react-router-dom";

export default function AIStudy() {
   const [selectedSubject, setSelectedSubject] = useState("General");
   const [question, setQuestion] = useState("");

   const [messages, setMessages] = useState([
      {
         id: 1,
         type: "ai",
         text: "Hello! 👋 I am your AI Study Assistant. Ask me anything about your school subjects and I will help you understand it.",
      },
   ]);

   const subjects = [
      "General",
      "Mathematics",
      "Science",
      "English",
      "Hindi",
      "Social Science",
      "Computer",
   ];

   const suggestions = [
      "Explain this topic in simple words",
      "Give me some practice questions",
      "Help me understand this chapter",
      "Give me a short revision",
   ];

   const getAIResponse = (text) => {
      const lowerText = text.toLowerCase();

      if (
         selectedSubject === "Mathematics" &&
         (lowerText.includes("algebra") ||
            lowerText.includes("equation"))
      ) {
         return "Sure! 😊 Algebra uses letters or symbols to represent unknown values. For example, in x + 5 = 10, subtracting 5 from both sides gives x = 5.";
      }

      if (
         selectedSubject === "Science" &&
         (lowerText.includes("cell") ||
            lowerText.includes("biology"))
      ) {
         return "A cell is the basic structural and functional unit of living organisms. Cells contain different parts called organelles, each with specific functions.";
      }

      if (lowerText.includes("hello") || lowerText.includes("hi")) {
         return "Hello! 👋 What would you like to study today?";
      }

      if (lowerText.includes("revision")) {
         return `Let's revise ${selectedSubject}. 📚 First tell me the chapter or topic you want to revise, and I can help you break it into smaller concepts.`;
      }

      if (lowerText.includes("question")) {
         return `Sure! 📝 I can help you practice ${selectedSubject}. Send me the chapter name and we can work through practice questions step by step.`;
      }

      return `I understand your question about ${selectedSubject}. 🤖 This demo assistant is ready for the UI testing stage. Once we connect the backend AI API, it will be able to generate real subject-specific answers here.`;
   };

   const handleSend = (e) => {
      e.preventDefault();

      const trimmedQuestion = question.trim();

      if (!trimmedQuestion) {
         return;
      }

      const studentMessage = {
         id: Date.now(),
         type: "student",
         text: trimmedQuestion,
      };

      setMessages((previous) => [
         ...previous,
         studentMessage,
      ]);

      setQuestion("");

      setTimeout(() => {
         const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            text: getAIResponse(trimmedQuestion),
         };

         setMessages((previous) => [
            ...previous,
            aiMessage,
         ]);
      }, 600);
   };

   const handleSuggestion = (suggestion) => {
      setQuestion(suggestion);
   };

   return (
      <div className="min-h-screen bg-slate-50">

         {/* =========================================
          HEADER
      ========================================= */}
         <header className="bg-white border-b border-slate-200">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

               <Link
                  to="/student/dashboard"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition mb-3"
               >
                  ← Back to Dashboard
               </Link>

               <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  <div>

                     <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl">
                           🤖
                        </div>

                        <div>
                           <p className="text-sm font-semibold text-blue-600">
                              Student Portal
                           </p>

                           <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                              AI Study Assistant
                           </h1>
                        </div>

                     </div>

                     <p className="text-slate-500 mt-3">
                        Learn concepts, ask questions and revise your subjects.
                     </p>

                  </div>

                  {/* Online Status */}
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3">

                     <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>

                     <div>
                        <p className="text-sm font-semibold text-emerald-700">
                           AI Study Assistant
                        </p>

                        <p className="text-xs text-emerald-600">
                           Ready to help
                        </p>
                     </div>

                  </div>

               </div>

            </div>

         </header>

         {/* =========================================
          MAIN
      ========================================= */}
         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

               {/* =====================================
              LEFT SIDEBAR
          ===================================== */}
               <aside className="lg:col-span-1">

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sticky top-6">

                     <h2 className="font-bold text-slate-900">
                        Choose Subject
                     </h2>

                     <p className="text-xs text-slate-500 mt-1">
                        Select the subject you need help with.
                     </p>

                     <div className="mt-4 space-y-2">

                        {subjects.map((subject) => (

                           <button
                              key={subject}
                              type="button"
                              onClick={() => setSelectedSubject(subject)}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${selectedSubject === subject
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                                 }`}
                           >
                              <span className="mr-2">
                                 {getSubjectIcon(subject)}
                              </span>

                              {subject}

                           </button>

                        ))}

                     </div>

                     {/* Current Subject */}
                     <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">

                        <p className="text-xs text-blue-600 font-semibold uppercase">
                           Current Subject
                        </p>

                        <p className="text-lg font-bold text-blue-900 mt-1">
                           {selectedSubject}
                        </p>

                     </div>

                  </div>

               </aside>

               {/* =====================================
              CHAT AREA
          ===================================== */}
               <section className="lg:col-span-3">

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                     {/* Chat Header */}
                     <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

                        <div>

                           <h2 className="font-bold text-slate-900">
                              Study Chat
                           </h2>

                           <p className="text-xs text-slate-500 mt-1">
                              Subject: {selectedSubject}
                           </p>

                        </div>

                        <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                           AI Tutor
                        </div>

                     </div>

                     {/* Messages */}
                     <div className="h-[500px] overflow-y-auto p-5 sm:p-6 bg-slate-50">

                        <div className="space-y-5">

                           {messages.map((message) => (

                              <div
                                 key={message.id}
                                 className={`flex ${message.type === "student"
                                       ? "justify-end"
                                       : "justify-start"
                                    }`}
                              >

                                 <div
                                    className={`flex gap-3 max-w-[90%] sm:max-w-[75%] ${message.type === "student"
                                          ? "flex-row-reverse"
                                          : ""
                                       }`}
                                 >

                                    {/* Avatar */}
                                    <div
                                       className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${message.type === "student"
                                             ? "bg-slate-700 text-white"
                                             : "bg-blue-600 text-white"
                                          }`}
                                    >
                                       {message.type === "student"
                                          ? "👤"
                                          : "🤖"}
                                    </div>

                                    {/* Message */}
                                    <div>

                                       <div
                                          className={`px-4 py-3 rounded-2xl text-sm leading-6 ${message.type === "student"
                                                ? "bg-blue-600 text-white rounded-tr-sm"
                                                : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                                             }`}
                                       >
                                          {message.text}
                                       </div>

                                       <p
                                          className={`text-[10px] text-slate-400 mt-1 ${message.type === "student"
                                                ? "text-right"
                                                : "text-left"
                                             }`}
                                       >
                                          {message.type === "student"
                                             ? "You"
                                             : "AI Tutor"}
                                       </p>

                                    </div>

                                 </div>

                              </div>

                           ))}

                        </div>

                     </div>

                     {/* Suggestions */}
                     <div className="px-5 sm:px-6 py-4 border-t border-slate-200">

                        <p className="text-xs font-semibold text-slate-500 mb-3">
                           Quick suggestions
                        </p>

                        <div className="flex flex-wrap gap-2">

                           {suggestions.map((suggestion) => (

                              <button
                                 key={suggestion}
                                 type="button"
                                 onClick={() => handleSuggestion(suggestion)}
                                 className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-blue-50 hover:text-blue-700 transition"
                              >
                                 {suggestion}
                              </button>

                           ))}

                        </div>

                     </div>

                     {/* Input */}
                     <form
                        onSubmit={handleSend}
                        className="p-5 sm:p-6 border-t border-slate-200 bg-white"
                     >

                        <div className="flex gap-3">

                           <textarea
                              value={question}
                              onChange={(e) => setQuestion(e.target.value)}
                              placeholder={`Ask a question about ${selectedSubject}...`}
                              rows={2}
                              className="flex-1 resize-none px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />

                           <button
                              type="submit"
                              disabled={!question.trim()}
                              className="self-stretch px-5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                           >
                              Send
                           </button>

                        </div>

                        <p className="text-[11px] text-slate-400 mt-2">
                           Select a subject and ask your study question.
                        </p>

                     </form>

                  </div>

               </section>

            </div>

            {/* =========================================
            FEATURES
        ========================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

               <FeatureCard
                  icon="💡"
                  title="Understand Concepts"
                  description="Get difficult concepts explained in simpler language."
               />

               <FeatureCard
                  icon="📝"
                  title="Practice Questions"
                  description="Use questions to test your understanding."
               />

               <FeatureCard
                  icon="🔄"
                  title="Quick Revision"
                  description="Revise important concepts before your exams."
               />

            </div>

         </main>

      </div>
   );
}


/* =========================================
   SUBJECT ICON
========================================= */

function getSubjectIcon(subject) {
   const icons = {
      General: "📚",
      Mathematics: "📐",
      Science: "🔬",
      English: "📖",
      Hindi: "📝",
      "Social Science": "🌍",
      Computer: "💻",
   };

   return icons[subject] || "📚";
}


/* =========================================
   FEATURE CARD
========================================= */

function FeatureCard({
   icon,
   title,
   description,
}) {
   return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

         <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
            {icon}
         </div>

         <h3 className="font-bold text-slate-900 mt-4">
            {title}
         </h3>

         <p className="text-sm text-slate-500 mt-2 leading-6">
            {description}
         </p>

      </div>
   );
}
