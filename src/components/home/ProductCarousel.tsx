// src\components\home\ProductCarousel.tsx
"use client";

import React from "react";
import ProductCard from "@/components/product/ProductCard";

interface ProductCarouselProps {
  data: any[];
  settings: {
    title?: string;
  };
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ data = [], settings }) => {
  const title = settings?.title || "";

  if (!data || data.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center p-16 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
          <p className="text-zinc-400 font-black text-xs uppercase tracking-[0.2em]">
            Carousel Empty: Select a Collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        {title && (
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">
              {title}
            </h2>
          </div>
        )}

        {/* 🎢 The Slider Rail */}
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {data.map((item: any) => {
            // Support both direct product arrays and join-table arrays
            const product = item.product ? item.product : item;
            return (
              <div 
                key={product.id} 
                className="min-w-[280px] md:min-w-[320px] snap-start transition-transform hover:scale-[1.02] duration-300"
              >
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};