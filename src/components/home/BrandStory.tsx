// src/components/home/BrandStory.tsx



"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, Variants } from "framer-motion";

export function BrandStory({ settings }: { settings?: any }) {
  const shouldReduceMotion = useReducedMotion();

  const title = settings?.title || "Young Scientists";
  const description =
    settings?.description ||
    "Every time you buy from our website, you not just provide an underprivileged child a science scholarship but also fulfill a dream and build a future.";
  const imageUrl =
    settings?.imageUrl ||
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1200&auto=format&fit=crop";
  const buttonText = settings?.buttonText || "Learn more";
  const link = settings?.link || "/about";

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 mt-10 md:mt-14">
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
        variants={container}
        className="
          max-w-7xl mx-auto
          rounded-[28px]
          overflow-hidden
          bg-[#2e7d6b]
        "
      >
        <div className="grid md:grid-cols-2 items-stretch">

          {/* IMAGE (BLEED STYLE) */}
          <motion.div
            variants={fadeLeft}
            className="relative w-full h-[260px] sm:h-[320px] md:h-full"
          >
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          {/* CONTENT */}
          <motion.div
            variants={fadeRight}
            className="
              flex flex-col justify-center
              px-6 sm:px-10 md:px-12
              py-8 sm:py-10 md:py-14
              text-white
            "
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
              {description}
            </p>

            <div className="mt-6">
              <Link
                href={link}
                className="
                  inline-flex items-center gap-2
                  bg-white text-[#2e7d6b]
                  px-5 py-2.5
                  text-sm font-medium
                  rounded-md
                  transition-all duration-200
                  hover:gap-3
                  hover:bg-white/90
                "
              >
                {buttonText}
                →
              </Link>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- ANIMATION ---------------- */

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easing },
  },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easing },
  },
};