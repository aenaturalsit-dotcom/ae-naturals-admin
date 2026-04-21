// src\components\home\TrustTicker.tsx

"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ShieldCheck } from "lucide-react";

interface TrustTickerProps {
  settings: {
    selectedIds?: string[];
  };
}

export const TrustTicker: React.FC<TrustTickerProps> = ({ settings }) => {
  const { selectedIds = [] } = settings;

  const { data: masterFeatures = [], isLoading } = useQuery({
    queryKey: ["admin-features"],
    queryFn: () => apiClient.get("/admin/features"),
    staleTime: 1000 * 60 * 60,
  });

  const activeBadges = Array.isArray(masterFeatures) 
    ? masterFeatures.filter((f: any) => selectedIds.includes(f.id))
    : [];

  // 1. LOADING FALLBACK (Prevents layout shift)
  if (isLoading) {
    return (
      <div className="w-full py-10 bg-zinc-50 border-y border-zinc-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-3 animate-pulse">
                <div className="w-12 h-12 bg-zinc-200 rounded-2xl" />
                <div className="w-20 h-3 bg-zinc-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. EMPTY FALLBACK (Crucial for the Admin Preview)
  if (activeBadges.length === 0) {
    return (
      <div className="w-full py-10 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[32px] my-4">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <ShieldCheck className="text-zinc-300" size={32} />
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Trust Ticker: No Badges Selected
          </p>
          <p className="text-[9px] text-zinc-300 font-bold">
            Select badges in the configuration panel to display them here.
          </p>
        </div>
      </div>
    );
  }

  // 3. ACTUAL CONTENT
  return (
    <section className="w-full py-10 bg-zinc-50 border-y border-zinc-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {activeBadges.map((badge: any) => {
            const Icon = (LucideIcons as any)[badge.icon] || LucideIcons.ShieldCheck;
            return (
              <div key={badge.id} className="flex flex-col items-center text-center space-y-3 group">
                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                  <Icon size={24} className="text-[#006044]" strokeWidth={2.5} />
                </div>
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest">
                  {badge.title}
                </h4>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};