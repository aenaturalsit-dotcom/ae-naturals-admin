// src/components/home/FeaturedProducts.tsx

"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  PackageSearch,
  Sparkles,
} from "lucide-react";

import ProductCard from "../product/ProductCard";


interface FeaturedProductsProps {
  data?: any[];
  settings?: {
    title?: string;
  };
}

const SECTION_SPACING = "py-8 md:py-12 lg:py-16";
const CONTAINER_SPACING = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

export const FeaturedProducts = ({
  data = [],
  settings = {},
}: FeaturedProductsProps) => {
  const title = settings?.title;
  const hasProducts = data?.length > 0;

  const ADMIN_URL =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    "http://localhost:3000";

  return (
    <section
      className={`w-full ${SECTION_SPACING}`}
      aria-labelledby="featured-products-heading"
    >
      <div className={CONTAINER_SPACING}>
        {/* Section Header */}
        {title && (
          <div className="mb-8 md:mb-10">
            <div className="flex items-center justify-between">
              <h2
                id="featured-products-heading"
                className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl"
              >
                {title}
              </h2>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasProducts && (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-300 bg-gradient-to-b from-white to-zinc-50 p-8 md:p-12 lg:p-14 text-center shadow-sm">
            <div className="mx-auto flex max-w-lg flex-col items-center">
              {/* Icon */}
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 ring-8 ring-zinc-50 shadow-sm">
                <PackageSearch className="h-8 w-8 text-zinc-500" />
              </div>

              {/* Content */}
              <div className="mt-6 space-y-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  Featured Collection Empty
                </div>

                {/* Heading */}
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
                  No featured products yet
                </h3>

                {/* Description */}
                <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500 md:text-base">
                  Mark products as{" "}
                  <span className="font-medium">
                    featured
                  </span>{" "}
                  from your admin panel to highlight
                  bestsellers, trending items, or
                  recommended picks.
                </p>
              </div>

              {/* CTA */}
              <Link
                href={`${ADMIN_URL}/admin/storefront`}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:opacity-90"
              >
                Manage Products
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Helper text */}
              <p className="mt-4 text-xs text-zinc-400">
                Featured products will automatically
                appear here once enabled.
              </p>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {hasProducts && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
            {data.map((product: any) => {
              const normalizedProduct =
                product.product || product;

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