// src/components/admin/sections/configs/VideoShoppableConfig.tsx

"use client";

import React, { useState } from "react";
import { Film, Trash2, X, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import {
  TitleInput,
  SubtitleInput,
} from "@/components/admin/shared/SectionConfigShared";
import { AdminProductSearchModal } from "@/app/admin/AdminProductSearchModal";
import type { ThemeSection } from "@/lib/validators/storefront";

interface VideoShoppableConfigProps {
  section: ThemeSection;
  onUpdate: (settings: Record<string, any>) => void;
}

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

export function VideoShoppableConfig({
  section,
  onUpdate,
}: VideoShoppableConfigProps) {
  const settings = section.settings || {};
  const slides = settings.slides || [];
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);

  const updateSlides = (newSlides: any[]) => {
    onUpdate({ slides: newSlides });
  };

  const handleAddSlide = () => {
    updateSlides([...slides, { videoUrl: "", product: null }]);
  };

  const handleRemoveSlide = (index: number) => {
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    updateSlides(newSlides);
  };

  const handleSlideChange = (index: number, field: string, value: any) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    updateSlides(newSlides);
  };

  const handleProductSelect = (product: any) => {
    if (activeSlideIndex === null) return;
    const newSlides = [...slides];
    newSlides[activeSlideIndex].product = {
      id: product.id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      image: product.images?.[0]?.url || product.image || null,
    };
    updateSlides(newSlides);
  };

  return (
    <div className="space-y-4 pt-4">
      <AdminProductSearchModal
        isOpen={productSearchOpen}
        onClose={() => {
          setProductSearchOpen(false);
          setActiveSlideIndex(null);
        }}
        onSelect={handleProductSelect}
      />

      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. Watch & Shop"
      />

      <SubtitleInput
        value={settings.subtitle || ""}
        onChange={(value) => onUpdate({ subtitle: value })}
        placeholder="e.g. Watch, learn, and shop our expert recommendations"
      />

      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Video & Product Pairs (Reels)
        </label>
        <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full text-xs">
          {slides.length} items
        </span>
      </div>

      <div className="space-y-4">
        {slides.map((slide: any, index: number) => (
          <div
            key={index}
            className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4 relative"
          >
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => handleRemoveSlide(index)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors z-10"
            >
              <Trash2 size={16} />
            </button>

            {/* Video Upload */}
            <div>
              <label className="text-xs font-bold text-zinc-600 mb-2 block">
                1. Media (Video/GIF)
              </label>
              {slide.videoUrl ? (
                <div className="flex items-center gap-3 bg-white p-2 border border-zinc-200 rounded-xl relative group">
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
                    onClick={() => handleSlideChange(index, "videoUrl", "")}
                    className="absolute right-2 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  options={{
                    multiple: false,
                    clientAllowedFormats: ["mp4", "webm", "mov", "gif"],
                  }}
                  onSuccess={(result: any) => {
                    if (result.event === "success") {
                      const fileSizeMB = result.info.bytes / (1024 * 1024);
                      if (fileSizeMB > 15) {
                        alert(
                          "Video is too large. Please upload files under 15MB for optimal performance."
                        );
                        return;
                      }
                      handleSlideChange(index, "videoUrl", result.info.secure_url);
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

            {/* Product Selection */}
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
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSlide}
        className="w-full py-4 border-2 border-dashed border-[#006044]/30 rounded-2xl flex items-center justify-center gap-2 text-[#006044] font-bold text-xs hover:bg-[#006044]/5 transition-all"
      >
        <Film size={16} /> Add Video Reel
      </button>
    </div>
  );
}