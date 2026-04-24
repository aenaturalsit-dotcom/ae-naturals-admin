// src/components/home/HeroBanner.tsx

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroBannerProps {
  data?: any[];
  settings?: {
    banners?: { imageUrl: string; link?: string }[];
  };
}

export const HeroBanner = ({ data = [], settings }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ✅ Normalize once (memoized for performance)
  const normalizedData = useMemo(() => {
    const rawBanners = settings?.banners?.length ? settings.banners : data;

    return rawBanners
      .map((banner: any) => {
        const imgUrl =
          banner.imageUrl ||
          banner.content?.imageUrl ||
          banner.content?.image ||
          "";

        const linkUrl =
          banner.link ||
          banner.content?.link ||
          banner.content?.url ||
          "#";

        return {
          imageUrl: imgUrl,
          link: linkUrl,
          altText:
            banner.content?.altText || banner.title || "Hero banner image",
        };
      })
      .filter((b) => b.imageUrl);
  }, [data, settings]);

  const total = normalizedData.length;

  // ✅ Navigation handlers (stable)
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // ✅ Auto-play (pause on interaction)
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext, total, isPaused]);

  // ✅ Accessibility: keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "ArrowLeft") goToPrev();
  };

  // ✅ Empty state
  if (!total) {
    return (
      <section
        aria-label="Hero Banner Placeholder"
        className="w-full bg-zinc-100"
      >
        <div className="aspect-[4/5] flex items-center justify-center text-zinc-400 text-xs tracking-widest uppercase">
          Upload slides in Admin Panel
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-100"
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero banners"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Slides */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
        {normalizedData.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Link
              href={banner.link}
              aria-label={`Go to slide ${index + 1}`}
              className="block w-full h-full relative"
            >
              <Image
                src={banner.imageUrl}
                alt={banner.altText}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
                unoptimized
              />
            </Link>

            {/* Subtle gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ))}
      </div>

      {/* Controls */}
      {total > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={goToPrev}
            aria-label="Previous slide"
            className="hidden sm:flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 z-10 
              h-10 w-10 rounded-full bg-white/80 backdrop-blur 
              shadow-md hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-black/40"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
            aria-label="Next slide"
            className="hidden sm:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 z-10 
              h-10 w-10 rounded-full bg-white/80 backdrop-blur 
              shadow-md hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-black/40"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
            role="tablist"
            aria-label="Slide navigation"
          >
            {normalizedData.map((_, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full focus:outline-none 
                  ${
                    index === currentIndex
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};