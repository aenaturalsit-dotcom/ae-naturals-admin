// src\components\home\ProductCarousel.tsx

"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, Variants, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../product/ProductCard";

interface ProductCarouselProps {
  data: any[];
  settings: {
    title?: string;
    showHighlights?: boolean;
  };
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  data = [],
  settings,
}) => {
  const title = settings?.title || "";
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  /* ---------------- EMPTY STATE ---------------- */
  if (!data || data.length === 0) {
    return (
      <section className="w-full px-4 sm:px-6 md:px-8 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-center">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              No products available
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 mt-8 md:mt-12">
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={sectionVariants}
        className="max-w-7xl mx-auto"
      >
        {/* HEADER */}
        {title && (
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              {title}
            </h2>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-100 transition"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-100 transition"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* CAROUSEL */}
        <div className="relative">
          {/* Right fade only (scroll hint) */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent z-10 hidden md:block" />
          <div
            ref={scrollRef}
            className="
            flex gap-4 sm:gap-5 md:gap-6
            overflow-x-auto overflow-y-hidden
            snap-x snap-mandatory
            scrollbar-none
            pb-3
          "
          >
            {data.map((item: any) => {
              const product = item.product ? item.product : item;

              return (
                <motion.div
                  key={product.id}
                  variants={shouldReduceMotion ? {} : itemVariants}
                  className="
                    snap-start
                    min-w-[72%]
                    sm:min-w-[48%]
                    md:min-w-[300px]
                    lg:min-w-[320px]
                    transition-transform duration-300
                    hover:scale-[1.03]
                  "
                >
                  <ProductCard product={product} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

/* ---------------- ANIMATION SYSTEM ---------------- */

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easing,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: easing,
    },
  },
};
