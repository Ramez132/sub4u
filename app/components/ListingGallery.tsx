"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  images: string[];
  title: string;
};

export default function ListingGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sliding, setSliding] = useState<"left" | "right" | null>(null);
  const [displayed, setDisplayed] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="h-72 w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No images available</p>
      </div>
    );
  }

  const goTo = (index: number, direction: "left" | "right") => {
    if (sliding) return;
    setSliding(direction);
    setActiveIndex(index);
    setTimeout(() => { setDisplayed(index); setSliding(null); }, 300);
  };

  const prev = () => goTo(activeIndex === 0 ? images.length - 1 : activeIndex - 1, "right");
  const next = () => goTo(activeIndex === images.length - 1 ? 0 : activeIndex + 1, "left");

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, activeIndex, sliding]);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
  };

  const activeDisplay = sliding ? activeIndex : displayed;

  return (
    <>
      <style>{`
        @keyframes lb-slide-left { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes lb-slide-right { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Main gallery */}
      <div className="relative w-full bg-gray-900" style={{ height: "480px" }}>
        <img
          src={images[activeDisplay]}
          alt={`${title} - ${activeDisplay + 1}`}
          className="h-full w-full object-cover cursor-zoom-in opacity-95"
          onClick={() => setLightboxOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {/* Dark gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition hover:bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
          {activeDisplay + 1} / {images.length}
        </div>

        {/* View all button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-800 shadow transition hover:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
          View all {images.length} photos
        </button>

        {/* Dots */}
        {images.length > 1 && images.length <= 10 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > activeDisplay ? "left" : "right")}
                className={`rounded-full transition-all duration-300 ${i === activeDisplay ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-gray-900 px-4 pb-3 pt-2 scrollbar-hide">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > activeDisplay ? "left" : "right")}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                i === activeDisplay
                  ? "ring-2 ring-teal-400 ring-offset-1 ring-offset-gray-900 opacity-100"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <img src={url} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Lightbox header */}
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-sm font-medium text-white/70">{title}</p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">{activeDisplay + 1} / {images.length}</span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Main lightbox image */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
            {/* Outgoing */}
            <img
              src={images[displayed]}
              alt={`${title} - ${displayed + 1}`}
              className="absolute max-h-full max-w-full rounded-lg object-contain select-none"
              style={{
                transform: sliding === "left" ? "translateX(-100%)" : sliding === "right" ? "translateX(100%)" : "translateX(0)",
                opacity: sliding ? 0 : 1,
                transition: sliding ? "transform 300ms ease-in-out, opacity 300ms" : "none",
              }}
            />
            {/* Incoming */}
            {sliding && (
              <img
                src={images[activeIndex]}
                alt={`${title} - ${activeIndex + 1}`}
                className="absolute max-h-full max-w-full rounded-lg object-contain select-none"
                style={{ animation: `lb-slide-${sliding} 300ms ease-in-out forwards` }}
              />
            )}

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button onClick={next} className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > activeDisplay ? "left" : "right")}
                  className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                    i === activeDisplay ? "ring-2 ring-teal-400 ring-offset-1 ring-offset-black opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}