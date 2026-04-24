// src/app/admin/storefront/page.tsx

"use client";

import React, { useEffect } from "react";
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
import { Loader2, Plus, Save, Store } from "lucide-react";
import { SortableSectionItem } from "./SortableSectionItem";
import { SectionConfigPanel } from "./SectionConfigPanel";
import HomeRenderer from "@/components/home/HomeRenderer";
import { logger } from "@/utils/logger";
import toast from "react-hot-toast";

// 🚨 UPDATED ARRAY: Added FEATURED_PRODUCTS and renamed CATEGORIES to COLLECTIONS
const AVAILABLE_SECTIONS = [
  { type: "HERO", label: "Hero Banner" },
  { type: "TRUST_BADGES", label: "Trust Badges" },
  { type: "COLLECTIONS", label: "Collections Grid" }, // <-- Changed
  { type: "PRODUCT_CAROUSEL", label: "Product Carousel" },
  { type: "FEATURED_PRODUCTS", label: "Featured Products" }, // <-- Added
  { type: "PROMO_BANNER", label: "Promotional Banner" },
  { type: "BRAND_STORY", label: "Brand Story" },
  { type: "BLOG_SECTION", label: "Journal / Blog" },
  { type: "VIDEO_SHOPPABLE", label: "Video + Products" },
];

export default function StorefrontBuilderPage() {
  const queryClient = useQueryClient();
  const store = useStorefrontStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data: homeData, isLoading } = useQuery({
    queryKey: ["store-home-config"],
    queryFn: async () => {
      logger.log("Fetching homepage config...");
      const res = await adminService.getHomepageData();
      logger.log("Homepage config fetched", res);
      return res;
    },
  });

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

      return adminService.updateThemeConfig(storeId, {
        sectionsOrder: store.sections,
      });
    },
    onSuccess: () => {
      logger.log("Layout saved successfully");
      queryClient.invalidateQueries({ queryKey: ["store-home-config"] });
      store.resetDirty();
      toast.success("Layout published successfully 🚀");
    },
    onError: (err) => {
      logger.error("Failed to save layout", err);
      toast.error("Failed to save layout. Please try again.");
    },
  });

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = store.sections.findIndex((s) => s.id === active.id);
      const newIndex = store.sections.findIndex((s) => s.id === over.id);
      store.reorderSections(oldIndex, newIndex);
    }
  }

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#006044] w-8 h-8" />
      </div>
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b px-6 flex items-center justify-between z-10 shadow-sm">
        <h1 className="text-xl font-black flex items-center gap-2 tracking-tight text-gray-900">
          <Store className="text-[#006044]" /> Storefront Builder
        </h1>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!store.isDirty || saveMutation.isPending}
          className="flex items-center gap-2 bg-[#006044] hover:bg-[#004d36] transition-colors text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50 uppercase tracking-wider shadow-md"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Publish Changes
        </button>
      </header>

      {/* 3-Pane Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANE 1: Blocks & Active Sequence */}
        <div className="w-80 bg-white border-r flex flex-col h-full z-10 overflow-y-auto p-5 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Add Block
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {AVAILABLE_SECTIONS.map((block) => (
              <button
                key={block.type}
                onClick={() => store.addSection(block.type as any)}
                className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-[#006044] hover:bg-[#006044]/5 hover:shadow-sm text-xs font-bold text-gray-700 transition-all text-center h-full"
              >
                <Plus size={16} className="mb-1.5 text-gray-400" />{" "}
                {block.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Active Sequence
            </h2>
            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {store.sections.length}
            </span>
          </div>

          <div className="pb-20">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={store.sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {store.sections.map((section) => (
                  <SortableSectionItem key={section.id} section={section} />
                ))}
              </SortableContext>
            </DndContext>
            {store.sections.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm font-medium mt-2">
                No sections added yet. <br /> Click above to add blocks.
              </div>
            )}
          </div>
        </div>

        {/* PANE 2: Live Preview */}
        <div className="flex-1 bg-gray-100 p-4 md:p-8 flex justify-center overflow-hidden">
          <div className="w-full max-w-[480px] lg:max-w-[768px] xl:max-w-[1200px] bg-white rounded-b-3xl shadow-2xl h-full flex flex-col border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">
            <div className="h-8 bg-gray-100 border-b flex items-center px-4 gap-1.5 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm border border-red-500/20"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm border border-amber-500/20"></div>
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm border border-green-500/20"></div>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <HomeRenderer
                config={{ sectionsOrder: store.sections }}
                data={(homeData as any)?.data || {}}
                previewMode={true}
              />
            </div>
          </div>
        </div>

        {/* PANE 3: Config */}
        <div className="w-[340px] bg-white border-l h-full z-10 overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <SectionConfigPanel />
        </div>
      </div>
    </div>
  );
}