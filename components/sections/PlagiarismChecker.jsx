"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/lib/AuthContext";

const MAX_CHAR = 150;

export default function PlagiarismChecker() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef();
  const router = useRouter();

  // ✅ If logged in, go directly to /my-scans
//   useEffect(() => {
//     if (user) {
//       router.replace("/my-scans");
//     }
//   }, [user, router]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const clear = () => {
    setText("");
    setFile(null);
    fileInputRef.current && (fileInputRef.current.value = "");
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API submission
      
      const res = await fetch("/api/copyleaks/submit", 
        { method: "POST", body: JSON.stringify({text}),headers:{'uid':user.uid} });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-sky-400/10 via-emerald-200/10 to-emerald-600/10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-center items-center  mb-6 ">
          <h1 className="text-3xl font-extrabold text-gray-800">Plagiarism Checker</h1>
        </div>

        {!submitted && (<p className="text-gray-600 mb-6">
          Paste up to <strong>{MAX_CHAR} characters</strong> or upload a file.{" "}
          For longer content, please{" "}
          <span className="text-emerald-600 font-medium">create an account</span>.
        </p>)}

        {/* Input form */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Paste text here..."
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-between text-sm text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="px-3 py-1 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200">
                  Upload File
                </span>
              </label>
              <span
                className={text.length > MAX_CHAR ? "text-red-500" : "text-gray-500"}
              >
                {text.length} / {MAX_CHAR}
              </span>
            </div>

            {file && (
              <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                {file.name} • {(file.size / 1024).toFixed(1)} KB
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-2 text-red-500"
                >
                  ✕
                </button>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full px-6 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Check Plagiarism"}
              </button>

              <button
                type="button"
                onClick={clear}
                className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </form>
        )}

        {/* Submitted state */}
        {submitted && (
          <div className="mt-10 text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">✅ Scan Submitted!</h2>
            <p className="text-gray-600">
              Your content has been successfully submitted. Results will be ready soon.
            </p>
            <p className="text-gray-700 font-medium">
              Please login/signup to view your detailed reports.
            </p>
            <AuthButton />
          </div>
        )}
      </div>
    </div>
  );
}
