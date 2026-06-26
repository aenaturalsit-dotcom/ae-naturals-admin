// src/components/home/HomeRenderer.tsx

"use client";

import React, { useMemo, Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Loader2 } from "lucide-react";

// Import section components
import { HeroBanner } from "./HeroBanner";
import { ProductCarousel } from "./ProductCarousel";
import { PromotionalBanner } from "./PromotionalBanner";
import { TrustTicker } from "./TrustTicker";
import { BrandStory } from "./BrandStory";
import { FeaturedProducts } from "./FeaturedProducts";
import { HomeBlogSection } from "./HomeBlogSection";
import { CollectionsShowcase } from "./CollectionsShowcase";
import { VideoShoppableSection } from "./VideoShoppableSection";
import WhatsappWidget from "./WhatsappWidget";
import { CategoryIconStrip } from "../sections/CategoryIconStrip";

// Types
import type { ThemeSection, StorefrontData } from "@/lib/validators/storefront";
import { getTypedSettings } from "@/lib/validators/storefront";

// ============================================================
// 1. TYPES
// ============================================================

interface HomeRendererProps {
  config: {
    sectionsOrder: ThemeSection[];
  };
  data: StorefrontData['data'];
  previewMode?: boolean;
  className?: string;
}

interface SectionComponentProps {
  data: any;
  settings: Record<string, any>;
  previewMode?: boolean;
  sectionId: string;
  sectionType: string;
  isActive: boolean;
  index: number;
}

// ============================================================
// 2. SECTION REGISTRY
// ============================================================

interface SectionRegistryItem {
  component: React.ComponentType<any>;
  displayName: string;
  defaultProps?: Record<string, any>;
  dataResolver?: (section: ThemeSection, data: any) => any;
}

const SECTION_REGISTRY: Record<string, SectionRegistryItem> = {
  HERO: {
    component: HeroBanner,
    displayName: "Hero Banner",
    dataResolver: (section, data) => data?.banners || [],
  },
  COLLECTIONS: {
    component: CollectionsShowcase,
    displayName: "Collections Grid",
    dataResolver: (section, data) => {
      const settings = getTypedSettings<any>(section);
      if (settings?.collectionId && data?.collections) {
        const selectedCollection = data.collections.find(
          (c: any) => String(c.id) === String(settings.collectionId)
        );
        if (selectedCollection) {
          return [selectedCollection];
        }
      }
      return data?.collections || [];
    },
  },
  FEATURED_PRODUCTS: {
    component: FeaturedProducts,
    displayName: "Featured Products",
    dataResolver: (section, data) => data?.featuredProducts || [],
  },
  PRODUCT_CAROUSEL: {
    component: ProductCarousel,
    displayName: "Product Carousel",
    dataResolver: (section, data) => {
      const settings = getTypedSettings<any>(section);
      const sourceKey = settings.dataSource;

      if (sourceKey?.startsWith("collection_")) {
        const selector = sourceKey.replace("collection_", "");
        const target = data?.collections?.find(
          (c: any) =>
            String(c.slug) === String(selector) ||
            String(c.id) === String(selector)
        );
        if (target) {
          const rawProducts = target.products || [];
          return rawProducts.map((p: any) => p.product || p);
        }
        return [];
      }
      return data?.[sourceKey] || [];
    },
  },
  PROMO_BANNER: {
    component: PromotionalBanner,
    displayName: "Promotional Banner",
    dataResolver: (section, data) => data?.banners || [],
  },
  TRUST_BADGES: {
    component: TrustTicker,
    displayName: "Trust Badges",
    dataResolver: (section, data) => data || [],
  },
  BRAND_STORY: {
    component: BrandStory,
    displayName: "Brand Story",
    dataResolver: (section, data) => data || [],
  },
  BLOG_SECTION: {
    component: HomeBlogSection,
    displayName: "Blog Section",
    dataResolver: (section, data) => data?.blogs || [],
  },
  VIDEO_SHOPPABLE: {
    component: VideoShoppableSection,
    displayName: "Video Shoppable",
    dataResolver: (section, data) => {
      const settings = getTypedSettings<any>(section);
      return settings?.slides || data?.videoReels || [];
    },
  },
  WHATSAPP_WIDGET: {
    component: WhatsappWidget,
    displayName: "WhatsApp Widget",
    dataResolver: (section, data) => data || [],
  },
  CATEGORY_ICON_STRIP: {
    component: CategoryIconStrip,
    displayName: "Category Icon Strip",
    dataResolver: (section, data) => {
      // ✅ Ensure categories data is properly passed
      const categories = data?.categories || [];
      
      // Debug logging (only in preview mode)
      if (data?.previewMode) {
        console.log('HomeRenderer - Category Data:', {
          totalCategories: categories.length,
          categoryIds: getTypedSettings<any>(section)?.categoryIds || [],
          hasCategories: categories.length > 0,
        });
      }
      
      // Return the entire data object with categories
      return {
        ...data,
        categories: categories,
      };
    },
  },
};

