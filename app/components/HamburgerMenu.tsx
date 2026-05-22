"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Language } from "@/lib/translations";

type Props = {
  lang: Language;
  isHe: boolean;
  user: { id: string } | null;
  unreadCount: number;
  myAccount: string;
  createListing: string;
  signIn: string;
};

export default function HamburgerMenu({
  lang,
  isHe,
  user,
  unreadCount,
  myAccount,
  createListing,
  signIn,
}: Props) {
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  // Close on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const linkClass = "flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-gray-800 transition hover:bg-teal-50 hover:text-teal-700";

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition hover:bg-white"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Sliding panel */}
      <div
        className={`fixed top-0 z-50 flex h-full w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isHe ? "left-0" : "right-0"
        } ${open ? "translate-x-0" : isHe ? "-translate-x-full" : "translate-x-full"}`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
          <span className="text-xl font-bold text-gray-900">Sub4U</span>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Language toggle */}
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {isHe ? "שפה" : "Language"}
          </p>
          <div className="flex overflow-hidden rounded-full border border-gray-200 text-sm font-semibold w-fit">
            <a href="?lang=en" className={`px-5 py-2 transition ${lang === "en" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}>ENG</a>
            <div className="w-px bg-gray-200" />
            <a href="?lang=he" className={`px-5 py-2 transition ${lang === "he" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}>עבר</a>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {user ? (
            <>
              

              <a href={`/my-account?lang=${lang}`} onClick={() => setOpen(false)} className={linkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {myAccount}
              </a>

              <a href={`/create-listing?lang=${lang}`} onClick={() => setOpen(false)} className={linkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {createListing}
              </a>

              <a href={`/about?lang=${lang}`} onClick={() => setOpen(false)} className={linkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                {isHe ? "אודות" : "About"}
              </a>

              <a href={`/contact?lang=${lang}`} onClick={() => setOpen(false)} className={linkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {isHe ? "צור קשר" : "Contact"}
              </a>
            </>
          ) : (
            <>
              <a href={`/sign-in?lang=${lang}&mode=signin`} onClick={() => setOpen(false)} className={linkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                {signIn}
              </a>

              <a href={`/about?lang=${lang}`} onClick={() => setOpen(false)} className={linkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                {isHe ? "אודות" : "About"}
              </a>

              <a href={`/contact?lang=${lang}`} onClick={() => setOpen(false)} className={linkClass}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {isHe ? "צור קשר" : "Contact"}
              </a>
            </>
          )}
        </nav>

        {/* Sign out at bottom */}
        {user && (
          <div className="border-t border-gray-100 px-3 py-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium text-red-500 transition hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {isHe ? "התנתקות" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}