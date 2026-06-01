// src/components/home/HomeRenderer.tsx

"use client";

import React from "react";
import { HeroBanner } from "./HeroBanner";
import { ProductCarousel } from "./ProductCarousel";
import { PromotionalBanner } from "./PromotionalBanner";
import { TrustTicker } from "./TrustTicker";
import { BrandStory } from "./BrandStory";
import { FeaturedProducts } from "./FeaturedProducts";
import { HomeBlogSection } from "./HomeBlogSection";
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
  return (
    <div className="w-full flex flex-col gap-0 bg-white">
      {config?.sectionsOrder
        ?.filter((section) => section.isActive !== false)
        ?.map((section) => {
          const Component = SECTION_COMPONENTS[section.type];
          if (!Component) return null;

          const resolvedData = resolveData(section, data);

          return (
            <section
              key={section.id}
              id={section.id}
              className="w-full"
            >
              <Component
                data={resolvedData}
                settings={section.settings || {}}
                previewMode={previewMode}
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
    const selector = sourceKey.replace('collection_', '');
    
    // Fallback search checking both slug AND stringified ID match configurations
    const target = data?.collections?.find((c: any) => 
      String(c.slug) === String(selector) || String(c.id) === String(selector)
    );
    
    if (target) {
      const rawProducts = target.products || [];
      return rawProducts.map((p: any) => p.product || p);
    }
    return [];
  }
  return data?.[sourceKey] || [];
      
    case 'COLLECTIONS':
      if (settings?.collectionId && data?.collections) {
        const selectedCollection = data.collections.find(
          (c: any) => String(c.id) === String(settings.collectionId)
        );
        if (selectedCollection) {
          return [selectedCollection];
        }
      }
      return data?.collections || [];

    case 'BLOG_SECTION':
      return data?.blogs || [];

    case 'HERO':
    case 'PROMO_BANNER':
      return data?.banners || [];

    case 'VIDEO_SHOPPABLE':
      // Pass existing slide setups from settings down if data isn't separated on root data level
      return settings?.slides || data?.videoReels || [];

    case 'TRUST_BADGES':
    case 'BRAND_STORY':
      // These elements rely strictly on configured block settings context fields rather than datasets
      return data || [];

    default:
      return [];
  }
}