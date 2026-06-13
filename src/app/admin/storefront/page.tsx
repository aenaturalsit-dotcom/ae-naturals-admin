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
  { type: "WHATSAPP_WIDGET", label: "WhatsApp Chat" },
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

      return adminService.updateThemeConfig({
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
      <div className="flex  items-center justify-center">
        <Loader2 className="animate-spin text-[#006044] w-8 h-8" />
      </div>
    );

  return (
    <div className="flex flex-col  overflow-hidden bg-gray-100">
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
      {/* Builder Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
        {/* TOP PREVIEW */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="h-[420px] overflow-y-auto">
            <HomeRenderer
              key={JSON.stringify(
                store.sections.map((s) => ({
                  id: s.id,
                  settings: s.settings,
                })),
              )}
              config={{ sectionsOrder: store.sections }}
              data={{
                ...(homeData as any)?.data,
                collections:
                  (homeData as any)?.collections ||
                  (homeData as any)?.data?.collections ||
                  [],
              }}
              previewMode={true}
            />
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-[320px_420px_1fr] gap-6 flex-1 min-h-0">
          {/* COLUMN 1 - ADD BLOCKS */}
          <div className="bg-white border rounded-xl p-5 overflow-y-auto">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Add Block
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SECTIONS.map((block) => (
                <button
                  key={block.type}
                  onClick={() => store.addSection(block.type as any)}
                  className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:border-[#006044] hover:bg-[#006044]/5 text-xs font-bold text-gray-700 h-24"
                >
                  <Plus size={16} className="mb-2 text-gray-400" />
                  {block.label}
                </button>
              ))}
            </div>
          </div>

          {/* COLUMN 2 - ACTIVE SEQUENCE */}
          <div className="bg-white border rounded-xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Active Sequence
              </h2>

              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {store.sections.length}
              </span>
            </div>

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
          </div>

          {/* COLUMN 3 - CONFIG */}
          <div className="bg-white border rounded-xl overflow-y-auto">
            <SectionConfigPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
