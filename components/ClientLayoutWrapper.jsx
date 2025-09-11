"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NavItem, Badge } from "@/components/common";
import AIBotWidget from "@/components/AIBotWidget";
import { useAuth } from "@/lib/AuthContext";
import { auth, googleProvider } from "@/lib/firebaseClient";
import { signInWithPopup, signOut } from "firebase/auth";
import AvatarMenu from "@/components/AvatarMenu";
import { MdEmail } from "react-icons/md";
import { FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";



export default function ClientLayoutWrapper({ children }) {
  const router = useRouter();
  const { user } = useAuth();

  const tabs = [
    { key: "home", label: "Home", href: "/" },
    {
      key: "scientific",
      label: "Scientific Content Services",
      href: "/scientific",
      children: [
        { key: "plagiarism-checker", label: "Plagiarism Checker", href: "/plagiarism-checker" }, // fixed path
        { key: "ai-tools", label: "AI Research Tools", href: "/ai-tools" },
      ],
    },
    { key: "tech", label: "Technology & Automation", href: "/tech" },
    { key: "contact", label: "Contact", href: "/contact" },
  ];

  const [active, setActive] = useState("home");
  const [openIndex, setOpenIndex] = useState(null);      // desktop submenu
  const [mobileOpen, setMobileOpen] = useState(false);   // mobile drawer open
  const [mobileOpenIdx, setMobileOpenIdx] = useState(null); // which mobile parent expanded
  const navRef = useRef(null);

  useEffect(() => {
    const path = window.location.pathname.replace("/", "") || "home";
    setActive(path);
  }, []);

  // Close desktop dropdowns on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target)) setOpenIndex(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleNavigation = (key, href) => {
    setActive(key);
    setOpenIndex(null);
    setMobileOpen(false);
    setMobileOpenIdx(null);
    router.push(href);
  };

  const handleParentClick = (hasChildren, idx, key, href) => {
    if (hasChildren) {
      setOpenIndex((cur) => (cur === idx ? null : idx));
    } else {
      handleNavigation(key, href);
    }
  };

  const { displayName, email, photoURL } = user || {};

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/my-scans");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleAvatarNavigate = (route) => {
    if (route === "profile") router.push("/profile");
    else if (route === "scans") router.push("/my-scans");
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left Logo */}
          <div className="flex items-center gap-2">
            <a href="https://www.nerdnestsolutions.in" target="_blank" rel="noopener noreferrer">
              <img src="/LOGO.svg" alt="Logo" className="h-10 w-auto" />
            </a>
            <div>
              <p className="text-sm font-bold tracking-tight">NerdNest Solutions</p>
              <p className="-mt-1 text-[10px] text-slate-500">Science × Technology</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav ref={navRef} className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {tabs.map((t, idx) => {
              const hasChildren = Array.isArray(t.children) && t.children.length > 0;
              return (
                <div key={t.key} className="relative">
                  <button
                    onClick={() => handleParentClick(hasChildren, idx, t.key, t.href)}
                    onMouseEnter={() => hasChildren && setOpenIndex(idx)}
                    onMouseLeave={() => hasChildren && setOpenIndex((cur) => (cur === idx ? null : cur))}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition ${
                      active === t.key ? "text-sky-600" : "text-slate-700 hover:text-slate-900"
                    }`}
                    aria-haspopup={hasChildren ? "true" : undefined}
                    aria-expanded={hasChildren ? (openIndex === idx ? "true" : "false") : undefined}
                  >
                    <NavItem label={t.label} active={active === t.key} />
             {/** {hasChildren && (
                      <svg className=" h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
             ) }*/}      
                  </button>

                  {/* Desktop dropdown (only if children) */}
                  {hasChildren && (
                    <div
                      onMouseEnter={() => setOpenIndex(idx)}
                      onMouseLeave={() => setOpenIndex((cur) => (cur === idx ? null : cur))}
                      className={`absolute left-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transform origin-top transition-all z-50 ${
                        openIndex === idx ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                      }`}
                      role="menu"
                      aria-hidden={openIndex === idx ? "false" : "true"}
                    >
                      <div className="py-2">
                        {t.children.map((c) => (
                          <button
                            key={c.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigation(c.key, c.href);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            role="menuitem"
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right side: Auth + Mobile Trigger */}
          <div className="flex items-center gap-3">
            {!user ? (
              <button
                onClick={handleLogin}
                className="hidden md:inline-block rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:scale-105 hover:shadow-lg transition-transform"
              >
                Login / Signup
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <span className="hidden sm:inline text-sm font-medium text-slate-700">
                  Hi, {displayName?.split(" ")[0] || "User"}
                </span>
                <AvatarMenu userName={displayName || email} avatarUrl={photoURL} onNavigate={handleAvatarNavigate} onLogout={handleLogout} />
              </div>
            )}

            {/* Hamburger for mobile */}
            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-200 bg-white"
            >
              <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
                <div className="flex flex-col divide-y divide-slate-100">
                  {tabs.map((t, idx) => {
                    const hasChildren = Array.isArray(t.children) && t.children.length > 0;
                    const expanded = mobileOpenIdx === idx;
                    return (
                      <div key={t.key} className="py-2">
                        <button
                          className="flex w-full items-center justify-between px-1 py-2 text-left text-sm font-medium text-slate-800"
                          onClick={() => {
                            if (hasChildren) {
                              setMobileOpenIdx(expanded ? null : idx);
                            } else {
                              handleNavigation(t.key, t.href);
                            }
                          }}
                        >
                          <span>{t.label}</span>
                          {hasChildren && (
                            <svg
                              className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>

                        {/* Mobile sub-items */}
                        {hasChildren && expanded && (
                          <div className="mt-1 space-y-1 pl-3">
                            {t.children.map((c) => (
                              <button
                                key={c.key}
                                className="block w-full rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                onClick={() => handleNavigation(c.key, c.href)}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Auth actions inside drawer (mobile) */}
                  {!user ? (
                    <button
                      onClick={handleLogin}
                      className="mt-2 rounded-md bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Login / Signup
                    </button>
                  ) : (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-slate-700">
                        Hi, {displayName?.split(" ")[0] || email}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
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



    <footer className="relative border-t border-slate-800 bg-gradient-to-b from-slate-900 to-black text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        
        {/* Branding */}
        <div>
          <p className="text-xl font-extrabold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
            NerdNest Solutions
          </p>
          <p className="text-sm text-slate-400"> Precision in Word. Power in Code.</p>

         
          <p className="mt-2 text-xs text-slate-500">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6">
          <a
            href="mailto:support@nerdnestsolutions.in"
            aria-label="Email"
            className="rounded-full bg-slate-800 p-3 hover:bg-sky-500 transition transform hover:scale-110"
          >
            <MdEmail className="h-6 w-6 text-slate-300 hover:text-white" />
          </a>
          <a
            href="https://www.instagram.com/wearenerdnest"
            aria-label="Instagram"
            className="rounded-full bg-slate-800 p-3 hover:bg-pink-500 transition transform hover:scale-110"
          >
            <FaInstagram className="h-6 w-6 text-slate-300 hover:text-white" />
          </a>
          <a
            href="https://www.linkedin.com/company/nerdnestsolutions"
            aria-label="LinkedIn"
            className="rounded-full bg-slate-800 p-3 hover:bg-blue-600 transition transform hover:scale-110"
          >
            <FaLinkedin className="h-6 w-6 text-slate-300 hover:text-white" />
          </a>
          <a
            href="https://twitter.com/nerdnestsol"
            aria-label="Twitter"
            className="rounded-full bg-slate-800 p-3 hover:bg-sky-400 transition transform hover:scale-110"
          >
            <FaTwitter className="h-6 w-6 text-slate-300 hover:text-white" />
          </a>
        </div>

       
      </div>
    </footer>

      <AIBotWidget />
    </>
  );
}
