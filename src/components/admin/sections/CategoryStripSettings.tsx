// src/components/admin/sections/CategoryStripSettings.tsx

'use client';

import React from 'react';
import { CategorySelector } from './CategorySelector';
import type { CategoryIconStripSettings } from '@/lib/validators/storefront';

interface CategoryStripSettingsProps {
  sectionId: string;
  settings: CategoryIconStripSettings;
  onUpdate: (settings: Partial<CategoryIconStripSettings>) => void;
  // NEW: Receive categories from parent
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    productCount?: number;
    icon?: string | null;
    image?: string | null;
  }>;
  isLoadingCategories?: boolean;
}

export function CategoryStripSettings({
  sectionId,
  settings,
  onUpdate,
  categories = [],
  isLoadingCategories = false,
}: CategoryStripSettingsProps) {
  return (
    <div className="space-y-6">
      {/* ============================================================
          SECTION TITLE
          ============================================================ */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Section Title
        </label>
        <input
          type="text"
          className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all"
          value={settings.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="e.g. Shop by Category"
        />
      </div>

      {/* ============================================================
          SUBTITLE
          ============================================================ */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Subtitle
        </label>
        <input
          type="text"
          className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-medium text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all"
          value={settings.subtitle || ''}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="e.g. Explore our curated collections"
        />
      </div>

      {/* ============================================================
          CATEGORY SELECTOR
          ============================================================ */}
      <div className="space-y-3 pt-2 border-t border-zinc-100">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Select Categories
          </label>
          <span className="text-[10px] font-medium text-zinc-400">
            {categories.length} available
          </span>
        </div>

        <CategorySelector
          selectedIds={settings.categoryIds || []}
          onChange={(ids) => onUpdate({ categoryIds: ids })}
          maxSelect={settings.displayCount || 12}
          placeholder="Search and select categories..."
          categories={categories}
          isLoading={isLoadingCategories}
        />
      </div>

      {/* ============================================================
          DISPLAY SETTINGS
          ============================================================ */}
      <div className="space-y-4 pt-4 border-t border-zinc-100">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Display Settings
        </label>

        {/* Layout */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600">Layout Style</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl">
            {(
              [
                ['grid', 'Grid'],
                ['scrollable', 'Scrollable'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdate({ layout: value })}
                className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  (settings.layout || 'grid') === value
                    ? 'bg-white text-[#006044] shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Columns (Grid only) */}
        {settings.layout !== 'scrollable' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-600">Columns</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 rounded-2xl">
              {(['4', '5', '6'] as const).map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => onUpdate({ columns: cols })}
                  className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    (settings.columns || '5') === cols
                      ? 'bg-white text-[#006044] shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {cols} cols
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Size */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600">Icon Size</label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 rounded-2xl">
            {(
              [
                ['small', 'Small'],
                ['medium', 'Medium'],
                ['large', 'Large'],
              ] as const
            ).map(([size, label]) => (
              <button
                key={size}
                type="button"
                onClick={() => onUpdate({ imageSize: size })}
                className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  (settings.imageSize || 'medium') === size
                    ? 'bg-white text-[#006044] shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Shape - NEW */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-600">Image Shape</label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 rounded-2xl">
            {(
              [
                ['circle', 'Circle'],
                ['square', 'Square'],
                ['rounded', 'Rounded'],
              ] as const
            ).map(([shape, label]) => (
              <button
                key={shape}
                type="button"
                onClick={() => onUpdate({ imageShape: shape })}
                className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  (settings.imageShape || 'circle') === shape
                    ? 'bg-white text-[#006044] shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Show Product Count Toggle */}
        <div className="flex items-center justify-between pt-2">
          <label className="text-xs font-medium text-zinc-600 cursor-pointer">
            Show Product Count
          </label>
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#006044] cursor-pointer"
            checked={settings.showProductCount !== false}
            onChange={(e) => onUpdate({ showProductCount: e.target.checked })}
          />
        </div>

        {/* Show Category Names Toggle - NEW */}
        <div className="flex items-center justify-between pt-2">
          <label className="text-xs font-medium text-zinc-600 cursor-pointer">
            Show Category Names
          </label>
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#006044] cursor-pointer"
            checked={settings.showCategoryNames !== false}
            onChange={(e) => onUpdate({ showCategoryNames: e.target.checked })}
          />
        </div>
      </div>

      {/* ============================================================
          STATUS & PREVIEW COUNT
          ============================================================ */}
      <div className="rounded-2xl border p-4 space-y-2">
        {/* Category Count */}
        <div className={`flex items-center justify-between ${
          settings.categoryIds?.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
        } rounded-xl p-3`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {settings.categoryIds?.length > 0 ? '📊' : '💡'}
            </span>
            <div>
              <p className={`text-xs font-medium ${
                settings.categoryIds?.length > 0 ? 'text-blue-700' : 'text-amber-700'
              }`}>
                {settings.categoryIds?.length || 0} categories selected
                {settings.displayCount && ` · Max ${settings.displayCount} displayed`}
              </p>
              {settings.categoryIds?.length > 0 && (
                <p className="text-[10px] text-blue-600 mt-0.5">
                  Categories will appear in the preview above
                </p>
              )}
            </div>
          </div>
          {settings.categoryIds?.length > 0 && (
            <span className="text-xs font-bold text-blue-600">
              {settings.categoryIds.length}
            </span>
          )}
        </div>

        {/* Category Status Message */}
        {categories.length === 0 && !isLoadingCategories && (
          <div className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
            ⚠️ No categories found in your store. Please add categories first.
          </div>
        )}

        {settings.categoryIds?.length === 0 && categories.length > 0 && !isLoadingCategories && (
          <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">
            💡 Search and select categories from the list above
          </div>
        )}

        {/* Categories without images notice */}
        {settings.categoryIds?.length > 0 && (
          <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">
            🖼️ Categories without images will show their initial letter as a placeholder
          </div>
        )}

        {/* Total categories in store */}
        {categories.length > 0 && (
          <div className="text-[10px] text-gray-400 text-center pt-1 border-t border-gray-100">
            {categories.length} total categories in your store
          </div>
        )}
      </div>
    </div>
  );
}