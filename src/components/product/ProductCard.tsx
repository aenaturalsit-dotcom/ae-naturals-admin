"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price?: number | string; // Made optional and accepts string just in case
    oldPrice?: number | string;
    images: string[];
    rating?: number;
    reviewCount?: number;
    category?: { name: string } | string; 
    stock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // 🚨 THE FIX: Safely parse prices to numbers and fallback to 0 if undefined
  const currentPrice = Number(product.price) || 0;
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : undefined;

  const discountPercent = oldPrice && currentPrice && oldPrice > currentPrice
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;

  const categoryName = typeof product.category === 'string' 
    ? product.category 
    : product.category?.name;

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 relative h-full">
      
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[#F7F7F7] block">
        <Image
          src={product.images?.[0] || "/placeholder-product.png"}
          alt={product.name || "Product"}
          fill
          className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-[#E42529] text-white text-[10px] sm:text-xs font-black px-2 py-1 rounded-sm tracking-wider z-10 uppercase">
            {discountPercent}% OFF
          </div>
        )}
      </Link>

      <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white">
        {/* Rating Row */}
        <div className="flex justify-start items-center mb-2 min-h-[20px]">
          {product.rating ? (
            <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
              <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
              <span>{Number(product.rating).toFixed(1)}</span>
              {product.reviewCount ? (
                <span className="text-gray-400 font-medium ml-1">
                  ({product.reviewCount})
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-gray-900 text-sm md:text-base leading-snug line-clamp-2 mb-1 group-hover:text-[#006044] transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {categoryName && (
          <p className="text-xs text-gray-500 mb-3 truncate">{categoryName}</p>
        )}

        <div className="flex-grow" />

        {/* 🚨 SAFELY RENDERED PRICING */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>
          {oldPrice && (
            <span className="text-sm font-medium text-gray-400 line-through">
              ₹{oldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Dynamic Add to Cart Button */}
       <button 
      onClick={() => alert(`Added ${product.name} to cart!`)} // Placeholder action
      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-[#006044] text-white h-[48px] rounded-xl font-bold text-sm tracking-wide transition-colors disabled:opacity-70 disabled:cursor-not-allowed group-hover:shadow-md"
    >
      
        <>
          <ShoppingCart className="w-4 h-4" />
          ADD TO CART
        </>
     
    </button>
      </div>
    </div>
  );
}