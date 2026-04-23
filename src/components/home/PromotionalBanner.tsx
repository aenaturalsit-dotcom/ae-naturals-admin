// src\components\home\PromotionalBanner.tsx

"use client";

import Link from "next/link";
import Image from "next/image";

export const PromotionalBanner = ({ settings }: any) => {
  if (!settings?.imageUrl) {
    return (
      <div className="w-full h-[180px] md:h-[220px] rounded-2xl bg-zinc-100 flex items-center justify-center">
        <h2 className="text-sm font-semibold text-zinc-500">
          {settings?.title || "Promo Banner"}
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full h-[180px] md:h-[220px] relative rounded-2xl overflow-hidden shadow-sm group">
      
      {/* IMAGE */}
      <Image
        src={settings.imageUrl}
        alt={settings.title || "Promo Banner"}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col items-center justify-center text-center px-4">
        
        {settings.title && (
          <h2 className="text-lg md:text-2xl font-extrabold text-white drop-shadow-md mb-3">
            {settings.title}
          </h2>
        )}

        {settings.buttonText && settings.buttonLink && (
          <Link
            href={settings.buttonLink}
            aria-label={settings.buttonText}
            className="px-6 py-2.5 bg-white text-black text-xs md:text-sm font-bold rounded-md shadow-md hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {settings.buttonText}
          </Link>
        )}
      </div>
    </div>
  );
};