// src/components/admin/shared/SectionConfigShared.tsx

"use client";

import React from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, RefreshCw } from "lucide-react";

// ============================================================
// 1. TITLE INPUT
// ============================================================

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function TitleInput({
  value,
  onChange,
  placeholder = "e.g. Featured Collection",
  label = "Section Title",
}: TitleInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        {label}
      </label>
      <input
        type="text"
        className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ============================================================
// 2. SUBTITLE INPUT
// ============================================================

interface SubtitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SubtitleInput({
  value,
  onChange,
  placeholder = "Expert tips, ingredient science, and beauty insights",
  label = "Subtitle",
}: SubtitleInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        {label}
      </label>
      <input
        type="text"
        className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-medium text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ============================================================
// 3. TEXTAREA INPUT
// ============================================================

interface TextareaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
}

export function TextareaInput({
  value,
  onChange,
  placeholder = "Enter description...",
  label = "Description",
  rows = 4,
}: TextareaInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        {label}
      </label>
      <textarea
        className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-medium text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
}

// ============================================================
// 4. BUTTON FIELDS
// ============================================================

interface ButtonFieldsProps {
  buttonText: string;
  buttonLink: string;
  onUpdate: (settings: Record<string, any>) => void;
}

export function ButtonFields({
  buttonText,
  buttonLink,
  onUpdate,
}: ButtonFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Button Text
        </label>
        <input
          type="text"
          className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all"
          value={buttonText || ""}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
          placeholder="e.g. Shop Now"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Button Link
        </label>
        <input
          type="text"
          className="w-full p-4 border border-zinc-200 rounded-2xl outline-none font-bold text-sm bg-white focus:ring-2 focus:ring-[#006044] transition-all"
          value={buttonLink || ""}
          onChange={(e) => onUpdate({ buttonLink: e.target.value })}
          placeholder="/collections/all"
        />
      </div>
    </div>
  );
}

// ============================================================
// 5. IMAGE UPLOADER
// ============================================================

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  maxSizeMB?: number;
  label?: string;
  className?: string;
  aspectRatio?: string;
  guidelines?: string;
}

export function ImageUploader({
  value,
  onChange,
  maxSizeMB = 0.5,
  label = "Upload Photo",
  className = "h-40",
  guidelines,
}: ImageUploaderProps) {
  if (value) {
    return (
      <div
        className={`relative ${className} w-full rounded-3xl overflow-hidden border shadow-sm group`}
      >
        <img src={value} className="h-full w-full object-cover" alt="Uploaded" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={16} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{ multiple: false }}
        onSuccess={(result: any) => {
          if (result.event === "success") {
            const fileSizeKB = result.info.bytes / 1024;
            if (fileSizeKB > maxSizeMB * 1024) {
              alert(`Image too large. Please upload under ${maxSizeMB}MB.`);
              return;
            }
            onChange(result.info.secure_url);
          }
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            className={`${className} w-full border-2 border-dashed border-zinc-300 rounded-3xl flex flex-col items-center justify-center text-zinc-400 hover:border-[#006044] hover:bg-green-50 transition-all`}
          >
            <Upload size={28} />
            <span className="text-[10px] font-black mt-3 tracking-widest uppercase">
              {label}
            </span>
          </button>
        )}
      </CldUploadWidget>
      {guidelines && (
        <p className="mt-2 px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-semibold">
          ⚠ Recommended: <span className="font-bold">{guidelines}</span>
        </p>
      )}
    </div>
  );
}

// ============================================================
// 6. COLLECTION SELECTOR
// ============================================================

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface CollectionSelectorProps {
  collections: Collection[];
  selectedId: string;
  onSelect: (id: string, slug: string) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  label?: string;
}

export function CollectionSelector({
  collections,
  selectedId,
  onSelect,
  isLoading = false,
  isFetching = false,
  onRefresh,
  label = "Select One Collection to Preview",
}: CollectionSelectorProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          {label}
        </label>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isFetching}
            className="text-[10px] flex items-center gap-1 font-bold text-[#006044] hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
            Reload Data
          </button>
        )}
      </div>

      {isLoading || (isFetching && collections.length === 0) ? (
        <div className="text-sm font-medium text-zinc-500 animate-pulse">
          Loading collections...
        </div>
      ) : collections.length === 0 ? (
        <div className="text-sm font-medium text-amber-600 bg-amber-50 border border-amber-100 p-4 rounded-xl">
          No collections found.
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="ml-2 text-[#006044] hover:underline font-bold"
            >
              Refresh
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {collections.map((col) => {
            const isSelected = String(selectedId) === String(col.id);
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => onSelect(col.id, col.slug)}
                className={`px-4 py-2 text-xs font-bold rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#006044] text-white border-[#006044] shadow-md ring-2 ring-offset-2 ring-[#006044]/30 scale-105"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-[#006044] hover:bg-[#006044]/5 hover:text-[#006044]"
                }`}
              >
                {col.name}
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 7. IMAGE GUIDELINES
// ============================================================

export const IMAGE_GUIDELINES = {
  HERO: "1920×800px • 16:9 • Max 500KB • WebP preferred",
  PROMO_BANNER: "1200×500px • 12:5 • Max 300KB • WebP/JPG",
  BRAND_STORY: "800×600px • 4:3 • Max 300KB • WebP/JPG",
  BLOG_SECTION: "1200×630px • 1.91:1 • Max 300KB • WebP/JPG",
  PRODUCT: "800×800px • 1:1 • Max 200KB • WebP",
};

export function ImageGuidelines({ type }: { type: keyof typeof IMAGE_GUIDELINES }) {
  return (
    <p className="mt-3 px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-semibold">
      ⚠ Recommended: <span className="font-bold">{IMAGE_GUIDELINES[type]}</span>
    </p>
  );
}

// ============================================================
// 8. TOGGLE FIELD
// ============================================================

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleField({ label, value, onChange }: ToggleFieldProps) {
  return (
    <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer">
        {label}
      </label>
      <input
        type="checkbox"
        className="w-4 h-4 accent-[#006044] cursor-pointer"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

// ============================================================
// 9. SECTION HEADER
// ============================================================

interface SectionHeaderProps {
  type: string;
  title?: string;
}

export function SectionHeader({ type, title }: SectionHeaderProps) {
  const displayTitle = title || type.replace("_", " ");
  return (
    <div>
      <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
        {displayTitle}
      </h3>
      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
        Block Configuration
      </p>
    </div>
  );
}