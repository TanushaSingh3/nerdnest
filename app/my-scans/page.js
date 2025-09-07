"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import AuthButton from "@/components/AuthButton";

export default function MyScansPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);

  useEffect(() => {
    if (user) {
      // Simulate fetching scans from DB
      setTimeout(() => {
        setScans([
          { id: "123", title: "Sample Paper 1", status: "Completed" },
          { id: "124", title: "Thesis Draft", status: "Pending" },
        ]);
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-sky-400/10 via-emerald-200/10 to-emerald-600/10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">📄 My Scans</h1>
        </div>

        {/* Not logged in → ask to log in */}
        {!user && !loading && (
          <div className="text-center py-10">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Login to view your scans</h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to access your plagiarism reports.
            </p>
            <AuthButton />
          </div>
        )}

        {/* Loading state */}
        {user && loading && (
          <p className="text-gray-600">Loading your scans...</p>
        )}

        {/* Show scans */}
        {user && !loading && scans.length > 0 && (
          <ul className="space-y-4">
            {scans.map((scan) => (
              <li
                key={scan.id}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{scan.title}</h2>
                  <p className="text-sm text-gray-500">Status: {scan.status}</p>
                </div>
                <button className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:scale-105 transition-transform">
                  View Report
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* If logged in but no scans */}
        {user && !loading && scans.length === 0 && (
          <p className="text-gray-600">No scans found. Try running a plagiarism check!</p>
        )}
      </div>
    </div>
  );
}
