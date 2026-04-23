// src\components\home\CollectionsShowcase.tsx

"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "../product/ProductCard";

interface CollectionsShowcaseProps {
  data: any[];
  settings: {
    title?: string;
    collectionId?: string;
    showHighlights?: boolean;
  };
}

export const CollectionsShowcase: React.FC<CollectionsShowcaseProps> = ({
  data = [],
  settings,
}) => {
  const title = settings?.title || "";
  const collection = data?.length > 0 ? data[0] : null;

  /* ---------------- EMPTY STATE ---------------- */
  if (!settings?.collectionId) {
    return (
      <section className="w-full px-4 sm:px-6 md:px-8 mt-6 md:mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-center">
            <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              No Collection Selected
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------- NO DATA STATE ---------------- */
  if (!collection || !collection.products || collection.products.length === 0) {
    return (
      <section className="w-full px-4 sm:px-6 md:px-8 mt-6 md:mt-10">
        <div className="max-w-7xl mx-auto">
          {title && (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
              {title}
            </h2>
          )}

          <div className="flex flex-col items-center justify-center py-16 bg-amber-50 rounded-2xl border border-dashed border-amber-300 text-center">
            <p className="text-sm font-semibold text-amber-700 mb-2">
              No products available
            </p>
            <p className="text-xs text-amber-600 max-w-sm">
              This collection doesn’t have any products yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------- SUCCESS STATE ---------------- */

  const rawProducts = collection.products;
  const productsToRender = rawProducts
    .map((p: any) => (p.product ? p.product : p))
    .slice(0, 4);

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 mt-8 md:mt-12">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        {title && (
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              {title}
            </h2>

            {rawProducts.length > 4 && (
              <Link
                href={`/collections/${collection.slug || collection.id}`}
                className="text-sm font-medium text-[#006044] hover:underline transition"
                aria-label={`View all products in ${title}`}
              >
                View all
              </Link>
            )}
          </div>
        )}

        {/* GRID */}
        <div className="
          grid grid-cols-2 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4 
          gap-3 sm:gap-4 md:gap-6
        ">
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