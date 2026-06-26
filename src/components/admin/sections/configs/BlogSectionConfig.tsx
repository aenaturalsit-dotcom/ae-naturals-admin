// src/components/admin/sections/configs/BlogSectionConfig.tsx

"use client";

import React from "react";
import {
  TitleInput,
  SubtitleInput,
} from "@/components/admin/shared/SectionConfigShared";
import type { ThemeSection } from "@/lib/validators/storefront";

interface BlogSectionConfigProps {
  section: ThemeSection;
  onUpdate: (settings: Record<string, any>) => void;
}

export function BlogSectionConfig({ section, onUpdate }: BlogSectionConfigProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-6 pt-4">
      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. From Our Blog"
      />

      <SubtitleInput
        value={settings.subtitle || ""}
        onChange={(value) => onUpdate({ subtitle: value })}
        placeholder="e.g. Expert tips, ingredient science, and beauty insights"
      />
    </div>
  );
}