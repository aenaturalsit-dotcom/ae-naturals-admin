// src/app/admin/storefront/page.tsx

"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { SortableSectionItem } from "./SortableSectionItem";
import { SectionConfigPanel } from "./SectionConfigPanel";
import HomeRenderer from "@/components/home/HomeRenderer";
import { logger } from "@/utils/logger";
import toast from "react-hot-toast";

// Types
import type { ThemeSection, StorefrontData } from "@/lib/validators/storefront";
import { SECTION_LABELS, SECTION_ICONS } from "@/lib/validators/storefront";

// ============================================================
// 1. CONSTANTS
// ============================================================

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

// ============================================================
// 2. MAIN COMPONENT
// ============================================================

export default function StorefrontBuilderPage() {
  const queryClient = useQueryClient();
  const store = useStorefrontStore();

  // State
  const [previewKey, setPreviewKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ============================================================
  // 3. DATA FETCHING
  // ============================================================

  const {
    data: homeData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["store-home-config"],
    queryFn: async () => {
      logger.log("Fetching homepage config...");
      const res = await adminService.getHomepageData();
      logger.log("Homepage config fetched", res);
      return res;
    },
    staleTime: 0, // Always refetch on mount
    refetchOnMount: true,
  });

  // ============================================================
  // 4. EFFECTS
  // ============================================================

  // Initialize store with fetched data
  useEffect(() => {
    if (homeData && (homeData as any).config?.sectionsOrder) {
      logger.log("Hydrating sections from backend", {
        count: (homeData as any).config.sectionsOrder.length,
      });
      store.setInitialSections((homeData as any).config.sectionsOrder);
    } else {
      logger.warn("No sectionsOrder found in config");
    }
  }, [homeData]);

  // Force preview update when sections change
  useEffect(() => {
    setPreviewKey((prev) => prev + 1);
  }, [store.sections]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (store.isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [store.isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S or Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (store.isDirty) {
          handleSave();
        }
      }
      // Escape to clear selection
      if (e.key === "Escape") {
        store.setActiveSectionId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store.isDirty]);

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
  // 6. MUTATIONS
  // ============================================================

  const saveMutation = useMutation({
    mutationFn: async () => {
      const storeId = (homeData as any)?.storeId;
      if (!storeId) {
        logger.error("Store ID missing during save");
        throw new Error("Store ID missing");
      }

      logger.log("Saving storefront layout...", {
        storeId,
        sectionsCount: store.sections.length,
      });

      return adminService.updateThemeConfig({
        sectionsOrder: store.sections,
      });
    },
    onSuccess: () => {
      logger.log("Layout saved successfully");
      queryClient.invalidateQueries({ queryKey: ["store-home-config"] });
      store.resetDirty();
      toast.success("Layout published successfully 🚀");
      refetch();
      setPreviewKey((prev) => prev + 1);
    },
    onError: (err) => {
      logger.error("Failed to save layout", err);
      toast.error("Failed to save layout. Please try again.");
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

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = store.sections.findIndex((s) => s.id === active.id);
      const newIndex = store.sections.findIndex((s) => s.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        store.reorderSections(oldIndex, newIndex);
        setPreviewKey((prev) => prev + 1);
      }
    },
    [store.sections],
  );

  const handleAddSection = useCallback(
    (type: ThemeSection["type"]) => {
      store.addSection(type);
      setPreviewKey((prev) => prev + 1);
      toast.success(`Added ${type.replace("_", " ")} section`);
    },
    [store.addSection],
  );

  const handleRefreshPreview = useCallback(() => {
    setPreviewKey((prev) => prev + 1);
    toast("Preview refreshed", { icon: "🔄" });
  }, []);

  // ============================================================
  // 8. RENDER: LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#006044] w-10 h-10 mx-auto" />
          <p className="mt-4 text-sm text-gray-500 font-medium">
            Loading storefront builder...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Failed to Load Builder
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            There was an error loading your storefront configuration.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#006044] text-white rounded-lg font-medium hover:bg-[#004d36] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 9. RENDER: MAIN
  // ============================================================

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
        </div>

        <div className="flex items-center gap-3">
          {/* Preview Refresh */}
          <button
            onClick={handleRefreshPreview}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
            title="Refresh Preview (Ctrl+R)"
          >
            <RefreshCw size={16} className="text-gray-500" />
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
        {/* TOP PREVIEW */}
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

        {/* BOTTOM SECTION - 3 Panes */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_380px_1fr] gap-4 md:gap-6 flex-1 min-h-0">
          {/* COLUMN 1 - ADD BLOCKS */}
          <div className="bg-white border rounded-xl p-4 md:p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Add Block
              </h2>
              <span className="text-[10px] font-medium text-gray-400">
                {store.sections.length} total
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SECTIONS.map((block) => (
                <button
                  key={block.type}
                  onClick={() => handleAddSection(block.type)}
                  className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-[#006044] hover:bg-[#006044]/5 text-xs font-bold text-gray-700 h-20 md:h-24 transition-all group"
                >
                  <Plus
                    size={16}
                    className="mb-1.5 text-gray-400 group-hover:text-[#006044] transition-colors"
                  />
                  {block.label}
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px] text-gray-400">
              <div>
                <span className="font-bold text-gray-600">
                  {store.sections.filter((s) => s.isActive).length}
                </span>{" "}
                active
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-600">
                  {store.sections.filter((s) => !s.isActive).length}
                </span>{" "}
                inactive
              </div>
            </div>
          </div>

          {/* COLUMN 2 - ACTIVE SEQUENCE */}
          <div className="bg-white border rounded-xl p-4 md:p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Active Sequence
              </h2>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {store.sections.length}
              </span>
            </div>

            {store.sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Plus size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  No sections yet
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  Add a block from the left panel
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={store.sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {store.sections.map((section) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        onToggle={() => setPreviewKey((prev) => prev + 1)}
                        onDuplicate={() => setPreviewKey((prev) => prev + 1)}
                        onDelete={() => setPreviewKey((prev) => prev + 1)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* COLUMN 3 - CONFIG */}
          <div className="bg-white border rounded-xl overflow-y-auto">
            <SectionConfigPanel
              onUpdate={() => setPreviewKey((prev) => prev + 1)}
            />
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              You have unsaved changes that will be lost if you continue. Are
              you sure you want to leave?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setShowUnsavedWarning(false);
                  // Handle navigation
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
