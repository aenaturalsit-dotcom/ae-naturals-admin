// src/components/home/PromotionalBanner.tsx

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

const SECTION_SPACING = "py-8 md:py-12 lg:py-16";
const CONTAINER_SPACING = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

export function PromotionalBanner({
  settings,
}: PromotionalBannerProps) {
  const imageUrl =
    settings?.imageUrl || "/banner-placeholder.jpg";

  const title = settings?.title || "Special Offer";

  const subtitle =
    settings?.subtitle ||
    "Limited time deal. Don’t miss out.";

  const buttonText =
    settings?.buttonText || "Shop Now";

  const buttonLink = settings?.buttonLink || "/";

  return (
    <section
      aria-label="Promotional banner"
      className={`w-full ${SECTION_SPACING}`}
    >
      <div className={CONTAINER_SPACING}>
        {/* Banner Container */}
        <div className="group relative overflow-hidden rounded-3xl shadow-sm">
          {/* Banner Ratio */}
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[16/7] lg:aspect-[16/6]">
            {/* Background Image */}
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover transition-transform duration-[6000ms] ease-out group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="w-full px-6 py-8 sm:px-8 md:px-10 lg:px-12">
                <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
                  {/* Left Content */}
                  <div>
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={containerVariants}
                      className="max-w-md space-y-5 md:space-y-6"
                    >
                      {/* Title */}
                      <h2 className="flex flex-wrap gap-x-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                        {title
                          .split(" ")
                          .map((word, index) => (
                            <motion.span
                              key={index}
                              variants={wordVariants}
                            >
                              {word}
                            </motion.span>
                          ))}
                      </h2>

                      {/* Subtitle */}
                      <motion.p
                        variants={ctaVariants}
                        className="max-w-md text-sm leading-relaxed text-white/85 sm:text-base md:text-lg"
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
                              rounded-xl bg-white px-6 py-3
                              text-sm font-semibold uppercase tracking-wide
                              text-gray-900 shadow-lg
                              transition-all duration-200
                              hover:scale-[1.03]
                              hover:bg-gray-100
                              active:scale-95
                              focus:outline-none
                              focus:ring-2
                              focus:ring-white/70
                              md:px-8 md:py-3.5
                            "
                          >
                            {buttonText}
                          </Link>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Right Side Placeholder */}
                  <div className="hidden md:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Animation System ---------------- */

const easing: [number, number, number, number] = [
  0.22,
  1,
  0.36,
  1,
];

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