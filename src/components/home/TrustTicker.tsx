// src/components/home/TrustTicker.tsx

"use client";

import React, { useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

const SECTION_SPACING = "py-8 md:py-12 lg:py-16";
const CONTAINER_SPACING = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/**
 * Resolve icon safely from Lucide
 */
const getIcon = (name?: string) => {
  if (!name) return LucideIcons.ShieldCheck;

  const formattedName = name
    .split("-")
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");

  return (
    (LucideIcons as any)[name] ||
    (LucideIcons as any)[formattedName] ||
    LucideIcons.ShieldCheck
  );
};

export const TrustTicker = ({ settings }: any) => {
  const { selectedIds = [] } = settings || {};

  const { data: masterFeatures = [], isLoading } = useQuery({
    queryKey: ["storefront-features"],
    queryFn: async () => {
      const res: any = await apiClient.get(
        "/storefront/features"
      );

      return Array.isArray(res) ? res : res?.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });

  /**
   * Filter only selected badges
   */
  const activeBadges = useMemo(() => {
    if (!Array.isArray(masterFeatures)) return [];

    return masterFeatures.filter((feature: any) =>
      selectedIds.includes(feature.id)
    );
  }, [masterFeatures, selectedIds]);

  if (isLoading || !activeBadges.length) return null;

  return (
    <section className={`w-full bg-white ${SECTION_SPACING}`}>
      <div className={CONTAINER_SPACING}>
        {/* Main Container */}
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 md:p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {activeBadges.map((badge: any) => {
              const Icon = getIcon(badge.icon);

              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center text-center px-2 py-2"
                >
                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black shadow-sm md:h-16 md:w-16">
                    <Icon
                      className="h-6 w-6 text-white md:h-7 md:w-7"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-semibold leading-tight text-neutral-900 md:text-base">
                      {badge.title}
                    </h3>

                    {badge.description && (
                      <p className="text-xs leading-relaxed text-neutral-500 md:text-sm">
                        {badge.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};