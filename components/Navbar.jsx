"use client";
import React from "react";

const navItems = [
  { label: "Home", id: "hero" },
  { label: "Scientific", id: "scientific" },
  { label: "AI Tools", id: "ai-tools" },
  { label: "Tech", id: "tech" },
  { label: "Contact", id: "contact" },
];

export default function Navbar() {
  // handle smooth scroll
  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <h1 className="font-bold text-sky-600">NerdNest</h1>
        <ul className="flex gap-6 text-sm font-medium text-slate-700">
          {navItems.map((item) => (
            <li
              key={item.id}
              className="cursor-pointer hover:text-sky-600 transition-colors"
              onClick={() => handleScroll(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
