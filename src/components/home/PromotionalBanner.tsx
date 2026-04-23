// src\components\home\PromotionalBanner.tsx
export const PromotionalBanner = ({ settings }: any) => {
  if (!settings?.imageUrl) {
    return (
      <div className="w-full h-[150px] bg-red-50 border-2 border-red-200 border-dashed flex items-center justify-center rounded-xl">
        <h2 className="text-xl font-bold text-red-500">
          {settings?.title || "Promo Banner Block"}
        </h2>
      </div>
    );
  }

  const subtitle =
    settings?.subtitle || "Limited time deal. Don’t miss out.";

  return (
    <div className="w-full h-[180px] md:h-[220px] relative rounded-2xl overflow-hidden shadow-sm group">
      
      {/* IMAGE */}
      <img
        src={settings.imageUrl}
        alt={settings.title || "Promo Banner"}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
        
        {/* TITLE */}
        {settings.title && (
          <h2 className="text-lg md:text-2xl font-extrabold text-white drop-shadow-md mb-2">
            {settings.title}
          </h2>
        )}

        {/* ✅ SUBTITLE */}
        {subtitle && (
          <p className="text-xs md:text-sm text-white/90 mb-3 max-w-md leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* CTA */}
        {settings.buttonText && settings.buttonLink && (
          <a
            href={settings.buttonLink}
            className="px-6 py-2.5 bg-white text-black text-xs md:text-sm font-bold rounded-md shadow hover:bg-gray-100 transition-all"
          >
            {settings.buttonText}
          </a>
        )}

      </div>
    </div>
  );
};