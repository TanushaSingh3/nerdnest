"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

// 🎨 Source-based colors
const COLORS = [
  { bg: [255, 255, 0], text: [200, 0, 0] },     // yellow/red
  { bg: [144, 238, 144], text: [0, 100, 0] },   // lightgreen/darkgreen
  { bg: [173, 216, 230], text: [0, 0, 200] },   // lightblue/blue
  { bg: [255, 182, 193], text: [200, 0, 100] }, // pink/magenta
];

// ✅ Highlight fragments with colors per source
const highlightText = (text, fragments = [], colorIndex = 0) => {
  if (!fragments || fragments.length === 0) return text;

  let parts = [text];
  fragments.forEach((frag) => {
    const regex = new RegExp(`(${frag.text})`, "gi");
    parts = parts.flatMap((p) =>
      typeof p === "string"
        ? p.split(regex).map((piece, i) =>
            regex.test(piece) ? (
              <span
                key={i}
                style={{
                  backgroundColor: `rgb(${COLORS[colorIndex % COLORS.length].bg.join(",")})`,
                  color: `rgb(${COLORS[colorIndex % COLORS.length].text.join(",")})`,
                  fontWeight: "bold",
                }}
              >
                {piece}
              </span>
            ) : (
              piece
            )
          )
        : [p]
    );
  });

  return parts;
};

export default function ResultsPage() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("/api/copyleaks/results/1756930596797");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("❌ Failed to fetch results:", err);
      }
    };
    fetchResults();
  }, []);

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading plagiarism results...
      </div>
    );
  }

  // ✅ Normalize results into an array
  const matches = Array.isArray(results.results)
    ? results.results
    : results.results
    ? [results.results]
    : [];

  // ✅ Download PDF with highlights + multiple colors
  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("helvetica", "normal");

    doc.setFontSize(18);
    doc.text("Plagiarism Report", 40, 40);

    doc.setFontSize(10);
    doc.text(`Total Words: ${results.scannedDocument?.totalWords || "-"}`, 40, 70);
    doc.text(`Total Characters: ${results.scannedDocument?.totalChars || "-"}`, 40, 85);
    doc.text(`Credits Used: ${results.scannedDocument?.credits || "-"}`, 40, 100);

    let y = 130;
    matches.forEach((r, idx) => {
      const colorIndex = idx % COLORS.length;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 200);
      doc.textWithLink(r.source?.title || "Unknown Source", 40, y, {
        url: r.source?.url || "",
      });

      // ✅ Handle score object safely
      doc.setTextColor(255, 0, 0);
      if (typeof r.score === "object") {
        doc.text(`Overall: ${r.score.aggregatedScore ?? 0}%`, 400, y);
      } else {
        doc.text(`${r.score || 0}% Match`, 400, y);
      }

      y += 20;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Your Text:", 40, y);

      let words = r.text.split(" ");
      let x = 120;
      y += 15;

      words.forEach((w) => {
        let isMatch = r.fragments?.some((frag) =>
          w.toLowerCase().includes(frag.text.toLowerCase())
        );

        const width = doc.getTextWidth(w + " ");
        if (isMatch) {
          const { bg, text } = COLORS[colorIndex];
          doc.setFillColor(...bg);
          doc.rect(x - 2, y - 10, width + 4, 14, "F");
          doc.setTextColor(...text);
          doc.text(w, x, y);
        } else {
          doc.setTextColor(0, 0, 0);
          doc.text(w, x, y);
        }
        x += width;
      });

      y += 25;
      doc.setTextColor(0, 0, 0);
      doc.text("Matched Fragments:", 40, y);

      r.fragments?.forEach((frag) => {
        y += 15;
        doc.text(`- ${frag.text}`, 60, y, { maxWidth: 400 });
      });

      y += 40;
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    });

    doc.save("plagiarism-report.pdf");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Plagiarism Results</h1>

      <div className="mb-6">
        <p>Total Words: {results.scannedDocument?.totalWords || "-"}</p>
        <p>Total Characters: {results.scannedDocument?.totalChars || "-"}</p>
        <p>Credits Used: {results.scannedDocument?.credits || "-"}</p>
      </div>

      {matches.length === 0 ? (
        <p className="text-gray-600">No plagiarism detected ✅</p>
      ) : (
        matches.map((r, idx) => (
          <div key={idx} className="mb-8 p-4 border rounded shadow bg-white">
            <h2 className="text-lg font-semibold text-blue-600">
              {r.source?.title || "Unknown Source"}
            </h2>
            <p className="text-sm text-gray-500">
              <a
                href={r.source?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {r.source?.url || "No URL"}
              </a>
            </p>

            {/* ✅ Score handling */}
            <div className="mt-2">
              <strong>Match Score:</strong>{" "}
              {typeof r.score === "object" ? (
                <div className="ml-4 text-sm text-gray-700">
                  <p>Identical Words: {r.score.identicalWords ?? 0}</p>
                  <p>Minor Changes: {r.score.minorChangedWords ?? 0}</p>
                  <p>Related Meaning: {r.score.relatedMeaningWords ?? 0}</p>
                  <p>
                    <strong>Overall: {r.score.aggregatedScore ?? 0}%</strong>
                  </p>
                </div>
              ) : (
                `${r.score || 0}%`
              )}
            </div>

            <div className="mt-4 leading-relaxed">
              {highlightText(r.text, r.fragments, idx)}
            </div>
          </div>
        ))
      )}

      <button
        onClick={downloadPDF}
        className="mt-6 px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
      >
        Download PDF
      </button>
    </div>
  );
}
