// src/components/admin/sections/configs/ProductCarouselConfig.tsx

"use client";

import React from "react";
import {
  TitleInput,
  ToggleField,
} from "@/components/admin/shared/SectionConfigShared";
import type { ThemeSection } from "@/lib/validators/storefront";

interface ProductCarouselConfigProps {
  section: ThemeSection;
  collections: any[];
  onUpdate: (settings: Record<string, any>) => void;
}

export function ProductCarouselConfig({
  section,
  collections,
  onUpdate,
}: ProductCarouselConfigProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-4">
      <TitleInput
        value={settings.title || ""}
        onChange={(value) => onUpdate({ title: value })}
        placeholder="e.g. Trending Now"
      />

      <div className="space-y-2 pt-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Data Source (Backend Key)
        </label>
        <div className="relative">
          <select
            className="w-full p-4 pr-10 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all cursor-pointer appearance-none"
            value={settings.dataSource || ""}
            onChange={(e) => onUpdate({ dataSource: e.target.value })}
          >
            <option value="" disabled>
              Select a Data Source...
            </option>
            <option value="featuredProducts">Featured Products</option>
            <option value="newArrivals">New Arrivals</option>
            {collections && collections.length > 0 && (
              <optgroup label="Your Collections">
                {collections.map((col: any) => (
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
      </div>

      <ToggleField
        label="Show Product Badges"
        value={settings.showHighlights !== false}
        onChange={(value) => onUpdate({ showHighlights: value })}
      />
    </div>
  );
}