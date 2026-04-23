// src\components\home\PromotionalBanner.tsx



"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

type PromotionalBannerProps = {
  settings?: {
    imageUrl?: string;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
  };
};

export function PromotionalBanner({ settings }: PromotionalBannerProps) {
  const imageUrl = settings?.imageUrl || "/banner-placeholder.jpg";
  const title = settings?.title || "Special Offer";
  const subtitle =
    settings?.subtitle || "Limited time deal. Don’t miss out.";
  const buttonText = settings?.buttonText || "Shop Now";
  const buttonLink = settings?.buttonLink || "/";

  return (
    <section
      aria-label="Promotional banner"
      className="w-full px-3 sm:px-4 md:px-6 lg:px-8 mt-4 sm:mt-6 md:mt-8"
    >
      {/* OUTER CONTAINER */}
      <div className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-2xl group shadow-sm">

        {/* RESPONSIVE HEIGHT */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/7] lg:aspect-[16/6]">

          {/* IMAGE */}
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover transition-transform duration-[6s] ease-out group-hover:scale-105"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />

          {/* CONTENT */}
          <div className="absolute inset-0 flex items-end md:items-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

              <div className="grid md:grid-cols-2 items-center gap-6 md:gap-12">

                {/* LEFT CONTENT */}
                <div className="pb-6 md:pb-0">

                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-md sm:max-w-lg space-y-4 sm:space-y-5"
                  >
                    {/* TITLE */}
                    <h2 className="flex flex-wrap gap-x-2 text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight">
                      {title.split(" ").map((word, i) => (
                        <motion.span key={i} variants={wordVariants}>
                          {word}
                        </motion.span>
                      ))}
                    </h2>

                    {/* SUBTITLE */}
                    <motion.p
                      variants={ctaVariants}
                      className="text-sm sm:text-base text-white/85 max-w-md leading-relaxed"
                    >
                      {subtitle}
                    </motion.p>

                    {/* CTA */}
                    {buttonText && (
                      <motion.div variants={ctaVariants}>
                        <Link
                          href={buttonLink}
                          aria-label={`${buttonText} - ${title}`}
                          className="
                            inline-flex items-center justify-center
                            bg-white text-gray-900
                            px-6 py-3 md:px-8 md:py-3.5
                            text-sm font-semibold tracking-wide uppercase
                            rounded-lg shadow-lg
                            transition-all duration-200
                            hover:bg-gray-100 hover:scale-[1.04]
                            active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-white/70
                          "
                        >
                          {buttonText}
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* RIGHT SIDE (FUTURE USE) */}
                <div className="hidden md:block" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- ANIMATION SYSTEM ---------------- */

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: easing,
    },
  },
};

const ctaVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: 0.25,
    },
  },
};