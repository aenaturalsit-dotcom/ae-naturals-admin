// src/components/admin/sections/configs/PromoBannerConfig.tsx

"use client";

import React from "react";
import {
  TitleInput,
  SubtitleInput,
  ButtonFields,
  ImageUploader,
  ImageGuidelines,
  IMAGE_GUIDELINES,
} from "@/components/admin/shared/SectionConfigShared";
import type { ThemeSection } from "@/lib/validators/storefront";

interface PromoBannerConfigProps {
  section: ThemeSection;
  onUpdate: (settings: Record<string, any>) => void;
}

export function PromoBannerConfig({ section, onUpdate }: PromoBannerConfigProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-6 pt-2">
      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. Summer Sale"
      />

      <SubtitleInput
        value={settings.subtitle || ""}
        onChange={(value) => onUpdate({ subtitle: value })}
        placeholder="e.g. Limited time deal. Don't miss out."
      />

      <div className="space-y-3">
        <ImageUploader
          value={settings.imageUrl}
          onChange={(url) => onUpdate({ imageUrl: url })}
          maxSizeMB={0.5}
          label="Upload Banner Image"
          className="h-40"
          guidelines={IMAGE_GUIDELINES.PROMO_BANNER}
        />
      </div>

      <ButtonFields
        buttonText={settings.buttonText || ""}
        buttonLink={settings.buttonLink || ""}
        onUpdate={onUpdate}
      />
    </div>
  );
}