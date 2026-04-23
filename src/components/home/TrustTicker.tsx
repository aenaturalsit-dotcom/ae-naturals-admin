// src/components/home/TrustTicker.tsx



"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import  apiClient  from "@/lib/api-client";

const getIcon = (name?: string) => {
  if (!name) return LucideIcons.ShieldCheck;

  return (
    (LucideIcons as any)[name] ||
    (LucideIcons as any)[
      name
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("")
    ] ||
    LucideIcons.ShieldCheck
  );
};

export const TrustTicker = ({ settings }: any) => {
  const { selectedIds = [] } = settings || {};

  const { data: masterFeatures = [], isLoading } = useQuery({
    queryKey: ["storefront-features"],
    queryFn: async () => {
      const res: any = await apiClient.get("/storefront/features");
      return Array.isArray(res) ? res : res?.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });

  const activeBadges = Array.isArray(masterFeatures)
    ? masterFeatures.filter((f: any) => selectedIds.includes(f.id))
    : [];

  if (isLoading || !activeBadges.length) return null;

  return (
    <section className="w-full bg-[#f5f5f5] border-y border-neutral-200 py-12 ">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
          {activeBadges.map((badge: any) => {
            const Icon = getIcon(badge.icon);

            return (
              <div
                key={badge.id}
                className="flex flex-col items-center max-w-[220px]"
              >
                {/* ICON */}
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mb-4">
                  <Icon
                    className="w-6 h-6 text-white"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                {/* TITLE */}
                <h3 className="text-sm font-semibold text-neutral-900">
                  {badge.title}
                </h3>

                {/* DESCRIPTION */}
                {badge.description && (
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                    {badge.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};