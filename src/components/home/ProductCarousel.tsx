// src/components/home/ProductCarousel.tsx

"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  motion,
  Variants,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Sparkles,
} from "lucide-react";

import ProductCard from "../product/ProductCard";


interface ProductCarouselProps {
  data: any[];
  settings: {
    title?: string;
    showHighlights?: boolean;
  };
}

const SECTION_SPACING = "py-8 md:py-12 lg:py-16";
const CONTAINER_SPACING = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

export const ProductCarousel: React.FC<
  ProductCarouselProps
> = ({ data = [], settings }) => {
  const title = settings?.title || "";
  const shouldReduceMotion =
    useReducedMotion();

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const ADMIN_URL =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    "http://localhost:3000";

  /**
   * Horizontal scroll handler
   */
  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount =
      scrollRef.current.clientWidth * 0.8;

    scrollRef.current.scrollBy({
      left:
        dir === "left"
          ? -scrollAmount
          : scrollAmount,
      behavior: "smooth",
    });
  };

  /**
   * Empty state
   */
  if (!data || data.length === 0) {
    return (
      <section className={`w-full ${SECTION_SPACING}`}>
        <div className={CONTAINER_SPACING}>
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-300 bg-gradient-to-br from-zinc-50 to-white p-8 md:p-12 lg:p-14 shadow-sm">
            {/* Background Accent */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_35%)]" />

            <div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
              {/* Icon */}
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 shadow-sm">
                <PackageSearch className="h-10 w-10 text-amber-600" />
              </div>

              {/* Content */}
              <div className="mt-6 space-y-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    Empty Catalog
                  </span>
                </div>

                {/* Heading */}
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                  No products available
                </h3>

                {/* Description */}
                <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
                  Your storefront doesn’t have any
                  products yet. Add products from
                  the admin dashboard to start
                  showcasing them here.
                </p>
              </div>

              {/* CTA */}
              <Link
                href={`${ADMIN_URL}/storefront`}
                target="_blank"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03]"
              >
                Add Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Success state
   */
  return (
    <section className={`w-full ${SECTION_SPACING}`}>
      <div className={CONTAINER_SPACING}>
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : "hidden"
          }
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-80px",
          }}
          variants={sectionVariants}
        >
          {/* Header */}
          {title && (
            <div className="mb-8 md:mb-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
                  {title}
                </h2>

                {/* Desktop Controls */}
                <div className="hidden items-center gap-3 md:flex">
                  <button
                    onClick={() =>
                      scroll("left")
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition hover:bg-zinc-100"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={() =>
                      scroll("right")
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition hover:bg-zinc-100"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Carousel */}
          <div className="relative">
            {/* Right Fade Hint */}
            <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-l from-white to-transparent md:block" />

            <div
              ref={scrollRef}
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
              {data.map((item: any) => {
                const product =
                  item.product || item;

                return (
                  <motion.div
                    key={product.id}
                    variants={
                      shouldReduceMotion
                        ? {}
                        : itemVariants
                    }
                    className="
                      snap-start
                      min-w-[75%]
                      sm:min-w-[48%]
                      md:min-w-[300px]
                      lg:min-w-[320px]
                      transition-transform duration-300
                      hover:scale-[1.02]
                    "
                  >
                    <ProductCard
                      product={product}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ---------------- Animation System ---------------- */

const easing: [
  number,
  number,
  number,
  number
] = [0.22, 1, 0.36, 1];

const sectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
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
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: easing,
    },
  },
};