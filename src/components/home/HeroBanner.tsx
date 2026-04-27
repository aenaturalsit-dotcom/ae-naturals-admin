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
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

interface HeroBannerItem {
  imageUrl: string;
  link?: string;
  collectionId?: string;
  altText?: string;
}

interface HeroBannerProps {
  data?: any[];
  previewMode?: boolean;
  settings?: {
    autoplay?: boolean;
    autoplayDelay?: number;
    banners?: HeroBannerItem[];
  };
}

const MIN_SWIPE_DISTANCE = 50;
const DEFAULT_AUTO_SLIDE_INTERVAL = 5000;

export const HeroBanner = ({
  data = [],
  settings,
  previewMode = false,
}: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  /**
   * Normalize data from builder/backend
   */
  const banners = useMemo(() => {
    const source =
      settings?.banners?.length && settings.banners.length > 0
        ? settings.banners
        : data;

    return source
      .map((banner: any) => ({
        imageUrl:
          banner?.imageUrl ||
          banner?.content?.imageUrl ||
          banner?.content?.image ||
          "",
        link:
          banner?.link ||
          banner?.content?.link ||
          banner?.content?.url ||
          "",
        collectionId:
          banner?.collectionId ||
          banner?.content?.collectionId ||
          "",
        altText:
          banner?.altText ||
          banner?.content?.altText ||
          banner?.title ||
          "Hero Banner",
      }))
      .filter((banner: HeroBannerItem) => Boolean(banner.imageUrl));
  }, [data, settings]);

  const totalSlides = banners.length;

  /**
   * Safe autoplay config
   */
  const autoplayEnabled = settings?.autoplay ?? true;
  const autoplayDelay =
    settings?.autoplayDelay ?? DEFAULT_AUTO_SLIDE_INTERVAL;

  /**
   * Navigation
   */
  const goToNext = useCallback(() => {
    if (totalSlides <= 1) return;

    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    if (totalSlides <= 1) return;

    setCurrentIndex((prev) => {
      if (prev === 0) return totalSlides - 1;
      return prev - 1;
    });
  }, [totalSlides]);

  /**
   * Autoplay
   */
  useEffect(() => {
    if (!autoplayEnabled) return;
    if (isPaused) return;
    if (totalSlides <= 1) return;

    const timer = setInterval(goToNext, autoplayDelay);

    return () => clearInterval(timer);
  }, [
    autoplayEnabled,
    autoplayDelay,
    isPaused,
    totalSlides,
    goToNext,
  ]);

  /**
   * Keep index valid after config changes
   */
  useEffect(() => {
    if (currentIndex >= totalSlides) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalSlides]);

  /**
   * Touch gestures
   */
  const resetTouchState = () => {
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

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
      resetTouchState();
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

    resetTouchState();
  };

  /**
   * Empty state (important for builder preview)
   */
  if (!totalSlides) {
    if (!previewMode) return null;

    return (
      <section className="w-full bg-gradient-to-b from-zinc-50 via-white to-zinc-100">
        <div className="aspect-[4/5] md:aspect-[16/7] w-full flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-lg rounded-[32px] border-2 border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
              <ImageIcon className="h-8 w-8 text-zinc-400" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900">
              Hero Banner Section
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Add hero banners from the configuration panel to
              preview them here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-white">
      <div
        className="group relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        <div className="relative aspect-[4/5] sm:aspect-[4/3] md:aspect-[16/8] lg:aspect-[16/7] xl:aspect-[16/6] w-full">
          {banners.map((banner, index) => {
            const isActive = index === currentIndex;

            const href =
              banner.link?.trim() ||
              (banner.collectionId
                ? `/collections/${banner.collectionId}`
                : "#");

            return (
              <div
                key={`${banner.imageUrl}-${index}`}
                className={`
                  absolute inset-0 transition-opacity duration-500
                  ${
                    isActive
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0 pointer-events-none"
                  }
                `}
              >
                <Link
                  href={href}
                  draggable={false}
                  className="block h-full w-full"
                  aria-label={banner.altText || "Hero Banner"}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.altText || "Hero Banner"}
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

        {/* Desktop arrows */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToPrev();
              }}
              className="
                absolute left-4 top-1/2 z-20 hidden md:flex
                -translate-y-1/2 h-11 w-11 items-center justify-center
                rounded-full bg-white/90 backdrop-blur-md shadow-lg
                opacity-0 scale-95 transition-all duration-300
                group-hover:opacity-100 group-hover:scale-100
              "
              aria-label="Previous Slide"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToNext();
              }}
              className="
                absolute right-4 top-1/2 z-20 hidden md:flex
                -translate-y-1/2 h-11 w-11 items-center justify-center
                rounded-full bg-white/90 backdrop-blur-md shadow-lg
                opacity-0 scale-95 transition-all duration-300
                group-hover:opacity-100 group-hover:scale-100
              "
              aria-label="Next Slide"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dots */}
        {totalSlides > 1 && (
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 backdrop-blur-md px-3 py-2">
            {banners.map((_, index) => {
              const active = index === currentIndex;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`
                    rounded-full transition-all duration-300
                    ${
                      active
                        ? "w-6 h-2 bg-white"
                        : "w-2 h-2 bg-white/60"
                    }
                  `}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;