// src/app/admin/storefront/page.tsx

"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Loader2,
  Plus,
  Save,
  Store,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { SortableSectionItem } from "./SortableSectionItem";
import { SectionConfigPanel } from "./SectionConfigPanel";
import HomeRenderer from "@/components/home/HomeRenderer";
import { logger } from "@/utils/logger";
import toast from "react-hot-toast";

// Types
import type { ThemeSection } from "@/lib/validators/storefront";

const AVAILABLE_SECTIONS = [
  { type: "HERO" as const, label: "Hero Banner" },
  { type: "TRUST_BADGES" as const, label: "Trust Badges" },
  { type: "COLLECTIONS" as const, label: "Collections Grid" },
  { type: "PRODUCT_CAROUSEL" as const, label: "Product Carousel" },
  { type: "FEATURED_PRODUCTS" as const, label: "Featured Products" },
  { type: "PROMO_BANNER" as const, label: "Promotional Banner" },
  { type: "BRAND_STORY" as const, label: "Brand Story" },
  { type: "BLOG_SECTION" as const, label: "Journal / Blog" },
  { type: "VIDEO_SHOPPABLE" as const, label: "Video + Products" },
  { type: "WHATSAPP_WIDGET" as const, label: "WhatsApp Chat" },
  { type: "CATEGORY_ICON_STRIP" as const, label: "Category Icon Strip" },
] as const;

