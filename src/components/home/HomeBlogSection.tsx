// src/components/home/HomeBlogSection.tsx

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

interface BlogSectionProps {
  data: any[];
  settings: {
    title?: string;
    subtitle?: string;
    viewAllLink?: string;
  };
}

const SECTION_SPACING = "py-8 md:py-12 lg:py-16";
const CONTAINER_SPACING =
  "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

export const HomeBlogSection: React.FC<
  BlogSectionProps
> = ({ data = [], settings }) => {
  const {
    title = "From Our Journal",
    subtitle = "Expert tips, ingredient science, and beauty insights",
    viewAllLink = "/blog",
  } = settings;

  /**
   * Responsive content strategy:
   * Mobile → 1 blog
   * Tablet → 2 blogs
   * Desktop → 3 blogs
   *
   * CSS handles visibility per breakpoint.
   */
  const displayBlogs = useMemo(
    () =>
      data
        .filter((blog) => blog.isPublished)
        .slice(0, 3),
    [data]
  );

  if (!displayBlogs.length) return null;

  return (
    <section
      className={`bg-[#f8f8f7] ${SECTION_SPACING}`}
    >
      <div className={CONTAINER_SPACING}>
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14 lg:mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl lg:text-5xl">
            {title}
          </h2>

          <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-[#217A6E]" />

          {subtitle && (
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base md:text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {displayBlogs.map((post, index) => {
            /**
             * Mobile:
             * show only first card
             *
             * Tablet:
             * show first 2 cards
             *
             * Desktop:
             * show all 3 cards
             */
            const visibilityClass =
              index === 0
                ? "block"
                : index === 1
                ? "hidden md:block"
                : "hidden lg:block";

            return (
              <article
                key={post.id}
                className={`group ${visibilityClass}`}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-3xl bg-zinc-100">
                    <div className="aspect-[16/10]">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Category */}
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#217A6E] backdrop-blur">
                      {post.category?.name ||
                        "Journal"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-5 space-y-3">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {format(
                          new Date(
                            post.createdAt
                          ),
                          "MMM dd"
                        )}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {Math.ceil(
                          post.content.length /
                            1000
                        )}{" "}
                        min read
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-[#217A6E] md:text-xl">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500 md:text-base">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            href={viewAllLink}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 transition-all hover:text-[#217A6E]"
          >
            View All Articles
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};