// ============================================================
// 3. ERROR BOUNDARY COMPONENT
// ============================================================

interface SectionErrorBoundaryProps {
  section: ThemeSection;
  children: React.ReactNode;
}

function SectionErrorBoundary({ section, children }: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-700">
                Failed to load {section.type.replace("_", " ")}
              </h4>
              <p className="text-xs text-red-600">
                This section encountered an error. Please check the configuration.
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// ============================================================
// 4. SECTION LOADER COMPONENT
// ============================================================

interface SectionLoaderProps {
  section: ThemeSection;
  data: StorefrontData['data'];
  previewMode?: boolean;
  index: number;
}

function SectionLoader({ section, data, previewMode, index }: SectionLoaderProps) {
  const registryItem = SECTION_REGISTRY[section.type];

  if (!registryItem) {
    return (
      <div className="p-4 m-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-sm text-yellow-700">
          Unknown section type: <span className="font-mono">{section.type}</span>
        </p>
      </div>
    );
  }

  // Resolve data for this section type
  const resolvedData = registryItem.dataResolver
    ? registryItem.dataResolver(section, { ...data, previewMode })
    : data;

  // Special case: WhatsApp Widget doesn't need section wrapper
  if (section.type === "WHATSAPP_WIDGET") {
    return (
      <SectionErrorBoundary section={section}>
        <registryItem.component
          data={resolvedData}
          settings={section.settings || {}}
          previewMode={previewMode}
          sectionId={section.id}
          sectionType={section.type}
          isActive={section.isActive}
          index={index}
        />
      </SectionErrorBoundary>
    );
  }

  // For all other sections, wrap in section tag
  return (
    <section
      key={section.id}
      id={section.id}
      className={`w-full ${!section.isActive ? 'opacity-50 pointer-events-none' : ''}`}
      data-section-type={section.type}
      data-section-id={section.id}
      data-section-active={section.isActive}
    >
      <SectionErrorBoundary section={section}>
        <registryItem.component
          data={resolvedData}
          settings={section.settings || {}}
          previewMode={previewMode}
          sectionId={section.id}
          sectionType={section.type}
          isActive={section.isActive}
          index={index}
        />
      </SectionErrorBoundary>
    </section>
  );
}

// ============================================================
// 5. LOADING SKELETON
// ============================================================

function SectionSkeleton() {
  return (
    <div className="w-full p-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 6. MAIN COMPONENT
// ============================================================

export default function HomeRenderer({
  config,
  data,
  previewMode = false,
  className = "",
}: HomeRendererProps) {
  // Memoize active sections
  const activeSections = useMemo(() => {
    if (!config?.sectionsOrder) return [];
    return config.sectionsOrder.filter(
      (section) => section.isActive !== false
    );
  }, [config?.sectionsOrder]);

  // Debug: Log data being passed
  useMemo(() => {
    if (previewMode) {
      console.log('HomeRenderer - Data received:', {
        hasCategories: !!(data?.categories),
        categoriesCount: data?.categories?.length || 0,
        activeSectionsCount: activeSections.length,
        categorySection: activeSections.find(s => s.type === 'CATEGORY_ICON_STRIP'),
      });
    }
  }, [data, activeSections, previewMode]);

  // Memoize rendered sections
  const renderedSections = useMemo(() => {
    if (activeSections.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-xl m-4">
          <div className="text-center text-gray-400">
            <p className="text-sm font-medium">No active sections</p>
            <p className="text-xs mt-1">Add a section from the builder</p>
          </div>
        </div>
      );
    }

    return activeSections.map((section, index) => (
      <SectionLoader
        key={section.id}
        section={section}
        data={data}
        previewMode={previewMode}
        index={index}
      />
    ));
  }, [activeSections, data, previewMode]);

  // Don't render if no config
  if (!config) {
    return null;
  }

  // Preview mode indicator
  const previewIndicator = previewMode && (
    <div className="sticky top-0 z-50 bg-[#006044] text-white text-center py-1.5 text-xs font-medium shadow-lg">
      ⚡ Preview Mode - Changes are not visible to customers
    </div>
  );

  return (
    <div className={`w-full flex flex-col gap-0 bg-white ${className}`}>
      {previewIndicator}
      <Suspense fallback={<SectionSkeleton />}>
        {renderedSections}
      </Suspense>
    </div>
  );
}

// ============================================================
// 7. EXPORT UTILITIES FOR USE IN OTHER COMPONENTS
// ============================================================

/**
 * Get all registered section types
 */
export function getRegisteredSectionTypes(): string[] {
  return Object.keys(SECTION_REGISTRY);
}

/**
 * Get section display name
 */
export function getSectionDisplayName(type: string): string {
  return SECTION_REGISTRY[type]?.displayName || type;
}

/**
 * Check if a section type is registered
 */
export function isSectionRegistered(type: string): boolean {
  return type in SECTION_REGISTRY;
}

/**
 * Get section registry item
 */
export function getSectionRegistryItem(type: string): SectionRegistryItem | null {
  return SECTION_REGISTRY[type] || null;
}