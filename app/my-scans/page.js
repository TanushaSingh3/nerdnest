// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from "@/lib/AuthContext";
// import AuthButton from "@/components/AuthButton";

// export default function MyScansPage() {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [scans, setScans] = useState([]);

//   useEffect(() => {
//     if (user) {
//       // Simulate fetching scans from DB
//       setTimeout(() => {
//         setScans([
//           { id: "123", title: "Sample Paper 1", status: "Completed" },
//           { id: "124", title: "Thesis Draft", status: "Pending" },
//         ]);
//         setLoading(false);
//       }, 1000);
//     } else {
//       setLoading(false);
//     }
//   }, [user]);

//   return (
//     <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-sky-400/10 via-emerald-200/10 to-emerald-600/10">
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-extrabold text-gray-800">📄 My Scans</h1>
//         </div>

//         {/* Not logged in → ask to log in */}
//         {!user && !loading && (
//           <div className="text-center py-10">
//             <h2 className="text-xl font-bold text-gray-800 mb-3">Login to view your scans</h2>
//             <p className="text-gray-600 mb-6">
//               You need to sign in to access your plagiarism reports.
//             </p>
//             <AuthButton />
//           </div>
//         )}

//         {/* Loading state */}
//         {user && loading && (
//           <p className="text-gray-600">Loading your scans...</p>
//         )}

//         {/* Show scans */}
//         {user && !loading && scans.length > 0 && (
//           <ul className="space-y-4">
//             {scans.map((scan) => (
//               <li
//                 key={scan.id}
//                 className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition"
//               >
//                 <div>
//                   <h2 className="font-semibold text-gray-800">{scan.title}</h2>
//                   <p className="text-sm text-gray-500">Status: {scan.status}</p>
//                 </div>
//                 <button className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:scale-105 transition-transform">
//                   View Report
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}

//         {/* If logged in but no scans */}
//         {user && !loading && scans.length === 0 && (
//           <p className="text-gray-600">No scans found. Try running a plagiarism check!</p>
//         )}
//       </div>
//     </div>
//   );
// }

// File: app/history/page.jsx
// Next.js page (Client Component) with Firebase Auth & Firestore

// File: app/history/page.jsx
// Next.js page (Client Component) with Firebase Auth & Firestore

// File: app/history/page.jsx
// Next.js Client Component - Fetches scans via API (API uses firebase-admin)

// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from "@/lib/AuthContext";
// import AuthButton from "@/components/AuthButton";
// import { CheckCircle, Clock, FileDown } from "lucide-react";

// export default function HistoryPage() {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [scans, setScans] = useState([]);
//   const [expanded, setExpanded] = useState(null);

//   useEffect(() => {
//     if (!user) {
//       setLoading(false);
//       return;
//     }

//     async function fetchScans() {
//       try {
//         const res = await fetch(`/api/history?userId=${user.uid}`);
//         const data = await res.json();
//         setScans(data.submissions || []);
//       } catch (err) {
//         console.error("Error fetching scans:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchScans();
//   }, [user]);

//   return (
//     <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-sky-400/10 via-emerald-200/10 to-emerald-600/10">
//       <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-extrabold text-gray-800">📄 My Scans</h1>
//         </div>

//         {!user && !loading && (
//           <div className="text-center py-10">
//             <h2 className="text-xl font-bold text-gray-800 mb-3">Login to view your scans</h2>
//             <p className="text-gray-600 mb-6">You need to sign in to access your plagiarism reports.</p>
//             <AuthButton />
//           </div>
//         )}

//         {user && loading && <p className="text-gray-600">Loading your scans...</p>}

//         {user && !loading && scans.length > 0 && (
//           <ul className="grid gap-6 sm:grid-cols-2">
//             {scans.map((scan) => (
//               <li
//                 key={scan.id}
//                 className="bg-gray-50 border rounded-xl shadow hover:shadow-md transition overflow-hidden"
//               >
//                 <div className="p-4 flex justify-between items-start">
//                   <div>
//                     <h2 className="font-semibold text-gray-800 mb-1">Scan {scan.id}</h2>
//                     <p className="text-sm text-gray-500 mb-1">Plagiarism: {scan.plagiarismScore || "N/A"}</p>
//                     <p className="text-sm text-gray-500">AI: {aiScoreShort(scan.aiContentDetection)}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {scan.status === "pending" ? (
//                       <Clock className="text-yellow-600 w-5 h-5" />
//                     ) : (
//                       <CheckCircle className="text-green-600 w-5 h-5" />
//                     )}
//                     <button
//                       onClick={() => setExpanded(expanded === scan.id ? null : scan.id)}
//                       className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:scale-105 transition-transform"
//                     >
//                       {expanded === scan.id ? "Hide" : "View"}
//                     </button>
//                   </div>
//                 </div>

//                 {expanded === scan.id && (
//                   <div className="p-4 border-t space-y-3 bg-white">
//                     <div>
//                       <h3 className="text-sm font-semibold text-gray-700 mb-1">Sources</h3>
//                       {scan.sources && scan.sources.length > 0 ? (
//                         <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
//                           {scan.sources.map((src, i) => (
//                             <li key={i}>{src}</li>
//                           ))}
//                         </ul>
//                       ) : (
//                         <p className="text-sm text-gray-500">No sources found</p>
//                       )}
//                     </div>

//                     <div>
//                       <h3 className="text-sm font-semibold text-gray-700 mb-1">Writing Feedback</h3>
//                       <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded whitespace-pre-wrap">
//                         {scan.writingAssistant || "No feedback"}
//                       </pre>
//                     </div>

