// src/components/admin/shared/CollectionSelector.tsx

"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

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
}

export function CollectionSelector({
  collections,
  selectedId,
  onSelect,
  isLoading = false,
  isFetching = false,
  onRefresh,
}: CollectionSelectorProps) {
  if (isLoading || (isFetching && collections.length === 0)) {
    return (
      <div className="text-sm font-medium text-zinc-500 animate-pulse">
        Loading collections...
      </div>
    );
  }

  if (collections.length === 0) {
    return (
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
    );
  }

  return (
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
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}