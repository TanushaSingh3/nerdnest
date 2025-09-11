// "use client";

// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Bot, Send } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import Badge from "@/components/ui/badge";

// export default function AIBotWidget() {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       text: "Hi! I'm your Proofreading Assistant. Paste a paragraph to review grammar & citations.",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const endRef = useRef(null);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, open]);

//   function handleSend() {
//     if (!input.trim()) return;
//     const user = { role: "user", text: input.trim() };
//     // Mock response
//     const suggestions = [
//       "Consider replacing passive voice with active voice.",
//       "Ensure units follow SI conventions (e.g., mg/mL).",
//       "Add citation after the claim (Smith et al., 2023).",
//     ];
//     const reply = {
//       role: "assistant",
//       text: `Thanks! I found 2 grammar tweaks and 1 citation suggestion.\n• ${suggestions[0]}\n• ${suggestions[1]}\n• ${suggestions[2]}`,
//     };
//     setMessages((m) => [...m, user, reply]);
//     setInput("");
//   }

//   return (
//     <>
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 12 }}
//             className="fixed bottom-24 right-4 z-50 w-[92vw] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
//           >
//             <div className="flex items-center gap-2 border-b bg-gradient-to-r from-sky-50 to-emerald-50 px-4 py-3">
//               <Bot className="h-5 w-5 text-sky-600" />
//               <p className="text-sm font-semibold text-slate-800">
//                 AI BOT · Proofreading Assistant
//               </p>
//               <Badge>Beta</Badge>
//               <div className="ml-auto text-xs text-slate-500">
//                 Grammar · Citations
//               </div>
//             </div>
//             <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
//               {messages.map((m, i) => (
//                 <div
//                   key={i}
//                   className={`flex ${
//                     m.role === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
//                       m.role === "user"
//                         ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white"
//                         : "bg-slate-50 text-slate-700"
//                     }`}
//                   >
//                     <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
//                   </div>
//                 </div>
//               ))}
//               <div ref={endRef} />
//             </div>
//             <div className="flex items-center gap-2 border-t bg-white p-3">
//               <Input
//                 placeholder="Paste text to proofread…"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
//               />
//               <Button
//                 onClick={handleSend}
//                 className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md hover:from-sky-700 hover:to-emerald-700"
//               >
//                 <Send className="mr-2 h-4 w-4" /> Send
//               </Button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <motion.button
//         onClick={() => setOpen((v) => !v)}
//         initial={{ opacity: 0, y: 24 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="fixed bottom-6 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl hover:from-sky-700 hover:to-emerald-700"
//       >
//         <Bot className="h-5 w-5" /> {open ? "Close Assistant" : "Open AI BOT"}
//       </motion.button>
//     </>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/badge";

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm bg-slate-100 text-slate-700 flex items-center gap-2">
        <span>Finding citation…</span>
        <span className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
        </span>
      </div>
    </div>
  );
}

export default function AIBotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! Paste a DOI, URL, or keyword and I'll generate a citation for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [style, setStyle] = useState("apa");
  const [output, setOutput] = useState("bibliography"); // text or bibtex
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/citation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, style, output }),
      });

      const data = await res.json();
      const reply = {
        role: "assistant",
        text: data.citation || data.error,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Error fetching citation." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-24 right-4 z-50 w-[92vw] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b bg-gradient-to-r from-sky-50 to-emerald-50 px-4 py-3">
              <Bot className="h-5 w-5 text-sky-600" />
              <p className="text-sm font-semibold text-slate-800">
                AI BOT · Citation Generator
              </p>
              <Badge>Beta</Badge>
              <div className="ml-auto text-xs text-slate-500">
                APA · BibTeX
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && <TypingBubble />}

              <div ref={endRef} />
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2 border-t bg-white p-3">
              {/* Input + Send */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter DOI / URL / keyword"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md hover:from-sky-700 hover:to-emerald-700"
                >
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </div>

              {/* Output type */}
              <select
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="bibliography">Text Citation</option>
                <option value="bibtex">BibTeX</option>
              </select>

              {/* Style (only for text citations) */}
              {output === "bibliography" && (
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="apa">APA</option>
                  {/* <option value="mla">MLA</option>
                  <option value="chicago-author-date">
                    Chicago Author-Date
                  </option>
                  <option value="chicago-note-bibliography">
                    Chicago Notes & Bib
                  </option>
                  <option value="harvard1">Harvard</option>
                  <option value="vancouver">Vancouver</option> */}
                </select>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl hover:from-sky-700 hover:to-emerald-700"
      >
        <Bot className="h-5 w-5" />
        {open ? "Close Citation Bot" : "Open Citation Bot"}
      </motion.button>
    </>
  );
}
