// src\app\admin\storefront\SectionConfigPanel.tsx



"use client";

import { useStorefrontStore } from "@/store/useStorefrontStore";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, RefreshCw, Film, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import TrustBadgeSelector from "@/components/admin/sections/TrustBadgeSelector";
import { useState } from "react";
import { AdminProductSearchModal } from "../AdminProductSearchModal";

export function SectionConfigPanel() {
  const { sections, activeSectionId, updateSectionSettings } =
    useStorefrontStore();

  const activeSection = sections.find((s) => s.id === activeSectionId);

  const isValidImageUrl = (url?: string) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("/")) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isCollectionBlock = activeSection?.type === "COLLECTIONS";
  const isProductCarousel = activeSection?.type === "PRODUCT_CAROUSEL";
  const isVideoShoppable = activeSection?.type === "VIDEO_SHOPPABLE";
  const isHeroSection = activeSection?.type === "HERO";

  const needsCollectionsData =
    isCollectionBlock ||
    isProductCarousel ||
    isVideoShoppable ||
    isHeroSection;

  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);

  const {
    data: collections,
    isLoading: isLoadingCollections,
    isFetching,
    refetch,
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
    enabled: needsCollectionsData,
  });

  if (!activeSection) {
    return (
      <div className="flex items-center justify-center h-full text-xs font-black text-zinc-300 uppercase tracking-widest">
        Select a block to configure
      </div>
    );
  }

  const safeCollections = collections || [];

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <AdminProductSearchModal
        isOpen={productSearchOpen}
        onClose={() => {
          setProductSearchOpen(false);
          setActiveSlideIndex(null);
        }}
        onSelect={(product) => {
          if (activeSlideIndex === null) return;

          const currentSlides = activeSection.settings.slides || [];
          const updatedSlides = [...currentSlides];

          updatedSlides[activeSlideIndex].product = {
            id: product.id,
            name: product.name,
            price: product.price,
            slug: product.slug,
            image: product.images?.[0]?.url || product.image || null,
          };

          updateSectionSettings(activeSection.id, {
            slides: updatedSlides,
          });
        }}
      />

      <div>
        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
          {activeSection.type.replace("_", " ")}
        </h3>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
          Block Configuration
        </p>
      </div>

      {/* HERO CONFIGURATION */}
      {activeSection.type === "HERO" && (
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Hero Slides
            </label>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-[10px] flex items-center gap-1 font-bold text-[#006044]"
            >
              <RefreshCw
                className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`}
              />
              Reload Collections
            </button>
          </div>

          {/* Existing Slides */}
          <div className="space-y-3">
            {((activeSection.settings.banners as any[]) || []).map(
              (slide, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl"
                >
                  {/* Preview */}
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${index}`}
                    className="w-20 h-14 object-cover rounded-xl border"
                  />

                  {/* Config */}
                  <div className="flex-1 space-y-3">
                    {/* Collection Selector */}
                    <select
                      value={slide.collectionId || ""}
                      onChange={(e) => {
                        const selectedCollection = safeCollections.find(
                          (c: any) => c.id === e.target.value
                        );

                        const newBanners = [
                          ...(activeSection.settings.banners as any[]),
                        ];

                        newBanners[index] = {
                          ...newBanners[index],
                          collectionId: selectedCollection?.id || "",
                          link: selectedCollection
                            ? `/collections/${selectedCollection.slug}`
                            : "",
                        };

                        updateSectionSettings(activeSection.id, {
                          banners: newBanners,
                        });
                      }}
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl outline-none"
                    >
                      <option value="">Select Collection</option>

                      {safeCollections.map((collection: any) => (
                        <option
                          key={collection.id}
                          value={collection.id}
                        >
                          {collection.name}
                        </option>
                      ))}
                    </select>

                    {/* Auto-generated link preview */}
                    <input
                      type="text"
                      value={slide.link || ""}
                      readOnly
                      className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-zinc-100 text-zinc-500"
                    />
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => {
                      const newBanners = (
                        activeSection.settings.banners as any[]
                      ).filter((_, i) => i !== index);

                      updateSectionSettings(activeSection.id, {
                        banners: newBanners,
                      });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              )
            )}
          </div>

          {/* Upload New Hero Slide */}
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(result: any) => {
              if (result.event === "success") {
                const currentBanners =
                  (activeSection.settings.banners as any[]) || [];

                updateSectionSettings(activeSection.id, {
                  banners: [
                    ...currentBanners,
                    {
                      imageUrl: result.info.secure_url,
                      collectionId: "",
                      link: "",
                    },
                  ],
                });
              }
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="w-full py-4 border-2 border-dashed border-[#006044]/30 rounded-2xl flex items-center justify-center gap-2 text-[#006044] font-bold text-xs"
              >
                <Upload size={16} />
                Add New Slide
              </button>
            )}
          </CldUploadWidget>
        </div>
      )}
    </div>
  );
}