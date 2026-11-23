import { useState } from "react";

export default function StudentAI() {
   const [question, setQuestion] = useState("");

   return (
      <main className="min-h-[70vh] bg-slate-950 px-5 py-20 text-white">

         <div className="mx-auto max-w-4xl">

            <div className="text-center">
               <div className="text-6xl">🤖</div>

               <h1 className="mt-5 text-4xl font-bold">
                  AI Study Assistant
               </h1>

               <p className="mt-4 text-slate-400">
                  Ask questions from your Class 10 or 12 subjects.
               </p>
            </div>

            <div className="mt-12 rounded-3xl bg-white/10 p-5">

               <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-400">s
                     Example
                  </p>

                  <p className="mt-2">
                     Explain photosynthesis in simple language.
                  </p>
               </div>

               <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="mt-5 min-h-40 w-full rounded-2xl bg-white px-5 py-4 text-slate-900 outline-none"
                  placeholder="Type your question..."
               />

               <button
                  className="mt-4 w-full rounded-xl bg-blue-600 px-6 py-3 font-bold hover:bg-blue-500"
               >
                  Ask AI 🤖
               </button>

            </div>

         </div>

      </main>
   );
}