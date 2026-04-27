// src/components/home/HeroBanner.tsx

"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroBannerProps {
  data?: any[];
  settings?: {
    banners?: {
      imageUrl: string;
      link?: string;
      collectionId?: string;
    }[];
  };
}

export const HeroBanner = ({
  data = [],
  settings,
}: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const MIN_SWIPE_DISTANCE = 50;

  const normalizedData = useMemo(() => {
    const rawBanners =
      settings?.banners?.length && settings.banners.length > 0
        ? settings.banners
        : data;

    return rawBanners
      .map((banner: any) => ({
        imageUrl:
          banner.imageUrl ||
          banner.content?.imageUrl ||
          banner.content?.image ||
          "",

        link:
          banner.link ||
          banner.content?.link ||
          banner.content?.url ||
          "",

        altText:
          banner.content?.altText ||
          banner.title ||
          "Hero Banner",
      }))
      .filter((banner) => banner.imageUrl);
  }, [data, settings]);

  const total = normalizedData.length;

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;

    const interval = setInterval(goToNext, 5000);

    return () => clearInterval(interval);
  }, [goToNext, isPaused, total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      setIsPaused(false);
      return;
    }

    const distance =
      touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > MIN_SWIPE_DISTANCE) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  if (!total) return null;

  return (
    <section className="w-full bg-white py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div
          className="group relative overflow-hidden rounded-2xl md:rounded-3xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative h-[180px] sm:h-[260px] md:h-[360px] lg:h-[420px] xl:h-[480px]">
            {normalizedData.map((banner, index) => {
              const href = banner.link?.trim() || "#";

              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentIndex
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Link
                    href={href}
                    className="block h-full w-full"
                    aria-label={`Go to ${banner.altText}`}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.altText}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover object-center"
                        unoptimized
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToPrev();
                }}
                aria-label="Previous slide"
                className="
                  hidden md:flex
                  absolute left-4 top-1/2 -translate-y-1/2 z-20
                  h-10 w-10 items-center justify-center
                  rounded-full bg-white/95 shadow-md backdrop-blur-sm
                  opacity-0 scale-95
                  transition-all duration-300
                  group-hover:opacity-100 group-hover:scale-100
                  hover:scale-110 hover:shadow-lg
                "
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next slide"
                className="
                  hidden md:flex
                  absolute right-4 top-1/2 -translate-y-1/2 z-20
                  h-10 w-10 items-center justify-center
                  rounded-full bg-white/95 shadow-md backdrop-blur-sm
                  opacity-0 scale-95
                  transition-all duration-300
                  group-hover:opacity-100 group-hover:scale-100
                  hover:scale-110 hover:shadow-lg
                "
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {normalizedData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "w-3 h-3 bg-slate-700"
                    : "w-2 h-2 bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};