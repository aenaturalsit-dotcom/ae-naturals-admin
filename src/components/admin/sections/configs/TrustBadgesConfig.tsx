// src/components/admin/sections/configs/TrustBadgesConfig.tsx

"use client";

import React from "react";
import TrustBadgeSelector from "@/components/admin/sections/TrustBadgeSelector";
import { TitleInput } from "@/components/admin/shared/SectionConfigShared";
import type { ThemeSection } from "@/lib/validators/storefront";

interface TrustBadgesConfigProps {
  section: ThemeSection;
  onUpdate: (settings: Record<string, any>) => void;
}

export function TrustBadgesConfig({ section, onUpdate }: TrustBadgesConfigProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-6">
      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. Why Choose Us"
      />

      <div className="pt-4">
        <TrustBadgeSelector
          selectedIds={settings.selectedIds || []}
          onChange={(ids) => onUpdate({ selectedIds: ids })}
        />
      </div>
    </div>
  );
}