// src/components/admin/sections/configs/FeaturedProductsConfig.tsx

"use client";

import React from "react";
import {
  TitleInput,
  SubtitleInput,
  ToggleField,
} from "@/components/admin/shared/SectionConfigShared";
import type { ThemeSection } from "@/lib/validators/storefront";

interface FeaturedProductsConfigProps {
  section: ThemeSection;
  onUpdate: (settings: Record<string, any>) => void;
}

export function FeaturedProductsConfig({
  section,
  onUpdate,
}: FeaturedProductsConfigProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-6">
      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. Featured Products"
      />

      <SubtitleInput
        value={settings.subtitle || ""}
        onChange={(value) => onUpdate({ subtitle: value })}
        placeholder="e.g. Our best-selling products"
      />

      <ToggleField
        label="Show Price"
        value={settings.showPrice !== false}
        onChange={(value) => onUpdate({ showPrice: value })}
      />

      <ToggleField
        label="Show Badges"
        value={settings.showBadges !== false}
        onChange={(value) => onUpdate({ showBadges: value })}
      />
    </div>
  );
}