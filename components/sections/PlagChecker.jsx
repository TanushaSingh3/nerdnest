"use client";

import { useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PlagChecker() {
  const [text, setText] = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const [results, setResults] = useState(null);
  const reportRef = useRef(null);

  const handleSubmit = async () => {
    setResults(null);
    const res = await axios.post("/api/copyleaks/submit", { text });
    setSubmissionId(res.data.submissionId);

    const interval = setInterval(async () => {
      try {
        const resultRes = await axios.get(
          `/api/copyleaks/results/${res.data.submissionId}`
        );
        setResults(resultRes.data);
        clearInterval(interval);
      } catch {
        console.log("Waiting for results...");
      }
    }, 5000);
  };

  // Multi-page PDF export
  const downloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("Plagiarism-Report.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">
        Plagiarism Checker
      </h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded p-2 focus:ring focus:ring-blue-300"
        placeholder="Paste your text here..."
        rows={6}
      />

      <button
        onClick={handleSubmit}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Check Plagiarism
      </button>

      {submissionId && !results && (
        <p className="mt-4 text-gray-600 animate-pulse">
          Checking... please wait
        </p>
      )}

      {results && (
        <div>
          <div
            ref={reportRef}
            className="mt-6 bg-gray-50 p-5 rounded-lg shadow"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Plagiarism Report
            </h2>

            {/* Summary */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 rounded bg-red-100 text-red-600 font-bold">
                {results?.summary?.plagiarismPercent || 0}% Plagiarised
              </div>
              <div className="p-4 rounded bg-green-100 text-green-600 font-bold">
                {results?.summary?.originalPercent || 100}% Original
              </div>
            </div>

            {/* Matches */}
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Matched Sources
            </h3>
            <div className="space-y-6">
              {results?.results?.map((match, i) => (
                <div
                  key={i}
                  className="border p-4 rounded bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <a
                      href={match.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Source {i + 1}: {match.url}
                    </a>
                    <span className="text-orange-600 font-medium">
                      {match.similarity}% Similar
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded bg-gray-50">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Your Submission
                      </h4>
                      <p className="text-sm leading-relaxed">
                        <span className="bg-red-100 text-red-700 px-1 rounded">
                          {match.text}
                        </span>
                      </p>
                    </div>
                    <div className="p-3 border rounded bg-gray-50">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Source Match
                      </h4>
                      <p className="text-sm leading-relaxed">
                        <span className="bg-green-100 text-green-700 px-1 rounded">
                          {match.sourceText}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PDF download */}
          <button
            onClick={downloadPDF}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Download Report as PDF
          </button>
        </div>
      )}
    </div>
  );
}
