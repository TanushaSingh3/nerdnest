// components/ClientLayoutWrapper.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NavItem, Badge } from "@/components/common";
import AIBotWidget from "@/components/AIBotWidget";

export default function ClientLayoutWrapper({ children }) {
  const router = useRouter();

  const tabs = [
    { key: "home", label: "Home", href: "/" },
    { key: "scientific", label: "Scientific Content Services", href: "/scientific" },
    { key: "ai-tools", label: "AI Research Tools", href: "/ai-tools" },
    { key: "tech", label: "Technology & Automation", href: "/tech" },
    { key: "contact", label: "Contact", href: "/contact" },
  ];

  const [active, setActive] = useState("home");

  useEffect(() => {
    const path = window.location.pathname.replace("/", "") || "home";
    setActive(path);
  }, []);

  const handleNavigation = (key, href) => {
    setActive(key);
    router.push(href); // ✅ client-side navigation
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
          {/* <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 shadow-md" />*/}  
            <div>
            <a href="https://www.nerdnestsolutions.in" target="_blank" rel="noopener noreferrer">
      <img
        src="/LOGO.svg"
        alt="Logo"
        className="h-8 w-auto"
      />
    </a>

            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">NerdNest Solutions</p>
              <p className="-mt-1 text-[10px] text-slate-500">Science × Technology</p>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => handleNavigation(t.key, t.href)}
              >
                <NavItem label={t.label} active={active === t.key} />
              </button>
            ))}
          </nav>
          <div className="md:hidden">
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={active}
              onChange={(e) => {
                const key = e.target.value;
                const href = key === "home" ? "/" : `/${key}`;
                handleNavigation(key, href);
              }}
            >
              {tabs.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Page content with animation */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} NerdNest Solutions. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Inter · Lato · Source Sans</Badge>
            <Badge>Tailwind · shadcn/ui · Framer Motion</Badge>
          </div>
        </div>
      </footer>

      {/* Floating AI Bot */}
      <AIBotWidget />
    </>
  );
}
