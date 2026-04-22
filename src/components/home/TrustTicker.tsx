// src\components\home\TrustTicker.tsx

"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { ShieldCheck } from "lucide-react";

// 1. SMART ICON RESOLVER
const DynamicIcon = ({
  name,
  className,
  strokeWidth = 1.5,
  size = 24,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
  size?: number;
}) => {
  if (!name) return <LucideIcons.CheckCircle className={className} size={size} strokeWidth={strokeWidth} />;

  let IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    const pascalCaseName = name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
    IconComponent = (LucideIcons as any)[pascalCaseName];
  }

  IconComponent = IconComponent || LucideIcons.CheckCircle;

  return <IconComponent className={className} size={size} strokeWidth={strokeWidth} />;
};

interface TrustTickerProps {
  settings?: {
    selectedIds?: string[];
  };
}

export const TrustTicker: React.FC<TrustTickerProps> = ({ settings }) => {
  const { selectedIds = [] } = settings || {};

  const { data: masterFeatures = [], isLoading } = useQuery({
    queryKey: ["admin-features"],
    queryFn: async () => {
      const res: any = await apiClient.get("/admin/features");
      return Array.isArray(res) ? res : res?.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });

  const activeBadges = Array.isArray(masterFeatures)
    ? masterFeatures.filter((f: any) => selectedIds.includes(f.id))
    : [];

  // LOADING STATE (Grid format)
  if (isLoading) {
    return (
      <section className="w-full py-12 md:py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-100 rounded-full" />
                <div className="w-24 h-3 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // EMPTY STATE (Admin Preview)
  if (activeBadges.length === 0) {
    return (
      <div className="w-full py-10 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[32px] my-4">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <ShieldCheck className="text-zinc-300" size={32} />
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Trust Badges: No Badges Selected
          </p>
          <p className="text-[9px] text-zinc-300 font-bold">
            Select badges in the configuration panel to display them here.
          </p>
        </div>
      </div>
    );
  }

  // ACTUAL RENDER (Matching the Grid/Highlights Layout)
  return (
    <section className="w-full py-12 md:py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {activeBadges.map((badge: any) => {
            // Use the badge's specific color if available, fallback to brand green
            const badgeColor = badge.color || "#006044"; 

            return (
              <div 
                key={badge.id} 
                className="flex flex-col items-center text-center space-y-4 group"
              >
                {/* Highlight Circle Background */}
                <div 
                  className="w-16 h-16 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-y-1 shadow-sm border border-gray-50"
                  style={{ 
                    backgroundColor: `${badgeColor}15`, // Adds 15% opacity to the background color
                    color: badgeColor 
                  }}
                >
                  <DynamicIcon 
                    name={badge.icon} 
                    size={28} 
                    strokeWidth={2} 
                  />
                </div>
                
                {/* Badge Text */}
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-800 leading-snug max-w-[160px]">
                  {badge.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};