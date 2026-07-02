// src/app/admin/storefront/SectionConfigPanel.tsx

"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
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
import type {
  CategoryIconStripSettings,
  ThemeSection,
} from "@/lib/validators/storefront";
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

interface Collection {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

// ============================================================
// 2. SECTION CONFIG REGISTRY
// ============================================================

interface SectionConfig {
  component: React.ComponentType<any>;
  label: string;
  needsCollections?: boolean;
  needsCategories?: boolean;
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
    needsCategories: true,
    needsCollections: true, // ✅ ADD THIS - Collections are needed
  },
};

// ============================================================
// 3. MAIN COMPONENT
// ============================================================

export function SectionConfigPanel({ onUpdate }: SectionConfigPanelProps) {
  const { sections, activeSectionId, updateSectionSettings } =
    useStorefrontStore();

  const activeSection = sections.find((s) => s.id === activeSectionId);
  
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (activeSection) {
      setLocalSettings(activeSection.settings || {});
    }
  }, [activeSection]);

  // ============================================================
  // 4. DATA FETCHING
  // ============================================================

  const needsCollectionsData = useMemo(() => {
    if (!activeSection) return false;
    const config = SECTION_CONFIG_REGISTRY[activeSection.type];
    return config?.needsCollections || false;
  }, [activeSection]);

  const needsCategoriesData = useMemo(() => {
    if (!activeSection) return false;
    const config = SECTION_CONFIG_REGISTRY[activeSection.type];
    return config?.needsCategories || false;
  }, [activeSection]);

  // ✅ FETCH COLLECTIONS
  const {
    data: collectionsData = [],
    isLoading: isLoadingCollections,
    isFetching: isFetchingCollections,
    refetch: refetchCollections,
  } = useQuery({
    queryKey: ["builder-collections", activeSection?.id],
    queryFn: async () => {
      try {
        console.log("📡 Fetching collections...");
        const res: any = await apiClient.get(
          `/admin/collections?t=${Date.now()}`,
        );
        const data = Array.isArray(res) ? res : res?.data || [];
        console.log(`✅ Fetched ${data.length} collections:`, data.slice(0, 3));
        return data;
      } catch (error) {
        console.error("❌ Failed to fetch collections:", error);
        return [];
      }
    },
    enabled: !!activeSection && needsCollectionsData,
    staleTime: 0,
    refetchOnMount: true,
  });

  // ✅ FETCH CATEGORIES
  const {
    data: categoriesData = [],
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["builder-categories", activeSection?.id],
    queryFn: async () => {
      try {
        console.log("📡 Fetching categories...");
        const res: any = await apiClient.get(
          `/admin/categories?t=${Date.now()}`,
        );
        const data = Array.isArray(res) ? res : res?.data || [];
        console.log(`✅ Fetched ${data.length} categories:`, data.slice(0, 3));
        return data;
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
        return [];
      }
    },
    enabled: !!activeSection && needsCategoriesData,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Transform categories
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

  // ✅ Transform collections
  const transformedCollections: Collection[] = useMemo(() => {
    if (!collectionsData || !Array.isArray(collectionsData)) return [];
    return collectionsData.map((col: any) => ({
      id: col.id,
      name: col.name,
      slug: col.slug,
      image: col.image || null,
    }));
  }, [collectionsData]);

  // ============================================================
  // 5. HANDLERS
  // ============================================================

  const handleUpdate = useCallback(
    (settings: Record<string, any>) => {
      if (!activeSection) return;
      
      setLocalSettings(settings);
      updateSectionSettings(activeSection.id, settings);
      
      if (onUpdate) {
        onUpdate();
      }
      
      console.log("📝 Settings updated:", {
        sectionId: activeSection.id,
        settings,
      });
    },
    [activeSection, updateSectionSettings, onUpdate],
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
    const defaultSettings = {
      title: "Shop by Category",
      subtitle: "",
      items: [],
      displayCount: 12,
      layout: "scrollable",
      columns: "5",
      showProductCount: true,
      imageSize: "medium",
      showCategoryNames: true,
      imageShape: "circle",
      _legacy: false,
      _legacyCategoryIds: [],
    };

    const currentSettings = localSettings || activeSection.settings || {};
    const mergedSettings = { ...defaultSettings, ...currentSettings };

    if (!mergedSettings.items || !Array.isArray(mergedSettings.items)) {
      mergedSettings.items = [];
    }

    // ✅ Log what we're passing
    console.log("📦 CategoryStripSettings props:", {
      categoriesCount: transformedCategories.length,
      collectionsCount: transformedCollections.length,
      itemsCount: mergedSettings.items?.length || 0,
    });

    return (
      <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-full">
        <div>
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
            Category Icon Strip
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
            Block Configuration
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500">
              {mergedSettings.items?.length || 0} items configured
            </span>
            <span className="text-xs text-green-600">
              {transformedCategories.length} categories available
            </span>
            <span className="text-xs text-blue-600">
              {transformedCollections.length} collections available
            </span>
            {isLoadingCategories || isLoadingCollections ? (
              <span className="text-xs text-blue-500 animate-pulse">Loading...</span>
            ) : null}
          </div>
        </div>

        <CategoryStripSettings
          sectionId={activeSection.id}
          settings={mergedSettings}
          onUpdate={handleUpdate}
          categories={transformedCategories}
          collections={transformedCollections} // ✅ PASS COLLECTIONS
          isLoadingCategories={isLoadingCategories || isLoadingCollections}
          onRefreshPreview={onUpdate}
        />
      </div>
    );
  }

  // ============================================================
  // 9. RENDER: OTHER SECTIONS
  // ============================================================
  const ConfigComponent = config.component;

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-full">
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
        collections={collectionsData || []}
        isLoadingCollections={isLoadingCollections}
        isFetching={isFetchingCollections}
        onUpdate={handleUpdate}
        onRefreshCollections={refetchCollections}
      />
    </div>
  );
}