// src/app/admin/storefront/SectionConfigPanel.tsx

"use client";

import React, { useMemo, useCallback, useState } from "react";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

// Shared Components
import {
  TitleInput,
  SubtitleInput,
  TextareaInput,
  ButtonFields,
  ImageUploader,
  CollectionSelector,
  ImageGuidelines,
} from "@/components/admin/shared/SectionConfigShared";

// Section Configurations
import { TrustBadgesConfig } from "@/components/admin/sections/configs/TrustBadgesConfig";
import { PromoBannerConfig } from "@/components/admin/sections/configs/PromoBannerConfig";
import { BrandStoryConfig } from "@/components/admin/sections/configs/BrandStoryConfig";
import { HeroConfig } from "@/components/admin/sections/configs/HeroConfig";
import { ProductCarouselConfig } from "@/components/admin/sections/configs/ProductCarouselConfig";
import { VideoShoppableConfig } from "@/components/admin/sections/configs/VideoShoppableConfig";
import { WhatsAppWidgetConfig } from "@/components/admin/sections/configs/WhatsAppWidgetConfig";
import { BlogSectionConfig } from "@/components/admin/sections/configs/BlogSectionConfig";
import { CollectionsConfig } from "@/components/admin/sections/configs/CollectionsConfig";
import { CategoryStripSettings } from "@/components/admin/sections/CategoryStripSettings";

// Types
import type { CategoryIconStripSettings, ThemeSection } from "@/lib/validators/storefront";
import { FeaturedProductsConfig } from "@/components/admin/sections/configs/FeaturedProductsConfig";

// ============================================================
// 1. TYPES
// ============================================================

interface SectionConfigPanelProps {
  onUpdate?: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  icon?: string | null;
  image?: string | null;
}

// ============================================================
// 2. SECTION CONFIG REGISTRY
// ============================================================

interface SectionConfig {
  component: React.ComponentType<any>;
  label: string;
  needsCollections?: boolean;
  needsCategories?: boolean; // NEW: Flag for categories
}

const SECTION_CONFIG_REGISTRY: Record<string, SectionConfig> = {
  HERO: {
    component: HeroConfig,
    label: "Hero Banner",
    needsCollections: true,
  },
  TRUST_BADGES: {
    component: TrustBadgesConfig,
    label: "Trust Badges",
  },
  COLLECTIONS: {
    component: CollectionsConfig,
    label: "Collections Grid",
    needsCollections: true,
  },
  PRODUCT_CAROUSEL: {
    component: ProductCarouselConfig,
    label: "Product Carousel",
    needsCollections: true,
  },
  FEATURED_PRODUCTS: {
    component: FeaturedProductsConfig,
    label: "Featured Products",
  },
  PROMO_BANNER: {
    component: PromoBannerConfig,
    label: "Promotional Banner",
  },
  BRAND_STORY: {
    component: BrandStoryConfig,
    label: "Brand Story",
  },
  BLOG_SECTION: {
    component: BlogSectionConfig,
    label: "Journal / Blog",
  },
  VIDEO_SHOPPABLE: {
    component: VideoShoppableConfig,
    label: "Video + Products",
    needsCollections: true,
  },
  WHATSAPP_WIDGET: {
    component: WhatsAppWidgetConfig,
    label: "WhatsApp Chat",
  },
  CATEGORY_ICON_STRIP: {
    component: CategoryStripSettings,
    label: "Category Icon Strip",
    needsCategories: true, // ✅ NEW: This section needs categories
  },
};

// ============================================================
// 3. MAIN COMPONENT
// ============================================================

