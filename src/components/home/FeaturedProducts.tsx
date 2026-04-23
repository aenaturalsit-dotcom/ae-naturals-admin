// src\components\home\FeaturedProducts.tsx



"use client";

import React from "react";
import ProductCard from "../product/ProductCard";

interface FeaturedProductsProps {
  data?: any[];
  settings?: {
    title?: string;
  };
}

export const FeaturedProducts = ({
  data = [],
  settings = {},
}: FeaturedProductsProps) => {
  const title = settings?.title;

  const hasProducts = data && data.length > 0;

  return (
    <section
      className="w-full px-4 py-10 sm:py-12 lg:py-16"
      aria-labelledby="featured-products-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        {title && (
          <div className="mb-6 sm:mb-8 flex items-center justify-between">
            <h2
              id="featured-products-heading"
              className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-neutral-900"
            >
              {title}
            </h2>
          </div>
        )}

        {/* EMPTY STATE */}
        {!hasProducts && (
          <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12">
            <p className="text-sm font-medium text-neutral-600 mb-2">
              No featured products yet
            </p>
            <p className="text-xs text-neutral-500 max-w-sm">
              Products marked as “featured” will appear here once available.
            </p>
          </div>
        )}

        {/* GRID */}
        {hasProducts && (
          <div
            className="
              grid 
              grid-cols-2 
              gap-4 
              sm:grid-cols-2 
              sm:gap-5 
              md:grid-cols-3 
              lg:grid-cols-4 
              lg:gap-6
            "
          >
            {data.map((product: any) => {
              const normalizedProduct = product.product
                ? product.product
                : product;

              return (
                <ProductCard
                  key={normalizedProduct.id}
                  product={normalizedProduct}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};