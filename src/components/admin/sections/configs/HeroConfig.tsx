// src/components/admin/sections/configs/HeroConfig.tsx

"use client";

import React, { useState } from "react";
import { Upload, X, RefreshCw, Trash2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useStorefrontStore } from "@/store/useStorefrontStore";
import {
  TitleInput,
  SubtitleInput,
  CollectionSelector,
  ImageGuidelines,
} from "@/components/admin/shared/SectionConfigShared";
import type { ThemeSection } from "@/lib/validators/storefront";

interface HeroConfigProps {
  section: ThemeSection;
  collections: any[];
  isLoadingCollections: boolean;
  isFetching: boolean;
  onUpdate: (settings: Record<string, any>) => void;
  onRefreshCollections: () => void;
}

const IMAGE_FIELDS = [
  { key: "desktopImageUrl", label: "Desktop Image", guide: "1920×800" },
  { key: "tabletImageUrl", label: "Tablet Image", guide: "1200×900" },
  { key: "mobileImageUrl", label: "Mobile Image", guide: "768×1024" },
];

export function HeroConfig({
  section,
  collections,
  isLoadingCollections,
  isFetching,
  onUpdate,
  onRefreshCollections,
}: HeroConfigProps) {
  const settings = section.settings || {};
  const banners = settings.banners || [];
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState<number | null>(
    null
  );

  const updateBanners = (newBanners: any[]) => {
    onUpdate({ banners: newBanners });
  };

  const handleAddSlide = () => {
    updateBanners([
      ...banners,
      {
        desktopImageUrl: "",
        tabletImageUrl: "",
        mobileImageUrl: "",
        collectionId: "",
        link: "",
        headline: "",
        subtext: "",
        primaryCtaText: "",
        primaryCtaLink: "",
      },
    ]);
  };

  const handleRemoveSlide = (index: number) => {
    updateBanners(banners.filter((_: any, i: number) => i !== index));
  };

  const handleSlideChange = (index: number, field: string, value: any) => {
    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], [field]: value };
    updateBanners(newBanners);
  };

  return (
    <div className="space-y-5 pt-2">
      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. Hero Banner"
      />

      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Hero Slides (Max 5)
        </label>
        <button
          onClick={onRefreshCollections}
          disabled={isFetching}
          className="text-[10px] flex items-center gap-1 font-bold text-[#006044]"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
          Reload Collections
        </button>
      </div>

      <div className="space-y-5">
        {banners.map((slide: any, index: number) => (
          <div
            key={index}
            className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-5"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h4 className="font-black text-sm">Slide #{index + 1}</h4>
              <button
                type="button"
                onClick={() => handleRemoveSlide(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Images */}
            <div className="flex flex-col gap-4">
              {IMAGE_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {field.label}
                  </label>

                  {slide[field.key] ? (
                    <div className="relative h-40 rounded-2xl overflow-hidden border">
                      <img
                        src={slide[field.key]}
                        className="w-full h-full object-cover"
                        alt={field.label}
                      />
                      <button
                        type="button"
                        onClick={() => handleSlideChange(index, field.key, "")}
                        className="absolute top-2 right-2 bg-white rounded-full p-2"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <CldUploadWidget
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                      options={{ multiple: false }}
                      onSuccess={(result: any) => {
                        if (result.event === "success") {
                          handleSlideChange(index, field.key, result.info.secure_url);
                        }
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => {
                            setUploadingSlideIndex(index);
                            open();
                          }}
                          className="h-40 w-full border-2 border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center hover:bg-green-50 hover:border-[#006044]"
                        >
                          <Upload size={22} />
                          <span className="mt-2 text-xs font-bold">Upload</span>
                          <span className="text-[10px] text-zinc-400">
                            {field.guide}
                          </span>
                        </button>
                      )}
                    </CldUploadWidget>
                  )}
                </div>
              ))}
            </div>

            {/* Collection Selector */}
            <select
              value={slide.collectionId || ""}
              onChange={(e) => {
                const selectedCollection = collections.find(
                  (c: any) => c.id === e.target.value
                );
                handleSlideChange(index, "collectionId", selectedCollection?.id || "");
                handleSlideChange(
                  index,
                  "link",
                  selectedCollection ? `/collections/${selectedCollection.slug}` : ""
                );
              }}
              className="w-full p-4 border rounded-2xl bg-white"
            >
              <option value="">Select Collection</option>
              {collections.map((collection: any) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>

            {/* Link */}
            <input
              type="text"
              value={slide.link || ""}
              onChange={(e) => handleSlideChange(index, "link", e.target.value)}
              placeholder="Custom Link"
              className="w-full p-4 border rounded-2xl bg-white"
            />
          </div>
        ))}
      </div>

      {/* Add Slide Button */}
      {banners.length < 5 && (
        <button
          type="button"
          onClick={handleAddSlide}
          className="w-full py-4 border-2 border-dashed border-[#006044]/30 rounded-2xl flex items-center justify-center gap-2 text-[#006044] font-bold text-xs hover:bg-[#006044]/5 transition-all"
        >
          <Upload size={16} />
          Add Hero Slide
        </button>
      )}

      <ImageGuidelines type="HERO" />
    </div>
  );
}