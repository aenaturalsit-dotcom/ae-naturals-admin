// src/components/home/HomeRenderer.tsx


"use client";

import React, { useEffect, useState } from "react";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { HeroBanner } from "./HeroBanner";
import { ProductCarousel } from "./ProductCarousel";
import { PromotionalBanner } from "./PromotionalBanner";
import { TrustTicker } from "./TrustTicker";
import { BrandStory } from "./BrandStory";
import { FeaturedProducts } from "./FeaturedProducts";
import {HomeBlogSection} from "./HomeBlogSection";
import { CollectionsShowcase } from "./CollectionsShowcase";
import { VideoShoppableSection } from "./VideoShoppableSection";


// 1. REGISTRY: Maps Admin block types to your actual React components
const SECTION_COMPONENTS: Record<string, React.FC<any>> = {
  HERO: HeroBanner,
  COLLECTIONS: CollectionsShowcase,
  FEATURED_PRODUCTS: FeaturedProducts,
  PRODUCT_CAROUSEL: ProductCarousel,
  PROMO_BANNER: PromotionalBanner,
  TRUST_BADGES: TrustTicker,
  BRAND_STORY: BrandStory,
  BLOG_SECTION: HomeBlogSection,
  VIDEO_SHOPPABLE: VideoShoppableSection,

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
  const [mounted, setMounted] = useState(false);
  const liveSections = useStorefrontStore((state) => state.sections);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determines the proper sequence based on Admin definition
  const sectionsToRender = previewMode && mounted ? liveSections : config?.sectionsOrder;

  if (!sectionsToRender) return null;

  return (
    <div
      className={`flex flex-col gap-y-12 md:gap-y-16 bg-white ${
        previewMode ? "min-h-full pb-16" : "min-h-screen pb-24"
      }`}
    >
      {/* Maps through the exact sequence defined in the DB/Admin */}
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

// 2. DATA RESOLVER: Ensures components get the right backend data array
function resolveData(section: any, data: any) {
  const settings = section.settings || {};
  const sourceKey = settings.dataSource;

  switch (section.type) {
    case 'FEATURED_PRODUCTS':
      return data?.featuredProducts || [];

    case 'PRODUCT_CAROUSEL':
      if (sourceKey?.startsWith('collection_')) {
        const slug = sourceKey.replace('collection_', '');
        const target = data.collections?.find((c: any) => c.slug === slug);
        return target?.products?.map((p: any) => p.product || p) || [];
      }
      return data[sourceKey] || [];
      
    case 'COLLECTIONS':
      // CollectionsShowcase fetches its own data using settings.collectionId, 
      // but we pass the fallback collections array just in case.
      return data?.collections || [];

    case 'BLOG_SECTION':
      return data?.blogs || [];

    case 'HERO':
    case 'PROMO_BANNER':
      return data?.banners || [];

       case "VIDEO_SHOPPABLE":
      // The video data is stored directly in the admin block settings now!
      return settings.slides || [];

    default:
      return null;
  }
}