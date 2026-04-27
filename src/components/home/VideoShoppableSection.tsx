"use client";

import React, {
  useEffect,
  useRef,
  useMemo,
} from "react";
import Link from "next/link";
import {
  Play,
  ShoppingBag,
} from "lucide-react";

interface VideoShoppableProps {
  data: any[];
  settings: any;
}

const SECTION_SPACING = "py-8 md:py-12 lg:py-16";
const CONTAINER_SPACING =
  "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/**
 * Validate image URL
 */
const isValidImageUrl = (
  url?: string
) => {
  if (!url || typeof url !== "string")
    return false;

  if (url.startsWith("/")) return true;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const VideoShoppableSection: React.FC<
  VideoShoppableProps
> = ({ data, settings }) => {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const title =
    settings?.title ||
    "Quick Tutorials for Best Results";

  const subtitle =
    settings?.subtitle ||
    "Watch, learn, and shop our expert recommendations";

  const isMuted =
    settings?.muted !== false;

  const items = useMemo(
    () =>
      data?.filter(
        (slide) =>
          slide?.videoUrl &&
          slide?.product
      ) || [],
    [data]
  );

  /**
   * Auto play/pause on viewport visibility
   */
  useEffect(() => {
    if (!items.length) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video =
              entry.target as HTMLVideoElement;

            if (entry.isIntersecting) {
              video.play().catch((err) => {
                if (
                  err.name !==
                  "NotSupportedError"
                ) {
                  console.warn(
                    "[VideoShoppable] Autoplay prevented:",
                    err.message
                  );
                }
              });
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.6 }
      );

    const videos =
      containerRef.current?.querySelectorAll(
        "video"
      );

    videos?.forEach((video) =>
      observer.observe(video)
    );

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <section
      className={`overflow-hidden bg-white ${SECTION_SPACING}`}
    >
      <div className={CONTAINER_SPACING}>
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14 lg:mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl lg:text-5xl">
            {title}
          </h2>

          <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-[#006044]" />

          {subtitle && (
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base md:text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {/* Carousel Wrapper */}
        <div className="relative">
          {/* Right Fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-l from-white to-transparent md:block" />

          {/* Carousel */}
          <div
            ref={containerRef}
            className="
              flex overflow-x-auto overflow-y-hidden
              gap-4 md:gap-6 lg:gap-8
              snap-x snap-mandatory
              scrollbar-none pb-4
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {items.map((slide, index) => {
              const safeImageSrc =
                isValidImageUrl(
                  slide.product?.image
                )
                  ? slide.product.image
                  : "/placeholder.png";

              const isVideo =
                slide.videoUrl.match(
                  /\.(mp4|webm|mov|ogg)$/i
                ) ||
                slide.videoUrl.includes(
                  "/video/"
                );

              return (
                <div
                  key={index}
                  className="
                    group relative flex-none
                    w-[240px] h-[420px]
                    sm:w-[260px] sm:h-[460px]
                    md:w-[280px] md:h-[500px]
                    lg:w-[320px] lg:h-[580px]
                    snap-start overflow-hidden
                    rounded-3xl bg-zinc-900 shadow-xl
                  "
                >
                  {/* Media */}
                  {isVideo ? (
                    <video
                      src={slide.videoUrl}
                      loop
                      muted={isMuted}
                      playsInline
                      poster={safeImageSrc}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={slide.videoUrl}
                      alt="Reel Media"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

                  {/* Badge */}
                  <div className="absolute left-4 top-4 z-10 text-white">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-md">
                      <Play
                        size={12}
                        fill="currentColor"
                      />
                      <span className="text-[10px] font-semibold">
                        Trending
                      </span>
                    </div>
                  </div>

                  {/* Product Card */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                    <Link
                      href={`/product/${slide.product.slug}`}
                    >
                      <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl transition-colors hover:bg-white/20">
                        {/* Product Image */}
                        <img
                          src={safeImageSrc}
                          alt={
                            slide.product.name ||
                            "Product"
                          }
                          className="h-14 w-14 rounded-xl border border-white/10 bg-white object-cover shadow-sm"
                          onError={(e) => {
                            if (
                              !e.currentTarget.src.includes(
                                "/placeholder.png"
                              )
                            ) {
                              e.currentTarget.src =
                                "/placeholder.png";
                            }
                          }}
                        />

                        {/* Product Info */}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-white">
                            {
                              slide.product
                                .name
                            }
                          </h3>

                          <p className="text-xs font-medium text-white/80">
                            ₹
                            {
                              slide.product
                                .price
                            }
                          </p>
                        </div>

                        {/* CTA */}
                        <button className="rounded-xl bg-white p-3 text-black shadow-lg transition-transform hover:scale-105">
                          <ShoppingBag
                            size={18}
                            strokeWidth={2.2}
                          />
                        </button>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};