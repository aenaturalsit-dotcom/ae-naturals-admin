// src/components/home/CollectionsShowcase.tsx

"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  PackageSearch,
  Sparkles,
} from "lucide-react";
import ProductCard from "../product/ProductCard";


interface CollectionsShowcaseProps {
  data: any[];
  settings: {
    title?: string;
    collectionId?: string;
    showHighlights?: boolean;
  };
}

const SECTION_SPACING = "py-8 md:py-12 lg:py-16";
const CONTAINER_SPACING = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

export const CollectionsShowcase: React.FC<
  CollectionsShowcaseProps
> = ({ data = [], settings }) => {
  const title = settings?.title || "";
  const collection =
    data?.length > 0 ? data[0] : null;

  const ADMIN_URL =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    "http://localhost:3000";

  /**
   * Empty state → no collection selected
   */
  if (!settings?.collectionId) {
    return (
      <section className={`w-full ${SECTION_SPACING}`}>
        <div className={CONTAINER_SPACING}>
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              No Collection Selected
            </p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Empty state → collection exists but no products
   */
  if (
    !collection ||
    !collection.products ||
    collection.products.length === 0
  ) {
    return (
      <section className={`w-full ${SECTION_SPACING}`}>
        <div className={CONTAINER_SPACING}>
          {/* Header */}
          {title && (
            <div className="mb-8 md:mb-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
                  {title}
                </h2>

                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          )}

          {/* Empty State Card */}
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-300 bg-gradient-to-br from-zinc-50 to-white p-8 md:p-12 lg:p-14 shadow-sm">
            {/* Background Accent */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_35%)]" />

            <div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
              {/* Icon */}
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 shadow-sm">
                <PackageSearch className="h-10 w-10 text-amber-600" />
              </div>

              {/* Content */}
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                  No products available yet
                </h3>

                <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500 sm:text-base">
                  This collection is currently empty.
                  Add products from your admin
                  dashboard to make them visible on
                  your storefront.
                </p>
              </div>

              {/* CTA */}
              <Link
                href={`${ADMIN_URL}/storefront`}
                target="_blank"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03]"
              >
                Manage Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Success state
   */
  const rawProducts = collection.products;

  const productsToRender = rawProducts
    .map((p: any) => (p.product ? p.product : p))
    .slice(0, 4);

  return (
    <section className={`w-full ${SECTION_SPACING}`}>
      <div className={CONTAINER_SPACING}>
        {/* Header */}
        {title && (
          <div className="mb-8 md:mb-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl md:text-3xl">
                {title}
              </h2>

              {rawProducts.length > 4 && (
                <Link
                  href={`/collections/${
                    collection.slug || collection.id
                  }`}
                  className="text-sm font-medium text-[#217A6E] transition hover:underline"
                  aria-label={`View all products in ${title}`}
                >
                  View all
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {productsToRender.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};