export default function StorefrontBuilderPage() {
  const queryClient = useQueryClient();
  const store = useStorefrontStore();

  const [previewKey, setPreviewKey] = useState(0);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isInitialRender = useRef(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ============================================================
  // 3. DATA FETCHING WITH FORCE REFRESH
  // ============================================================

  const {
    data: homeData,
    isLoading,
    refetch,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["store-home-config"],
    queryFn: async () => {
      logger.log("📡 Fetching homepage config...");
      const res = await adminService.getHomepageData();
      
      // Log the Category Icon Strip data
      const categoryStrip = res?.config?.sectionsOrder?.find(
        (s: any) => s.type === "CATEGORY_ICON_STRIP"
      );
      if (categoryStrip) {
        logger.log("📦 Category Strip Data:", {
          itemsCount: categoryStrip.settings?.items?.length || 0,
          items: categoryStrip.settings?.items || [],
          legacy: categoryStrip.settings?._legacy || false,
        });
      }
      
      return res;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // ============================================================
  // 4. EFFECTS - Force sync with backend data
  // ============================================================

  // Initialize store with fetched data
  useEffect(() => {
    if (homeData && (homeData as any).config?.sectionsOrder) {
      const sections = (homeData as any).config.sectionsOrder;
      logger.log("🔄 Hydrating sections from backend", { count: sections.length });
      
      // Find Category Icon Strip and log its items
      const categoryStrip = sections.find((s: any) => s.type === "CATEGORY_ICON_STRIP");
      if (categoryStrip) {
        const items = categoryStrip.settings?.items || [];
        logger.log(`📦 Category Strip has ${items.length} items:`, items);
      }
      
      store.setInitialSections(sections);
      
      // Force preview update after data loads
      setTimeout(() => {
        setPreviewKey((prev) => prev + 1);
      }, 100);
    }
  }, [homeData]);

  // Force preview update when sections change in store
  useEffect(() => {
    if (!isInitialRender.current) {
      setPreviewKey((prev) => prev + 1);
    }
    isInitialRender.current = false;
  }, [store.sections]);

  // ============================================================
  // 5. DATA PREPARATION
  // ============================================================

  const rendererData = useMemo(() => {
    const rawData = (homeData as any)?.data || {};
    return {
      featuredProducts: rawData.featuredProducts || [],
      collections: rawData.collections || [],
      blogs: rawData.blogs || [],
      banners: rawData.banners || [],
      categories: rawData.categories || [],
    };
  }, [homeData]);

  // ============================================================
  // 6. SAVE MUTATION - Force refresh after save
  // ============================================================

  const saveMutation = useMutation({
    mutationFn: async () => {
      const storeId = (homeData as any)?.storeId;
      if (!storeId) {
        throw new Error("Store ID missing");
      }

      // Clean up sections for saving
      const sectionsToSave = store.sections.map((section) => ({
        id: section.id,
        type: section.type,
        isActive: section.isActive,
        settings: section.settings,
      }));

      // Log what we're saving
      const categoryStrip = sectionsToSave.find((s) => s.type === "CATEGORY_ICON_STRIP");
      if (categoryStrip) {
        logger.log("💾 Saving Category Strip:", {
          itemsCount: categoryStrip.settings?.items?.length || 0,
          items: categoryStrip.settings?.items || [],
        });
      }

      return adminService.updateThemeConfig({
        sectionsOrder: sectionsToSave,
      });
    },
    onSuccess: async () => {
      logger.log("✅ Layout saved successfully");
      
      // IMPORTANT: Force refetch from server
      toast.loading("Refreshing preview...", { id: "save-refresh" });
      
      // Invalidate cache
      await queryClient.invalidateQueries({ queryKey: ["store-home-config"] });
      
      // Force refetch
      const result = await refetch();
      
      // Update store with fresh data
      if (result.data?.config?.sectionsOrder) {
        const sections = result.data.config.sectionsOrder;
        store.setInitialSections(sections);
        
        // Log the updated data
        const categoryStrip = sections.find((s: any) => s.type === "CATEGORY_ICON_STRIP");
        if (categoryStrip) {
          logger.log("📦 Updated Category Strip:", {
            itemsCount: categoryStrip.settings?.items?.length || 0,
          });
        }
      }
      
      store.resetDirty();
      setLastSaved(new Date());
      toast.success("✅ Published successfully!", { id: "save-refresh" });
      
      // Force multiple preview refreshes to ensure update
      setPreviewKey((prev) => prev + 1);
      setTimeout(() => setPreviewKey((prev) => prev + 1), 200);
      setTimeout(() => setPreviewKey((prev) => prev + 1), 500);
    },
    onError: (err: any) => {
      logger.error("❌ Failed to save", err);
      toast.error(`Failed: ${err?.message || "Please try again."}`);
    },
  });

  const handleSave = useCallback(() => {
    if (!store.isDirty) {
      toast("No changes to save", { icon: "ℹ️" });
      return;
    }
    saveMutation.mutate();
  }, [store.isDirty, saveMutation]);

  // ============================================================
  // 7. HANDLERS
  // ============================================================

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = store.sections.findIndex((s) => s.id === active.id);
    const newIndex = store.sections.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      store.reorderSections(oldIndex, newIndex);
      setPreviewKey((prev) => prev + 1);
    }
  }, [store.sections]);

  const handleAddSection = useCallback((type: ThemeSection["type"]) => {
    store.addSection(type);
    setPreviewKey((prev) => prev + 1);
    toast.success(`Added ${type.replace("_", " ")} section`);
  }, [store.addSection]);

  const handleRefreshPreview = useCallback(async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing preview...", { id: "refresh" });
    
    try {
      // Force refetch
      await queryClient.invalidateQueries({ queryKey: ["store-home-config"] });
      const result = await refetch();
      
      // Update store with fresh data
      if (result.data?.config?.sectionsOrder) {
        store.setInitialSections(result.data.config.sectionsOrder);
      }
      
      // Force preview refresh
      setPreviewKey((prev) => prev + 1);
      setTimeout(() => setPreviewKey((prev) => prev + 1), 100);
      
      toast.success("✅ Preview refreshed", { id: "refresh" });
    } catch (error) {
      logger.error("❌ Refresh failed", error);
      toast.error("Failed to refresh", { id: "refresh" });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, queryClient]);

  const handleSectionUpdate = useCallback(() => {
    setPreviewKey((prev) => prev + 1);
  }, []);

  // ============================================================
  // 8. RENDER
  // ============================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#006044] w-10 h-10 mx-auto" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load</h2>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#006044] text-white rounded-lg font-medium hover:bg-[#004d36]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[200vh] overflow-hidden bg-gray-100">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black flex items-center gap-2 tracking-tight text-gray-900">
            <Store className="text-[#006044]" /> Storefront Builder
          </h1>
          {store.isDirty && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full animate-pulse">
              • Unsaved Changes
            </span>
          )}
          {lastSaved && !store.isDirty && (
            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefreshPreview}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!store.isDirty || saveMutation.isPending}
            className="flex items-center gap-2 bg-[#006044] hover:bg-[#004d36] transition-colors text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50 uppercase tracking-wider shadow-md min-w-[180px] justify-center"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {store.isDirty ? "Publish Changes*" : "Publish Changes"}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-4 md:gap-6">
        {/* PREVIEW */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex-shrink-0">
          <div className="h-[350px] md:h-[420px] overflow-y-auto p-2">
            <HomeRenderer
              key={`preview-${previewKey}`}
              config={{ sectionsOrder: store.sections }}
              data={rendererData}
              previewMode={true}
            />
          </div>
        </div>

        {/* BOTTOM - 3 Panes */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_380px_1fr] gap-4 md:gap-6 flex-1 min-h-0">
          {/* COLUMN 1 - ADD BLOCKS */}
          <div className="bg-white border rounded-xl p-4 md:p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Add Block</h2>
              <span className="text-[10px] font-medium text-gray-400">{store.sections.length} total</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SECTIONS.map((block) => (
                <button
                  key={block.type}
                  onClick={() => handleAddSection(block.type)}
                  className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-[#006044] hover:bg-[#006044]/5 text-xs font-bold text-gray-700 h-20 md:h-24 transition-all group"
                >
                  <Plus size={16} className="mb-1.5 text-gray-400 group-hover:text-[#006044]" />
                  {block.label}
                </button>
              ))}
            </div>
          </div>

          {/* COLUMN 2 - ACTIVE SEQUENCE */}
          <div className="bg-white border rounded-xl p-4 md:p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Sequence</h2>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {store.sections.length}
              </span>
            </div>
            {store.sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Plus size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-400">No sections yet</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={store.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {store.sections.map((section) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        onToggle={handleSectionUpdate}
                        onDuplicate={handleSectionUpdate}
                        onDelete={handleSectionUpdate}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* COLUMN 3 - CONFIG */}
          <div className="bg-white border rounded-xl overflow-y-auto">
            <SectionConfigPanel onUpdate={handleSectionUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}