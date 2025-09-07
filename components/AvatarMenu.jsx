"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, FileSearch, LogOut, ChevronDown } from "lucide-react";

// AvatarMenu (plain JS, no TypeScript)
// Props:
// - userName: string
// - avatarUrl: string (optional)
// - onNavigate: (route: string) => void   // called with 'profile' | 'scans'
// - onLogout: () => void

export default function AvatarMenu({ userName = "User", avatarUrl, onNavigate = () => {}, onLogout = () => {} }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const firstItemRef = useRef(null);
  const itemRefs = useRef([]);

  // Close on outside click / Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    }

    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Focus-first behavior when opening the menu
  useEffect(() => {
    if (open) {
      // small timeout to wait for menu to render / animation
      const t = setTimeout(() => {
        if (firstItemRef.current) {
          firstItemRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(t);
    } else {
      // return focus to button when menu closes
      if (btnRef.current) btnRef.current.focus();
    }
  }, [open]);

  // Keyboard handling for the menu button
  function handleButtonKeyDown(e) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  // Keyboard nav inside menu (ArrowUp/ArrowDown/Enter/Escape)
  function handleMenuKeyDown(e) {
    const currentIndex = itemRefs.current.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIndex + 1) % itemRefs.current.length;
      itemRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (currentIndex - 1 + itemRefs.current.length) % itemRefs.current.length;
      itemRefs.current[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      itemRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      itemRefs.current[itemRefs.current.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  function toggleMenu() {
    setOpen((p) => !p);
  }

  function handleNavigate(which) {
    setOpen(false);
    onNavigate(which);
  }

  function handleLogout() {
    setOpen(false);
    onLogout();
  }

  // utility to set refs for menu items
  function setItemRef(el, idx) {
    itemRefs.current[idx] = el;
    if (idx === 0) firstItemRef.current = el;
  }

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        onClick={toggleMenu}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Open user menu"
      >
        {/* avatar */}
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">{(userName || "U")[0].toUpperCase()}</div>
        )}

        {/* chevron for affordance */}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* animated menu using framer-motion */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 origin-top-right"
            onKeyDown={handleMenuKeyDown}
          >
            <div className="py-2">
              <div className="px-4 py-2 border-b text-sm text-gray-700">
                <div className="font-medium truncate">{userName}</div>
                <div className="text-xs text-gray-500">View account</div>
              </div>

              <button
                ref={(el) => setItemRef(el, 0)}
                onClick={() => handleNavigate("profile")}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Profile</span>
              </button>

              <button
                ref={(el) => setItemRef(el, 1)}
                onClick={() => handleNavigate("scans")}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <FileSearch className="w-4 h-4" />
                <span className="text-sm">My Scans</span>
              </button>

              <div className="mt-2 border-t" />

              <button
                ref={(el) => setItemRef(el, 2)}
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600 focus:bg-gray-50 focus:outline-none"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
Usage example (same as before):

import AvatarMenu from '@/components/AvatarMenu';

<AvatarMenu
  userName={user.displayName}
  avatarUrl={user.photoURL}
  onNavigate={(route) => { if(route === 'profile') router.push('/profile'); if(route === 'scans') router.push('/my-scans'); }}
  onLogout={() => { await signOut(auth); router.push('/'); }}
/>

Features added:
- Keyboard-first focus management: when menu opens the first menu item receives focus; ArrowUp/ArrowDown/Home/End navigate; Escape closes.
- Framer Motion animations for open/close with spring feel.
- Accessible ARIA attributes and focus outlines preserved.
*/
