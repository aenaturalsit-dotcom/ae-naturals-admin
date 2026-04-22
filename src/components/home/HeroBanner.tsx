// src\components\home\HeroBanner.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface HeroBannerProps {
  data?: any[]; // Fallback global data
  settings?: {
    banners?: { imageUrl: string; link?: string }[];
    imageUrl?: string; // Fallback for old single-image saves
    title?: string;
  };
}

export const HeroBanner = ({ data = [], settings }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. EXTRACT & NORMALIZE DATA (Prioritizes Admin Builder Settings)
  let normalizedData: { imageUrl: string; link?: string }[] = [];

  if (settings?.banners && settings.banners.length > 0) {
    // New multi-image format from builder
    normalizedData = settings.banners;
  } else if (settings?.imageUrl) {
    // Old single-image format
    normalizedData = [{ imageUrl: settings.imageUrl, link: "#" }];
  } else if (data && data.length > 0) {
    // Fallback to global data payload
    normalizedData = data.map((banner: any) => ({
      imageUrl: banner.imageUrl || banner.content?.imageUrl || banner.content?.image || "",
      link: banner.link || banner.content?.link || banner.content?.url || "#",
    })).filter((b) => b.imageUrl);
  }

  // 2. AUTO-PLAY LOGIC
  useEffect(() => {
    if (!normalizedData.length || normalizedData.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % normalizedData.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [normalizedData.length]);

  // 3. EMPTY STATE (Crucial for Admin Preview when first adding the block)
  if (!normalizedData.length) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-zinc-50 border-2 border-zinc-200 border-dashed flex flex-col items-center justify-center rounded-2xl transition-colors hover:bg-zinc-100">
        <ImageIcon className="w-12 h-12 text-zinc-300 mb-3" />
        <h2 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
          {settings?.title || "Hero Banner (Multi-Image)"}
        </h2>
        <p className="text-xs text-zinc-400 font-medium mt-1">
          Upload slides in the right configuration panel
        </p>
      </div>
    );
  }

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % normalizedData.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + normalizedData.length) % normalizedData.length);

  // 4. ACTUAL CAROUSEL RENDER
  return (
    <section className="relative w-full group overflow-hidden bg-zinc-100 rounded-none md:rounded-2xl shadow-md">
      <div className="relative w-full aspect-[4/5] md:aspect-[21/9] h-[400px] md:h-auto">
        {normalizedData.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* If there's a link, wrap in Link, otherwise just a div */}
            {banner.link && banner.link !== "#" ? (
              <Link href={banner.link} className="block w-full h-full relative">
                <img
                  src={banner.imageUrl}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <div className="w-full h-full relative">
                <img
                  src={banner.imageUrl}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Only show if multiple slides exist) */}
      {normalizedData.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 text-zinc-900 p-2.5 opacity-0 group-hover:opacity-100 hidden md:flex shadow-xl hover:bg-white hover:scale-110 transition-all"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 text-zinc-900 p-2.5 opacity-0 group-hover:opacity-100 hidden md:flex shadow-xl hover:bg-white hover:scale-110 transition-all"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {normalizedData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-white shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                    : "w-2 bg-white/50 hover:bg-white/80 hover:w-4"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};