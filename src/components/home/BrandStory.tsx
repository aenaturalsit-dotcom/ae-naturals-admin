// src/components/home/BrandStory.tsx

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  Variants,
} from "framer-motion";

const SECTION_SPACING = "py-8 md:py-12 lg:py-16";
const CONTAINER_SPACING = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

export function BrandStory({
  settings,
}: {
  settings?: any;
}) {
  const shouldReduceMotion =
    useReducedMotion();

  const title =
    settings?.title || "Young Scientists";

  const description =
    settings?.description ||
    "Every time you buy from our website, you not just provide an underprivileged child a science scholarship but also fulfill a dream and build a future.";

  const imageUrl =
    settings?.imageUrl ||
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1200&auto=format&fit=crop";

  const buttonText =
    settings?.buttonText || "Learn more";

  const link = settings?.link || "/about";

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
          viewport={{ once: true }}
          variants={container}
          className="
            overflow-hidden
            rounded-3xl
            bg-[#2e7d6b]
            shadow-sm
          "
        >
          <div className="grid items-stretch md:grid-cols-2">
            {/* Image Section */}
            <motion.div
              variants={fadeLeft}
              className="relative h-[280px] sm:h-[360px] md:h-full"
            >
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>

            {/* Content Section */}
            <motion.div
              variants={fadeRight}
              className="
                flex flex-col justify-center
                p-8 md:p-12 lg:p-14
                text-white
              "
            >
              <div className="max-w-md space-y-5 md:space-y-6">
                {/* Title */}
                <h2 className="text-xl font-semibold leading-tight sm:text-2xl md:text-3xl lg:text-4xl">
                  {title}
                </h2>

                {/* Description */}
                <p className="text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
                  {description}
                </p>

                {/* CTA */}
                <div className="pt-2">
                  <Link
                    href={link}
                    className="
                      inline-flex items-center gap-2
                      rounded-xl bg-white
                      px-5 py-3
                      text-sm font-medium
                      text-[#2e7d6b]
                      transition-all duration-200
                      hover:gap-3
                      hover:bg-white/90
                    "
                  >
                    {buttonText}
                    →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Animation ---------------- */

const easing: [
  number,
  number,
  number,
  number
] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easing,
    },
  },
};

const fadeRight: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easing,
    },
  },
};