// src\components\home\BrandStory.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BrandStoryProps {
  settings: {
    title?: string;
    description?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonLink?: string;
    layout?: "left" | "right"; // Allows you to flip the image side
  };
}

export const BrandStory: React.FC<BrandStoryProps> = ({ settings }) => {
  const { 
    title = "Our Story", 
    description = "Crafting nature's finest essentials for your daily ritual.", 
    imageUrl, 
    buttonText = "Learn More", 
    buttonLink = "/about",
    layout = "left" 
  } = settings;

  return (
    <section className="w-full py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
          layout === "right" ? "lg:flex-row-reverse" : ""
        }`}>
          
          {/* IMAGE SIDE */}
          <div className="w-full lg:w-1/2">
            <div className="relative group">
              {/* Decorative Background Element */}
              <div className="absolute -inset-4 bg-zinc-50 rounded-[40px] -z-10 transition-transform group-hover:scale-105 duration-700" />
              
              <div className="aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300 italic font-medium">
                    Upload Brand Imagery
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TEXT SIDE */}
          <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              {/* <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#006044]">
                Since 2024
              </span> */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 leading-[1.1] tracking-tight">
                {title}
              </h2>
            </div>

            <p className="text-lg md:text-xl text-zinc-600 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
              {description}
            </p>

            <div className="pt-4">
              <Link 
                href={buttonLink}
                className="inline-flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#006044] hover:shadow-2xl hover:shadow-green-200 transition-all active:scale-95 group"
              >
                {buttonText}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};