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
  const { sections, activeSectionId, updateSectionSettings } =  useStorefrontStore();

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
  // 🔥 Both blocks need the Collections data now (one for buttons, one for dropdown)

  const needsCollectionsData = isCollectionBlock || isProductCarousel || isVideoShoppable;

  // 2. ADD LOCAL STATE FOR MODAL
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);

  // FETCH COLLECTIONS
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
          `/admin/collections?t=${Date.now()}`,
        );
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      } catch (error) {
        console.error("Failed to fetch collections:", error);
        return [];
      }
    },
    enabled: needsCollectionsData, // 🚨 Now triggers for the Carousel too!
  });

  if (!activeSection) {
    return (
      <div className="flex items-center justify-center h-full text-xs font-black text-zinc-300 uppercase tracking-widest">
        Select a block to configure
      </div>
    );
  }
  const selectedCollectionId =
    typeof activeSection.settings?.collectionId === "string"
      ? activeSection.settings.collectionId
      : "";

  const handleSelectCollection = (id: string, slug: string) => {
    updateSectionSettings(activeSection.id, {
      collectionId: id,
      collectionSlug: slug,
    });
  };

  const safeCollections = collections || [];

  const IMAGE_GUIDELINES = {
    HERO: "1920×800px • 16:9 • Max 500KB • WebP preferred",
    PROMO_BANNER: "1200×500px • 12:5 • Max 300KB • WebP/JPG",
    BRAND_STORY: "800×600px • 4:3 • Max 300KB • WebP/JPG",
    BLOG_SECTION: "1200×630px • 1.91:1 • Max 300KB • WebP/JPG",
    PRODUCT: "800×800px • 1:1 • Max 200KB • WebP",
  };

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
      {/* 3. ADD MODAL AT THE TOP LEVEL OF THE RETURN */}
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
          updateSectionSettings(activeSection.id, { slides: updatedSlides });
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

      <div className="space-y-8">
        {/* TITLE INPUT */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Section Title
          </label>
          <input
            type="text"
            className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all"
            value={(activeSection.settings.title as string) || ""}
            onChange={(e) =>
              updateSectionSettings(activeSection.id, { title: e.target.value })
            }
            placeholder="e.g. Featured Collection"
          />
        </div>

        {/* COLLECTIONS SELECTOR (Only shows for the explicit COLLECTIONS grid block) */}
        {isCollectionBlock && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Select One Collection to Preview
              </label>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="text-[10px] flex items-center gap-1 font-bold text-[#006044] hover:underline disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`}
                />
                Reload Data
              </button>
            </div>

            {isLoadingCollections ||
            (isFetching && safeCollections.length === 0) ? (
              <div className="text-sm font-medium text-zinc-500 animate-pulse">
                Loading collections...
              </div>
            ) : safeCollections.length === 0 ? (
              <div className="text-sm font-medium text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                No collections found. Click 'Reload Data' to fetch again.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {safeCollections.map((col: any) => {
                  const isSelected = selectedCollectionId === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleSelectCollection(col.id, col.slug)}
                      className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                        isSelected
                          ? "bg-[#006044] text-white border-[#006044] shadow-md scale-105"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-[#006044] hover:bg-green-50"
                      }`}
                    >
                      {col.name} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* IMAGE UPLOAD */}
        {["PROMO_BANNER", "BRAND_STORY"].includes(activeSection.type) && (
          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Banner Image *
            </label>
            <div className="flex gap-4 flex-wrap">
              {activeSection.settings.imageUrl ? (
                <div className="relative h-40 w-full rounded-3xl overflow-hidden border shadow-sm group">
                  <img
                    src={activeSection.settings.imageUrl as string}
                    className="h-full w-full object-cover"
                    alt="Banner"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateSectionSettings(activeSection.id, {
                        imageUrl: null,
                      })
                    }
                    className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-red-50 hover:text-red-500"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <CldUploadWidget
                  uploadPreset={
                    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                  }
                  onSuccess={(result: any) => {
                    if (result.event === "success") {
                      const fileSizeKB = result.info.bytes / 1024;

                      if (fileSizeKB > 500) {
                        alert("Image too large. Please upload under 500KB.");
                        return;
                      }
                      updateSectionSettings(activeSection.id, {
                        imageUrl: result.info.secure_url,
                      });
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="h-40 w-full border-2 border-dashed border-zinc-300 rounded-3xl flex flex-col items-center justify-center text-zinc-400 hover:border-[#006044] hover:bg-green-50 transition-all"
                    >
                      <Upload size={28} />
                      <span className="text-[10px] font-black mt-3 tracking-widest uppercase">
                        Upload Photo
                      </span>
                    </button>
                  )}
                </CldUploadWidget>
              )}
            </div>
            {/* 👇 ADD THIS */}
            <p className="mt-3 px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-semibold">
              ⚠ Recommended:{" "}
              <span className="font-bold">
                {
                  IMAGE_GUIDELINES[
                    activeSection.type as keyof typeof IMAGE_GUIDELINES
                  ]
                }
              </span>
            </p>
          </div>
        )}
        {activeSection.type === "PROMO_BANNER" && (
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Button Text
              </label>
              <input
                type="text"
                placeholder="e.g. Shop Now"
                className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white"
                value={(activeSection.settings.buttonText as string) || ""}
                onChange={(e) =>
                  updateSectionSettings(activeSection.id, {
                    buttonText: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Subtitle
              </label>
              <input
                type="text"
                placeholder="e.g. Limited time deal. Don’t miss out."
                className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-medium text-sm bg-white"
                value={(activeSection.settings.subtitle as string) || ""}
                onChange={(e) =>
                  updateSectionSettings(activeSection.id, {
                    subtitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Button Link
              </label>
              <input
                type="text"
                placeholder="/collections/all"
                className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white"
                value={(activeSection.settings.buttonLink as string) || ""}
                onChange={(e) =>
                  updateSectionSettings(activeSection.id, {
                    buttonLink: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}
        {/* MULTI-IMAGE CAROUSEL UPLOAD (Only for HERO) */}
        {activeSection.type === "HERO" && (
          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between items-center">
              <span>Hero Slides (Multi-Image)</span>
              <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                {(activeSection.settings.banners as any[])?.length || 0} Slides
              </span>
            </label>

            {/* List existing slides */}
            <div className="space-y-3">
              {((activeSection.settings.banners as any[]) || []).map(
                (slide, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl"
                  >
                    <img
                      src={slide.imageUrl}
                      alt={`Slide ${index}`}
                      className="w-16 h-12 object-cover rounded-lg border border-zinc-200"
                    />
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        placeholder="Redirect Link (e.g. /collections/summer)"
                        value={slide.link || ""}
                        onChange={(e) => {
                          const newBanners = [
                            ...(activeSection.settings.banners as any[]),
                          ];
                          newBanners[index].link = e.target.value;
                          updateSectionSettings(activeSection.id, {
                            banners: newBanners,
                          });
                        }}
                        className="w-full text-xs p-2 border border-zinc-200 rounded-lg outline-none focus:border-[#006044]"
                      />
                    </div>
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
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                ),
              )}
            </div>

            {/* Upload New Slide Button */}
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={(result: any) => {
                if (result.event === "success") {
                  const fileSizeKB = result.info.bytes / 1024;

                  if (fileSizeKB > 500) {
                    alert("Image too large. Please upload under 500KB.");
                    return;
                  }
                  const currentBanners =
                    (activeSection.settings.banners as any[]) || [];
                  updateSectionSettings(activeSection.id, {
                    banners: [
                      ...currentBanners,
                      { imageUrl: result.info.secure_url, link: "" },
                    ],
                  });
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full py-4 border-2 border-dashed border-[#006044]/30 rounded-2xl flex items-center justify-center gap-2 text-[#006044] font-bold text-xs hover:bg-[#006044]/5 transition-all"
                >
                  <Upload size={16} /> Add New Slide
                </button>
              )}
            </CldUploadWidget>
            {/* 👇 ADD THIS */}
            <p className="mt-3 px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-semibold">
              ⚠ Recommended:{" "}
              <span className="font-bold">
                {
                  IMAGE_GUIDELINES[
                    activeSection.type as keyof typeof IMAGE_GUIDELINES
                  ]
                }
              </span>
            </p>
          </div>
        )}

        {/* BRAND STORY CONFIGURATION */}
        {activeSection.type === "BRAND_STORY" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Description
              </label>
              <textarea
                className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-medium text-sm bg-white focus:ring-2 focus:ring-[#006044]"
                value={(activeSection.settings.description as string) || ""}
                onChange={(e) =>
                  updateSectionSettings(activeSection.id, {
                    description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Button Text
                </label>
                <input
                  type="text"
                  className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white"
                  value={(activeSection.settings.buttonText as string) || ""}
                  onChange={(e) =>
                    updateSectionSettings(activeSection.id, {
                      buttonText: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Button Link
                </label>
                <input
                  type="text"
                  className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white"
                  value={(activeSection.settings.buttonLink as string) || ""}
                  onChange={(e) =>
                    updateSectionSettings(activeSection.id, {
                      buttonLink: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Reuse your existing Image Upload Logic here for the Story Image */}
          </div>
        )}

        {activeSection.type === "BRAND_STORY" && (
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Image Alignment
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl">
              {(["left", "right"] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() =>
                    updateSectionSettings(activeSection.id, { layout: pos })
                  }
                  className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    (activeSection.settings.layout || "left") === pos
                      ? "bg-white text-[#006044] shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TRUST BADGES CONFIGURATION */}
        {activeSection.type === "TRUST_BADGES" && (
          <div className="pt-4">
            <TrustBadgeSelector
              selectedIds={
                (activeSection.settings.selectedIds as string[]) || []
              }
              onChange={(ids) =>
                updateSectionSettings(activeSection.id, { selectedIds: ids })
              }
            />
          </div>
        )}

        {/* ========================================== */}
        {/* 1. DYNAMIC DROPDOWN (ONLY FOR PRODUCT CAROUSEL) */}
        {/* ========================================== */}
        {activeSection.type === "PRODUCT_CAROUSEL" && (
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Data Source (Backend Key)
            </label>
            <div className="relative">
              <select
                className="w-full p-4 pr-10 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all cursor-pointer appearance-none"
                value={(activeSection.settings.dataSource as string) || ""}
                onChange={(e) =>
                  updateSectionSettings(activeSection.id, {
                    dataSource: e.target.value,
                  })
                }
              >
                <option value="" disabled>
                  Select a Data Source...
                </option>

                {safeCollections && safeCollections.length > 0 && (
                  <optgroup label="Your Collections">
                    {safeCollections.map((col: any) => (
                      <option key={col.id} value={`collection_${col.slug}`}>
                        Collection: {col.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-400">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            <p className="text-[10px] font-bold text-zinc-400 mt-1">
              Select which database array feeds this block.
            </p>
            {/* SHOW HIGHLIGHTS TOGGLE */}
            <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer">
                Show Product Badges
              </label>
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#006044] cursor-pointer"
                checked={!!activeSection.settings.showHighlights}
                onChange={(e) =>
                  updateSectionSettings(activeSection.id, {
                    showHighlights: e.target.checked,
                  })
                }
              />
            </div>
          </div>
        )}

        {/* BLOG SECTION CONFIGURATION */}
        {activeSection.type === "BLOG_SECTION" && (
          <div className="space-y-6 pt-4 border-t border-zinc-100">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Subtitle
              </label>
              <input
                type="text"
                placeholder="e.g. Expert tips, ingredient science, and beauty insights"
                className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-medium text-sm bg-white focus:ring-2 focus:ring-[#006044]"
                value={(activeSection.settings.subtitle as string) || ""}
                onChange={(e) =>
                  updateSectionSettings(activeSection.id, {
                    subtitle: e.target.value,
                  })
                }
              />
            </div>
            {/* Using the standard Data Source Input we built earlier for 'blogs' key */}
          </div>
        )}

        {/* 4. REPLACEMENT FOR VIDEO_SHOPPABLE CONFIG */}

        {/* 4. REPLACEMENT FOR VIDEO_SHOPPABLE CONFIG */}
        {activeSection.type === "VIDEO_SHOPPABLE" && (
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            {/* ✅ DYNAMIC SUBTITLE INPUT */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Subtitle
              </label>
              <input
                type="text"
                placeholder="e.g. Watch, learn, and shop our expert recommendations"
                className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-medium text-sm bg-white focus:ring-2 focus:ring-[#006044]"
                value={(activeSection.settings.subtitle as string) || ""}
                onChange={(e) =>
                  updateSectionSettings(activeSection.id, {
                    subtitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Video & Product Pairs (Reels)
              </label>
              <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full text-xs">
                {(activeSection.settings.slides as any[])?.length || 0} items
              </span>
            </div>

            <div className="space-y-4">
              {((activeSection.settings.slides as any[]) || []).map(
                (slide, index) => (
                  <div
                    key={index}
                    className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4 relative"
                  >
                    {/* Delete Slide Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newSlides = [...activeSection.settings.slides];
                        newSlides.splice(index, 1);
                        updateSectionSettings(activeSection.id, {
                          slides: newSlides,
                        });
                      }}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors z-10"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Cloudinary Video Upload Section */}
                    <div>
                      <label className="text-xs font-bold text-zinc-600 mb-2 block">
                        1. Media (Video/GIF)
                      </label>
                      {slide.videoUrl ? (
                        <div className="flex items-center gap-3 bg-white p-2 border border-zinc-200 rounded-xl relative group">
                          {/* 🚨 FIX: Bulletproof Media Renderer */}
                          {slide.videoUrl.match(/\.(mp4|webm|mov|ogg)$/i) ||
                          slide.videoUrl.includes("/video/") ? (
                            <video
                              src={slide.videoUrl}
                              className="w-12 h-12 rounded-lg object-cover bg-black"
                              muted
                              autoPlay
                              loop
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={slide.videoUrl}
                              className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-200"
                              alt="Media"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.png";
                              }}
                            />
                          )}

                          <div className="flex-1 min-w-0 pr-8">
                            <p
                              className="text-[10px] text-zinc-500 truncate"
                              title={slide.videoUrl}
                            >
                              {slide.videoUrl.split("/").pop() || "Media File"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newSlides = [
                                ...activeSection.settings.slides,
                              ];
                              newSlides[index].videoUrl = "";
                              updateSectionSettings(activeSection.id, {
                                slides: newSlides,
                              });
                            }}
                            className="absolute right-2 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <CldUploadWidget
                          uploadPreset={
                            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                          }
                          options={{
                            // Recommend client-side restriction for videos & gifs
                            clientAllowedFormats: ["mp4", "webm", "mov", "gif"],
                          }}
                          onSuccess={(result: any) => {
                            if (result.event === "success") {
                              // Note: Videos are larger! Using a 15MB limit instead of the 500KB image limit.
                              const fileSizeMB =
                                result.info.bytes / (1024 * 1024);
                              if (fileSizeMB > 15) {
                                alert(
                                  "Video is too large. Please upload files under 15MB for optimal performance.",
                                );
                                return;
                              }
                              const newSlides = [
                                ...activeSection.settings.slides,
                              ];
                              newSlides[index].videoUrl =
                                result.info.secure_url;
                              updateSectionSettings(activeSection.id, {
                                slides: newSlides,
                              });
                            }
                          }}
                        >
                          {({ open }) => (
                            <button
                              type="button"
                              onClick={() => open()}
                              className="w-full py-3 border border-dashed border-zinc-300 rounded-xl text-xs font-bold text-zinc-500 hover:border-[#006044] hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <Film size={14} /> Upload Video or GIF
                            </button>
                          )}
                        </CldUploadWidget>
                      )}
                    </div>

                    {/* Linked Product Section */}
                    <div>
                      <label className="text-xs font-bold text-zinc-600 mb-2 block">
                        2. Linked Product (1 Allowed)
                      </label>
                      {slide.product ? (
                        <div className="flex items-center gap-3 bg-white p-3 border border-zinc-200 rounded-xl">
                          <img
                            src={
                              isValidImageUrl(slide.product.image)
                                ? slide.product.image
                                : "/placeholder.png"
                            }
                            alt={slide.product.name || "Product"}
                            className="w-10 h-10 rounded-lg object-cover border bg-zinc-50"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">
                              {slide.product.name}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              ₹{slide.product.price}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setActiveSlideIndex(index);
                              setProductSearchOpen(true);
                            }}
                            className="text-[10px] font-bold text-[#006044] hover:underline whitespace-nowrap"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveSlideIndex(index);
                            setProductSearchOpen(true);
                          }}
                          className="w-full py-3 border border-dashed border-zinc-300 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
                        >
                          + Search & Select Product
                        </button>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const currentSlides = activeSection.settings.slides || [];
                updateSectionSettings(activeSection.id, {
                  slides: [...currentSlides, { videoUrl: "", product: null }],
                });
              }}
              className="w-full py-4 border-2 border-dashed border-[#006044]/30 rounded-2xl flex items-center justify-center gap-2 text-[#006044] font-bold text-xs hover:bg-[#006044]/5 transition-all"
            >
              <Film size={16} /> Add Video Reel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
