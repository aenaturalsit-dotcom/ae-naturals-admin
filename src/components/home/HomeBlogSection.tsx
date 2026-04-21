// src\components\home\HomeBlogSection.tsx

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface BlogSectionProps {
  data: any[]; // The blogs array from your JSON
  settings: {
    title?: string;
    viewAllLink?: string;
  };
}

export const HomeBlogSection: React.FC<BlogSectionProps> = ({ data = [], settings }) => {
  const { title = "Latest from the Blog", viewAllLink = "/blog" } = settings;

  // Filter only published blogs and take the top 3
  const displayBlogs = data.filter((b) => b.isPublished).slice(0, 3);

  if (displayBlogs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight uppercase">
              {title}
            </h2>
            <div className="h-1.5 w-20 bg-[#006044] rounded-full" />
          </div>
          <Link 
            href={viewAllLink}
            className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#006044] hover:gap-3 transition-all"
          >
            Explore All Posts <ArrowRight size={16} />
          </Link>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayBlogs.map((post) => (
            <article key={post.id} className="group cursor-pointer">
              <Link href={`/blog/${post.slug}`}>
                <div className="space-y-6">
                  {/* Image Wrapper */}
                  <div className="aspect-[16/10] overflow-hidden rounded-[32px] bg-zinc-100 relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#006044]">
                        {post.category?.name || "Articles"}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {format(new Date(post.createdAt), "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {Math.ceil(post.content.length / 1000)} min read
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-zinc-900 group-hover:text-[#006044] transition-colors leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-zinc-500 text-sm font-medium line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};