//                     <div className="flex justify-end gap-3">
//                       <a
//                         href={`/api/submission-report?submissionId=${encodeURIComponent(scan.id)}`}
//                         className="flex items-center gap-2 px-4 py-2 text-sm rounded bg-white border hover:bg-gray-50"
//                       >
//                         <FileDown className="w-4 h-4" /> Download Report
//                       </a>
//                     </div>
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}

//         {user && !loading && scans.length === 0 && (
//           <p className="text-gray-600">No scans found. Try running a plagiarism check!</p>
//         )}
//       </div>
//     </div>
//   );
// }

// function aiScoreShort(aiText) {
//   if (!aiText) return "N/A";
//   const pct = aiText.match(/(\d+)%/);
//   if (pct) return pct[1] + "%";
//   if (/human/i.test(aiText)) return "Human";
//   return aiText;
// }

// File: app/history/page.jsx
// Next.js Client Component - Fetches scans via API (API uses firebase-admin)

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import AuthButton from "@/components/AuthButton";
import { CheckCircle, Clock, ShieldCheck, FileDown, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchScans() {
      try {
        const res = await fetch(`/api/history?userId=${user.uid}`);
        const data = await res.json();
        setScans(data.submissions || []);
      } catch (err) {
        console.error("Error fetching scans:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchScans();
  }, [user]);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10 bg-gradient-to-b from-sky-400/10 via-emerald-200/10 to-emerald-600/10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800">
            📄 My Scans
          </h1>
          <a
            href="/plagiarism-checker"
            className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow hover:scale-105 transition-transform text-sm sm:text-base"
          >
            Fresh Scan
          </a>
        </div>
  
        {/* Login Prompt */}
        {!user && !loading && (
          <div className="text-center py-6 sm:py-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
              Login to view your scans
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              You need to sign in to access your plagiarism reports.
            </p>
            <AuthButton />
          </div>
        )}
      
  
  

  { user && loading && <p className="text-gray-600">Loading your scans...</p> }

  {
    user && !loading && scans.length > 0 && (
      <ul className="grid gap-6 sm:grid-cols-1">
        {scans.map((scan) => (
          <li
            key={scan.id}
            className="bg-gray-50 border rounded-xl shadow hover:shadow-md transition overflow-hidden"
          >


            <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h2 className="font-semibold text-gray-800 mb-1">Scan: {scan.fileName}</h2>
                <p className="text-sm text-gray-500 mb-1">Plagiarism: {scan.plagiarismScore || "N/A"}</p>
                <p className="text-sm text-gray-500">AI: {aiScoreShort(scan.aiContentDetection)}</p>
              </div>
              <div className="flex items-center gap-2 sm:self-end">
                {scan.status === "pending" ? (
                  <Clock className="text-yellow-600 w-5 h-5" />
                ) : (
                  <CheckCircle className="text-green-600 w-5 h-5" />
                )}
                <button
                  onClick={() => {
                    if (scan.status === "completed") {
                      setExpanded(expanded === scan.id ? null : scan.id);
                    }
                  }}
                  disabled={scan.status !== "completed"}
                  className={`px-3 py-1 text-sm rounded-full transition-transform
    ${scan.status === "completed"
                      ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  {expanded === scan.id ? "Hide" : "View More"}
                </button>

              </div>
            </div>


            {expanded === scan.id && <ExpandedCard submission={scan}
            />}
          </li>
        ))}
      </ul>
    )
  }

  {
    user && !loading && scans.length === 0 && (
      <p className="text-gray-600">No scans found. Try running a plagiarism check!</p>
    )
  }
      </div >
    </div >
  );
}

function ExpandedCard({ submission }) {
  async function handleDownload() {
    const res = await fetch(`/api/submission-report?submissionId=${submission.id}`);
    const data = await res.json();
    if (data.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-lg mt-4">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 to-emerald-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            <p className="text-sm font-semibold text-slate-800">Originality Dashboard</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-slate-200"
            onClick={handleDownload}
          >
            <FileDown className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Plagiarism</p>
            <p className="mt-1 text-3xl font-bold text-sky-700">{submission.plagiarismScore || "N/A"}</p>
            <p className="mt-1 text-xs text-slate-500">Similarity analysis</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">AI Detection</p>
            <p className="mt-1 text-3xl font-bold text-emerald-700">{aiScoreShort(submission.aiContentDetection)}</p>
            <p className="mt-1 text-xs text-slate-500">Authorship probability</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Sources Found</p>
            <p className="mt-1 text-3xl font-bold text-slate-800">{submission.sources?.length || 0}</p>
            <p className="mt-1 text-xs text-slate-500">References detected</p>
          </div>

          {/* Detailed section */}
          <div className="col-span-1 md:col-span-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600">Sources</p>
              {submission.sources && submission.sources.length > 0 ? (
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {submission.sources.map((src, i) => (
                    <li key={i}>{src}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No sources found</p>
              )}

              <p className="text-xs font-semibold text-slate-600 mt-4">Writing Feedback</p>
              <pre className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                {submission.writingAssistant || "No feedback available"}
              </pre>


            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function aiScoreShort(aiText) {
  if (!aiText) return "N/A";
  const pct = aiText.match(/(\d+)%/);
  if (pct) return pct[1] + "%";
  if (/human/i.test(aiText)) return "Human";
  return aiText;
}
