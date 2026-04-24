"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Play, ShoppingBag } from "lucide-react";

// ✅ ADDED: The same bulletproof image checker
const isValidImageUrl = (url?: string) => {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/")) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface VideoShoppableProps {
  data: any[];
  settings: any;
}

export const VideoShoppableSection: React.FC<VideoShoppableProps> = ({ data, settings }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const title = settings?.title || "Quick Tutorials for Best Results";
  const subtitle = settings?.subtitle || "Watch, learn, and shop our expert recommendations";
  const isMuted = settings?.muted !== false; 

  const items = data?.filter((slide) => {
    const isValid = slide?.videoUrl && slide?.product;
    return isValid;
  }) || [];

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch((err) => {
               // Silently catch NotSupportedError (caused by slow loads or broken sources)
               if (err.name !== 'NotSupportedError') {
                 console.warn("[VideoShoppable] Autoplay prevented:", err.message);
               }
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    // Only observe actual video tags, completely ignoring GIFs
    const videos = containerRef.current?.querySelectorAll("video");
    videos?.forEach((vid) => observer.observe(vid));

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <div className="py-16 md:py-24 overflow-hidden bg-white">
      
      {/* HEADER */}
      <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight">
          {title}
        </h2>
        <div className="h-1.5 w-16 bg-[#006044] rounded-full mx-auto mt-4" />
        {subtitle && (
          <p className="mt-4 text-sm md:text-base text-zinc-500 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* REELS CAROUSEL */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 px-4 md:px-8 pb-8 max-w-[1400px] mx-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((slide, i) => {
          const safeImageSrc = isValidImageUrl(slide.product?.image) 
            ? slide.product.image 
            : "/placeholder.png";

          // 🚨 FIX: Determine if the media is actually a video or a GIF
          const isVideo = slide.videoUrl.match(/\.(mp4|webm|mov|ogg)$/i) || slide.videoUrl.includes('/video/');

          return (
            <div
              key={i}
              className="relative flex-none w-[280px] h-[500px] md:w-[320px] md:h-[580px] snap-center rounded-3xl overflow-hidden shadow-xl group bg-zinc-900"
            >
              {/* 🚨 FIX: Conditionally render <video> vs <img> */}
              {isVideo ? (
                <video
                  src={slide.videoUrl}
                  loop
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  poster={safeImageSrc}
                />
              ) : (
                <img
                  src={slide.videoUrl}
                  alt="Reel Media"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none text-white">
                 <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <Play size={12} fill="currentColor" />
                    <span className="text-[10px] font-bold">Trending</span>
                 </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <Link href={`/product/${slide.product.slug}`}>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/20 transition-colors">
                    <img
                    src={safeImageSrc} 
                    alt={slide.product.name || "Product"}
                    className="w-14 h-14 object-cover rounded-xl border border-white/10 shadow-sm bg-white"
                    onError={(e) => {
                      if (!e.currentTarget.src.includes("/placeholder.png")) {
                        e.currentTarget.src = "/placeholder.png"; 
                      }
                    }}
                  />
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-white font-bold text-sm truncate">{slide.product.name}</h3>
                      <p className="text-white/80 text-xs font-medium">₹{slide.product.price}</p>
                    </div>
                    <button className="bg-white text-black p-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
                      <ShoppingBag size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};