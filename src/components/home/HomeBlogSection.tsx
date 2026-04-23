// src\components\home\HomeBlogSection.tsx



"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface BlogSectionProps {
  data: any[];
  settings: {
    title?: string;
    subtitle?: string;
    viewAllLink?: string;
  };
}

export const HomeBlogSection: React.FC<BlogSectionProps> = ({
  data = [],
  settings,
}) => {
  const {
    title = "From Our Journal",
    subtitle = "Expert tips, ingredient science, and beauty insights",
    viewAllLink = "/blog",
  } = settings;

  const displayBlogs = data.filter((b) => b.isPublished).slice(0, 3);

  if (displayBlogs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-[#f8f8f7]">
      <div className="max-w-7xl mx-auto px-4">

        {/* ✅ HEADER */}
        <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
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

        {/* ✅ GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayBlogs.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`}>

                {/* IMAGE */}
                <div className="relative rounded-2xl overflow-hidden bg-zinc-100">
                  <div className="aspect-[16/10]">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* CATEGORY */}
                  <span className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#006044] backdrop-blur">
                    {post.category?.name || "Journal"}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="mt-4 space-y-2">
                  {/* META */}
                  <div className="flex items-center gap-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {format(new Date(post.createdAt), "MMM dd")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {Math.ceil(post.content.length / 1000)} min read
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-lg font-bold text-zinc-900 leading-snug group-hover:text-[#006044] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* EXCERPT */}
                  <p className="text-sm text-zinc-500 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

              </Link>
            </article>
          ))}
        </div>

        {/* ✅ CTA */}
        <div className="mt-12 flex justify-center">
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-[#006044] transition-all group"
          >
            View All Articles
            <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
};