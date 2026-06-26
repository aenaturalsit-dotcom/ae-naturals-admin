// src/components/admin/sections/configs/BrandStoryConfig.tsx

"use client";

import React from "react";
import {
  TitleInput,
  TextareaInput,
  ButtonFields,
  ImageUploader,
  ImageGuidelines,
  IMAGE_GUIDELINES,
} from "@/components/admin/shared/SectionConfigShared";
import type { ThemeSection } from "@/lib/validators/storefront";

interface BrandStoryConfigProps {
  section: ThemeSection;
  onUpdate: (settings: Record<string, any>) => void;
}

export function BrandStoryConfig({ section, onUpdate }: BrandStoryConfigProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-6">
      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. Our Story"
      />

      <TextareaInput
        value={settings.description || ""}
        onChange={(value) => onUpdate({ description: value })}
        placeholder="e.g. We started with a simple mission..."
        label="Description"
        rows={4}
      />

      <ImageUploader
        value={settings.imageUrl}
        onChange={(url) => onUpdate({ imageUrl: url })}
        maxSizeMB={0.5}
        label="Upload Story Image"
        className="h-40"
        guidelines={IMAGE_GUIDELINES.BRAND_STORY}
      />

      <ButtonFields
        buttonText={settings.buttonText || ""}
        buttonLink={settings.buttonLink || ""}
        onUpdate={onUpdate}
      />

      <div className="space-y-4 pt-4 border-t border-zinc-100">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Image Alignment
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl">
          {["left", "right", "top", "bottom"].map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onUpdate({ layout: pos })}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                (settings.layout || "left") === pos
                  ? "bg-white text-[#006044] shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}