// src/components/admin/products/ProductHighlightsSelector.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import * as LucideIcons from "lucide-react";
import { Loader2 } from "lucide-react";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ProductHighlightsSelector({
  selectedIds = [],
  onChange,
}: Props) {
  // 🔥 NEW: Monitor every render cycle
  console.log("[Highlights] Component Rendered. Current selectedIds in props:", selectedIds);
  const { data: masterHighlights = [], isLoading } = useQuery({
    queryKey: ["admin-features"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/features");
      return Array.isArray(response) ? response : response?.data || [];
    },
  });

  const toggleHighlight = (id: string) => {
    const currentIds = Array.isArray(selectedIds) ? selectedIds : [];
    let updatedIds: string[] = [];

    const isAlreadySelected = currentIds.includes(id);

    if (isAlreadySelected) {
      updatedIds = currentIds.filter((selectedId) => selectedId !== id);
    } else {
      updatedIds = [...currentIds, id];
    }

    // 🔥 DEBUG LOG: CLICK ACTION
    console.log(`[Highlights] toggleHighlight fired. Sending to parent:`, updatedIds);

    onChange(updatedIds);
  };

  if (isLoading) {
    return (
      <div className="flex items-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
        Product Highlights
      </label>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.isArray(masterHighlights) &&
          masterHighlights.map((feature: any) => {
            
            const IconComponent =
              (LucideIcons as any)[feature.icon] || LucideIcons.CheckCircle;

            const isSelected =
              Array.isArray(selectedIds) && selectedIds.includes(feature.id);
// 🔥 NEW: Check if the condition is actually meeting
        if (isSelected) {
          console.log(`[Highlights] matches found! Green should show for: ${feature.title}`);
        }
          
            return (
              <button
                type="button"
                key={feature.id}
                onClick={() => toggleHighlight(feature.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                  isSelected
                    ? "bg-green-50 border-green-600 text-green-700 shadow-sm" // Green state
                    : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100" // Default state
                }`}
              >
                <IconComponent size={18} className="shrink-0" />
                <span className="text-sm font-bold leading-tight">
                  {feature.title}
                </span>
              </button>
            );
          })}
      </div>

      <p className="text-[10px] text-zinc-400 leading-relaxed">
        Select the highlights to display on this product&apos;s page.
      </p>
    </div>
  );
}