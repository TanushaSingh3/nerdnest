"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/lib/AuthContext";

const MAX_CHAR = 2500;

export default function PlagiarismChecker() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef();
  const router = useRouter();

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const clear = () => {
    setText("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !file) {
      alert("Please paste some text or upload a file before submitting.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", text || "");
      if (file) formData.append("file", file);

      const headers = {};
      if (user?.uid) headers.uid = user.uid;

      const response = await fetch("/api/copyleaks/submit", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        let msg = "Submission failed. Try again.";
        try {
          const err = await response.json();
          if (err?.error) msg = err.error;
        } catch (_) {}
        throw new Error(msg);
      }

      if (user) {
        router.push("/my-scans");
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("submit error:", err);
      alert(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10 bg-gradient-to-b from-sky-400/10 via-emerald-200/10 to-emerald-600/10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 text-center sm:text-left">
            ✍️ Write with confidence
          </h1>

          {/* My Scans button (optional, for logged-in users) */}
          {user && (
            <button
              onClick={() => router.push("/my-scans")}
              className="rounded-full px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold hover:scale-105 transition-transform text-sm sm:text-base"
              aria-label="Go to My Scans"
            >
              My Scans
            </button>
          )}
        </div>

        {!submitted && (
          <p className="text-sm sm:text-base text-gray-600 mb-6 text-center sm:text-left">
            Run your text through our fast plagiarism checker and make sure every word is truly yours.
          </p>
        )}

        {/* Input form */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Paste text here..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm sm:text-base focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="px-3 py-1 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 text-xs sm:text-sm">
                  Upload File
                </span>
              </label>
              <span
                className={
                  text.length > MAX_CHAR ? "text-red-500" : "text-gray-500"
                }
              >
                {text.length} / {MAX_CHAR}
              </span>
            </div>

            {file && (
              <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-flex items-center">
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
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full px-5 py-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? "Submitting..." : "Check Plagiarism"}
              </button>

              <button
                type="button"
                onClick={clear}
                className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 text-sm sm:text-base"
              >
                Clear
              </button>
            </div>
          </form>
        )}

        {/* Submitted state */}
        {submitted && (
          <div className="mt-10 text-center space-y-4">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
              ✅ Scan Submitted!
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Your content has been successfully submitted. Results will be ready soon.
            </p>
            <p className="text-sm sm:text-base text-gray-700 font-medium">
              Sign up / log in to view detailed reports and keep your scans.
            </p>

            <div className="flex items-center justify-center gap-3">
              <AuthButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
