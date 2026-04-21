// src\components\home\HomeRenderer.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { HeroBanner } from "./HeroBanner";
import { ProductCarousel } from "./ProductCarousel";
import { PromotionalBanner } from "./PromotionalBanner";
import { TrustTicker } from "./TrustTicker";
import { BrandStory } from "./BrandStory";
import {HomeBlogSection} from "./HomeBlogSection";
import { CollectionsShowcase } from "./CollectionsShowcase";
import { FeaturedProducts } from "./FeaturedProducts";

const SECTION_COMPONENTS: Record<string, React.FC<any>> = {
  HERO: HeroBanner,
  COLLECTIONS: CollectionsShowcase,
  FEATURED_PRODUCTS: FeaturedProducts,
  PRODUCT_CAROUSEL: ProductCarousel,
  PROMO_BANNER: PromotionalBanner,
  TRUST_BADGES: TrustTicker,
  BRAND_STORY: BrandStory,
  BLOG_SECTION: HomeBlogSection,
};

interface HomeRendererProps {
  config: { sectionsOrder: any[] };
  data: any;
  previewMode?: boolean;
}

export default function HomeRenderer({
  config,
  data,
  previewMode = false,
}: HomeRendererProps) {
  // Mount state to prevent hydration errors when mixing Zustand with SSR
  const [mounted, setMounted] = useState(false);
  const liveSections = useStorefrontStore((state) => state.sections);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If in preview mode inside the admin panel, use the Zustand store.
  // Otherwise, use the SSR injected config.
  const sectionsToRender =
    previewMode && mounted ? liveSections : config?.sectionsOrder;

  if (!sectionsToRender) return null;

  return (
    <div
      className={`flex flex-col gap-y-12 md:gap-y-16 bg-white ${
        previewMode ? "min-h-full pb-16" : "min-h-screen pb-24"
      }`}
    >
      {sectionsToRender
        .filter((section: any) => section.isActive)
        .map((section: any) => {
          const Component = SECTION_COMPONENTS[section.type];
          if (!Component) return null;

          const resolvedData = resolveData(section, data);

          return (
            <section
              key={section.id}
              id={section.id}
              className="w-full px-4 md:px-0"
            >
              <Component
                data={resolvedData}
                settings={section.settings || {}}
              />
            </section>
          );
        })}
    </div>
  );
}

// Inside src/components/home/HomeRenderer.tsx

function resolveData(section: any, data: any) {
  const settings = section.settings || {};
  const sourceKey = settings.dataSource;

  // This 'data' object is exactly what you sent me in the JSON
  switch (section.type) {
    case 'FEATURED_PRODUCTS':
      // Look specifically for the "featuredProducts" key from your JSON
      return data?.featuredProducts || [];

    case 'PRODUCT_CAROUSEL':
      // 1. If it's a dynamic collection (e.g. "collection_summer-sale")
      if (sourceKey?.startsWith('collection_')) {
        const slug = sourceKey.replace('collection_', '');
        const target = data.collections?.find((c: any) => c.slug === slug);
        
        // Unwrap join-table mapping if it exists
        return target?.products?.map((p: any) => p.product || p) || [];
      }
      
      // 2. Fallback to standard data keys (e.g. "featuredProducts")
      return data[sourceKey] || [];
      
    case 'COLLECTIONS':
      // This is for the grid of collection circles, it uses the whole collections array
      return data?.collections || [];

    case 'BLOG_SECTION':
      // Look specifically for the "blogs" key from your JSON
      return data?.blogs || [];

    case 'HERO':
    case 'PROMO_BANNER':
      // Currently your JSON shows banners as [], so this will be empty for now
      return data?.banners || [];

    default:
      return null;
  }
}