export function SectionConfigPanel({ onUpdate }: SectionConfigPanelProps) {
  const { sections, activeSectionId, updateSectionSettings } =
    useStorefrontStore();

  const activeSection = sections.find((s) => s.id === activeSectionId);

  // ============================================================
  // 4. DATA FETCHING
  // ============================================================

  // Check if we need collections data
  const needsCollectionsData = useMemo(() => {
    if (!activeSection) return false;
    const config = SECTION_CONFIG_REGISTRY[activeSection.type];
    return config?.needsCollections || false;
  }, [activeSection]);

  // Check if we need categories data
  const needsCategoriesData = useMemo(() => {
    if (!activeSection) return false;
    const config = SECTION_CONFIG_REGISTRY[activeSection.type];
    return config?.needsCategories || false;
  }, [activeSection]);

  // Fetch collections
  const {
    data: collections,
    isLoading: isLoadingCollections,
    isFetching: isFetchingCollections,
    refetch: refetchCollections,
  } = useQuery({
    queryKey: ["builder-collections", activeSection?.id],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get(
          `/admin/collections?t=${Date.now()}`
        );
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      } catch (error) {
        console.error("Failed to fetch collections:", error);
        return [];
      }
    },
    enabled: !!activeSection && needsCollectionsData,
  });

  // ✅ NEW: Fetch categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["builder-categories", activeSection?.id],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get(
          `/admin/categories?t=${Date.now()}`
        );
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
    enabled: !!activeSection && needsCategoriesData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform categories to the format expected by CategorySelector
  const transformedCategories: Category[] = useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return [];
    
    return categoriesData.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.productCount || 0,
      icon: cat.icon || null,
      image: cat.image || null,
    }));
  }, [categoriesData]);

  // ============================================================
  // 5. HANDLERS
  // ============================================================

  const handleUpdate = useCallback(
    (settings: Record<string, any>) => {
      if (!activeSection) return;
      updateSectionSettings(activeSection.id, settings);
      onUpdate?.();
    },
    [activeSection, updateSectionSettings, onUpdate]
  );

  // ============================================================
  // 6. RENDER: EMPTY STATE
  // ============================================================

  if (!activeSection) {
    return (
      <div className="flex items-center justify-center h-full text-xs font-black text-zinc-300 uppercase tracking-widest">
        Select a block to configure
      </div>
    );
  }

  // ============================================================
  // 7. RENDER: SECTION CONFIG
  // ============================================================

  const config = SECTION_CONFIG_REGISTRY[activeSection.type];
  if (!config) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-zinc-500">
          No configuration available for {activeSection.type.replace("_", " ")}
        </p>
      </div>
    );
  }

  // ============================================================
  // 8. SPECIAL CASE: CATEGORY ICON STRIP
  // ============================================================
  if (activeSection.type === "CATEGORY_ICON_STRIP") {
    // Ensure settings have all required fields with defaults
    const defaultSettings: CategoryIconStripSettings = {
      title: "Shop by Category",
      subtitle: "",
      categoryIds: [],
      displayCount: 12,
      layout: "grid",
      columns: "5",
      showProductCount: true,
      imageSize: "medium",
      showCategoryNames: true,
      imageShape: "circle",
    };

    // Merge existing settings with defaults
    const mergedSettings: CategoryIconStripSettings = {
      ...defaultSettings,
      ...activeSection.settings,
    };

    // Debug: Log categories data
    console.log('SectionConfigPanel - Categories:', {
      needsCategoriesData,
      categoriesData: categoriesData?.length || 0,
      transformedCategories: transformedCategories.length,
      isLoadingCategories,
    });

    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div>
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
            Category Icon Strip
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
            Block Configuration
          </p>
        </div>

        <CategoryStripSettings
          sectionId={activeSection.id}
          settings={mergedSettings}
          onUpdate={handleUpdate}
          categories={transformedCategories}
          isLoadingCategories={isLoadingCategories}
        />
      </div>
    );
  }

  // ============================================================
  // 9. RENDER: OTHER SECTIONS
  // ============================================================
  const ConfigComponent = config.component;

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
          {activeSection.type.replace("_", " ")}
        </h3>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
          Block Configuration
        </p>
      </div>

      <ConfigComponent
        section={activeSection}
        collections={collections || []}
        isLoadingCollections={isLoadingCollections}
        isFetching={isFetchingCollections}
        onUpdate={handleUpdate}
        onRefreshCollections={refetchCollections}
      />
    </div>
  );
}