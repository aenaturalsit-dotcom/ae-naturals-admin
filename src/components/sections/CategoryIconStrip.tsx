// src/components/sections/CategoryIconStrip.tsx

"use client";

import React, { useMemo, useState, useEffect, useCallback, memo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, AlertCircle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { migrateCategoryIconStripSettings } from "@/lib/validators/storefront";

// ============================================================
// 1. TYPES
// ============================================================

interface CategoryIconStripProps {
  settings: any;
  data?: { categories?: any[]; collections?: any[] };
  previewMode?: boolean;
  className?: string;
}

interface ResolvedItem {
  id: string;
  type: "category" | "collection" | "custom-link";
  targetId: string;
  isEnabled: boolean;
  title: string;
  imageUrl: string | null;
  badge: "new" | "sale" | "trending" | "hot" | null;
  order: number;
  href: string;
  customLinkConfig?: {
    url: string;
    openInNewTab: boolean;
  };
  resolvedData: {
    name: string;
    slug: string;
    imageUrl: string | null;
    productCount: number;
    color: string | null;
  };
}

// ============================================================
// 2. CONSTANTS & HELPERS
// ============================================================

const IMAGE_SIZES = {
  small: { width: 64, height: 64, container: "w-16 h-16" },
  medium: { width: 80, height: 80, container: "w-20 h-20" },
  large: { width: 100, height: 100, container: "w-24 h-24" },
} as const;

const SHAPE_CLASSES = {
  circle: "rounded-full",
  square: "rounded-none",
  rounded: "rounded-2xl",
} as const;

const BADGE_COLORS = {
  new: "bg-blue-500",
  sale: "bg-red-500",
  trending: "bg-orange-500",
  hot: "bg-pink-500",
} as const;

const GRID_COLUMNS = {
  4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
} as const;

const VISIBLE_ITEMS = {
  desktop: 4,
  tablet: 3,
  mobile: 2,
} as const;

const getImageSize = (size: keyof typeof IMAGE_SIZES = "medium") => IMAGE_SIZES[size];
const getShapeClass = (shape: keyof typeof SHAPE_CLASSES = "circle") => SHAPE_CLASSES[shape];
const getBadgeColor = (badge: keyof typeof BADGE_COLORS) => BADGE_COLORS[badge] || "bg-gray-500";

// ============================================================
// 3. ITEM RESOLVER
// ============================================================

function resolveItem(
  item: any,
  categories: any[],
  collections: any[]
): ResolvedItem | null {
  let resolvedData = null;
  let href = "#";

  if (item.type === "category") {
    if (!item.targetId) return null;
    const cat = categories.find((c) => c.id === item.targetId);
    if (!cat) return null;
    resolvedData = cat;
    href = `/collections/${cat.slug}`;
  } else if (item.type === "collection") {
    if (!item.targetId) return null;
    const col = collections.find((c) => c.id === item.targetId);
    if (!col) return null;
    resolvedData = col;
    href = `/collections/${col.slug}`;
  } else if (item.type === "custom-link") {
    resolvedData = { name: item.title || "Custom Link", slug: "" };
    href = item.customLinkConfig?.url || "#";
  }

  if (!resolvedData) return null;

  return {
    id: item.id,
    type: item.type,
    targetId: item.targetId,
    isEnabled: item.isEnabled !== false,
    title: item.title || resolvedData.name || "",
    imageUrl: item.imageUrl || resolvedData.image || resolvedData.icon || null,
    badge: item.badge || null,
    order: item.order || 0,
    href,
    customLinkConfig: item.customLinkConfig,
    resolvedData: {
      name: resolvedData.name || "",
      slug: resolvedData.slug || "",
      imageUrl: resolvedData.image || resolvedData.icon || null,
      productCount: resolvedData.productCount || 0,
      color: resolvedData.color || null,
    },
  };
}

// ============================================================
// 4. SKELETON LOADER
// ============================================================

const SkeletonLoader = memo(({ title }: { title?: string }) => (
  <div className="py-8 md:py-12">
    <div className="container mx-auto px-4">
      <div className="animate-pulse">
        {title && <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4" />}
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-[120px]">
              <div className="w-20 h-20 bg-gray-200 rounded-full" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));

SkeletonLoader.displayName = "SkeletonLoader";

// ============================================================
// 5. EMPTY STATE
// ============================================================

const EmptyState = memo(({ 
  previewMode, 
  hasItems, 
  itemsCount, 
  categoriesCount,
  categories 
}: {
  previewMode: boolean;
  hasItems: boolean;
  itemsCount: number;
  categoriesCount: number;
  categories: any[];
}) => {
  if (!previewMode) return null;

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
      <p className="text-amber-700 font-medium">
        {hasItems ? "Items configured but not found" : "No items configured"}
      </p>
      <p className="text-sm text-amber-600 max-w-md mx-auto">
        {hasItems ? (
          <>
            You have {itemsCount} items configured, but they couldn't be found in the store data.
            {categoriesCount === 0 && (
              <span className="block mt-2 text-xs font-bold text-amber-700">
                ⚠️ No categories found in store data. Please add categories to your store.
              </span>
            )}
          </>
        ) : (
          "Add categories, collections, or custom links in the builder."
        )}
      </p>
      {categoriesCount > 0 && (
        <div className="mt-3 text-xs text-amber-600">
          Available categories: {categoriesCount}
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {categories.slice(0, 5).map((cat: any) => (
              <span key={cat.id} className="bg-amber-100 px-2 py-0.5 rounded">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}
      {previewMode && (
        <div className="mt-3 text-[10px] text-amber-400">
          💡 Click "Publish Changes" to apply your configuration
        </div>
      )}
    </div>
  );
});

EmptyState.displayName = "EmptyState";

// ============================================================
// 6. ITEM COMPONENT (Memoized)
// ============================================================

interface CategoryItemProps {
  item: ResolvedItem;
  index: number;
  imageSize: { width: number; height: number; container: string };
  shapeClass: string;
  showCount: boolean;
  showNames: boolean;
  previewMode: boolean;
  isScrollable?: boolean;
}

const CategoryItem = memo(({ 
  item, 
  index, 
  imageSize, 
  shapeClass, 
  showCount, 
  showNames, 
  previewMode,
  isScrollable = false,
}: CategoryItemProps) => {
  const imageUrl = item.imageUrl || item.resolvedData?.imageUrl;
  const hasImage = imageUrl?.startsWith("http");
  const initial = (item.title || item.resolvedData?.name || "?").charAt(0).toUpperCase();
  const bgColor = item.resolvedData?.color || "#006044";
  const [imgError, setImgError] = useState(false);

  const content = (
    <div
      className={cn(
        "flex flex-col items-center group transition-all duration-300",
        !previewMode && "hover:scale-105",
        !item.isEnabled && "opacity-40 pointer-events-none",
        isScrollable && "cursor-pointer"
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "relative overflow-hidden border-2 border-gray-100 transition-all duration-300",
            shapeClass,
            imageSize.container,
            !previewMode && "group-hover:shadow-xl group-hover:border-[#006044]/30"
          )}
          style={{ backgroundColor: (!hasImage || imgError) ? bgColor : undefined }}
        >
          {hasImage && !imgError ? (
            <Image
              src={imageUrl || "/images/placeholder.png"}
              alt={item.title || item.resolvedData?.name || "Category"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes={`${imageSize.width}px`}
              priority={index < 4}
              loading={index < 4 ? "eager" : "lazy"}
              onError={() => setImgError(true)}
              quality={85}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl font-bold text-white select-none">
              {initial}
            </div>
          )}
        </div>
        {item.badge && (
          <span
            className={cn(
              "absolute -top-1 -right-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-full shadow-lg text-white",
              getBadgeColor(item.badge as keyof typeof BADGE_COLORS)
            )}
          >
            {item.badge}
          </span>
        )}
      </div>
      {showNames && (
        <p className={cn(
          "font-medium text-gray-800 mt-2 text-center line-clamp-2 transition-colors duration-300",
          isScrollable ? "text-xs md:text-sm" : "text-sm",
          !previewMode && "group-hover:text-[#006044]"
        )}>
          {item.title || item.resolvedData?.name || "Unnamed"}
        </p>
      )}
      {showCount && item.type !== "custom-link" && item.resolvedData?.productCount !== undefined && item.resolvedData.productCount > 0 && (
        <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
          {item.resolvedData.productCount} product{item.resolvedData.productCount !== 1 ? "s" : ""}
        </p>
      )}
      {!previewMode && item.isEnabled && (
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 mt-0.5 transform group-hover:translate-x-1">
          <ChevronRight className="w-4 h-4 text-[#006044]" />
        </div>
      )}
    </div>
  );

  // Preview mode or disabled
  if (previewMode || !item.isEnabled) {
    return content;
  }

  // Custom link
  if (item.type === "custom-link" && item.customLinkConfig) {
    const isInternal = item.customLinkConfig.url?.startsWith("/");
    const isExternal = !isInternal && item.customLinkConfig.openInNewTab;

    if (isExternal) {
      return (
        <a
          href={item.customLinkConfig.url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus:outline-none focus:ring-2 focus:ring-[#006044] focus:ring-offset-2 rounded-lg transition-all"
          aria-label={`Browse ${item.title || item.resolvedData?.name || "Custom Link"}`}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={item.customLinkConfig.url || "#"}
        className="focus:outline-none focus:ring-2 focus:ring-[#006044] focus:ring-offset-2 rounded-lg transition-all"
        target={isInternal ? undefined : "_blank"}
        rel={isInternal ? undefined : "noopener noreferrer"}
        aria-label={`Browse ${item.title || item.resolvedData?.name || "Custom Link"}`}
      >
        {content}
      </Link>
    );
  }

  // Category or Collection
  return (
    <Link
      href={item.href || "#"}
      className="focus:outline-none focus:ring-2 focus:ring-[#006044] focus:ring-offset-2 rounded-lg transition-all"
      aria-label={`Browse ${item.title || item.resolvedData?.name || "Category"}`}
    >
      {content}
    </Link>
  );
});

CategoryItem.displayName = "CategoryItem";

// ============================================================
// 7. SCROLLABLE CONTAINER WITH ENHANCED FEATURES
// ============================================================

interface ScrollableContainerProps {
  children: React.ReactNode;
  itemsCount: number;
  itemWidth?: number;
  gap?: number;
  snapScroll?: boolean;
  showArrows?: boolean;
  autoScroll?: boolean;
  autoScrollSpeed?: number;
  previewMode?: boolean;
  centered?: boolean;
}

const ScrollableContainer = memo(({
  children,
  itemsCount,
  itemWidth = 120,
  gap = 16,
  snapScroll = true,
  showArrows = true,
  autoScroll = false,
  autoScrollSpeed = 3000,
  previewMode = false,
  centered = false,
}: ScrollableContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isOverflowing = itemsCount > 4;

  // Check scroll position for arrows
  const checkScrollButtons = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  }, []);

  // Scroll to direction
  const scrollTo = useCallback((direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, []);

  // Mouse wheel horizontal scroll
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !isOverflowing) return;

    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    
    if (isHorizontalScroll) {
      e.preventDefault();
      container.scrollLeft += e.deltaX;
    } else {
      // Convert vertical scroll to horizontal for better UX
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  }, [isOverflowing]);

  // Drag to scroll
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !isOverflowing) return;

    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  }, [isOverflowing]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const container = containerRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      const container = containerRef.current;
      if (container) {
        container.style.cursor = 'grab';
        container.style.userSelect = 'auto';
      }
    }
  }, [isDragging]);

  // Touch scroll with snap
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !isOverflowing) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  }, [isOverflowing]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;

    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    if (snapScroll && isOverflowing) {
      const container = containerRef.current;
      if (!container) return;

      const itemWidthWithGap = itemWidth + gap;
      const currentScroll = container.scrollLeft;
      const nearestItem = Math.round(currentScroll / itemWidthWithGap);
      const targetScroll = nearestItem * itemWidthWithGap;

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [snapScroll, isOverflowing, itemWidth, gap]);

  // Auto scroll
  useEffect(() => {
    if (!autoScroll || previewMode || !isOverflowing) return;

    const startAutoScroll = () => {
      autoScrollTimerRef.current = setInterval(() => {
        const container = containerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        const maxScroll = scrollWidth - clientWidth;

        if (scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const nextScroll = scrollLeft + container.clientWidth * 0.6;
          container.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }, autoScrollSpeed);
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    };
  }, [autoScroll, previewMode, isOverflowing, autoScrollSpeed]);

  // Pause auto scroll on hover
  const handleMouseEnter = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  const handleMouseLeaveContainer = useCallback(() => {
    if (autoScroll && !previewMode && isOverflowing) {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
      
      autoScrollTimerRef.current = setInterval(() => {
        const container = containerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        const maxScroll = scrollWidth - clientWidth;

        if (scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const nextScroll = scrollLeft + container.clientWidth * 0.6;
          container.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }, autoScrollSpeed);
    }
  }, [autoScroll, previewMode, isOverflowing, autoScrollSpeed]);

  // Check scroll buttons on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollButtons();

    const resizeObserver = new ResizeObserver(() => {
      checkScrollButtons();
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [checkScrollButtons]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollTo('left');
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        scrollTo('right');
        e.preventDefault();
      }
    };

    const container = containerRef.current;
    if (container && isOverflowing) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [scrollTo, isOverflowing]);

  // Don't show arrows or scroll features if not overflowing
  if (!isOverflowing) {
    return (
      <div className={cn("flex", centered && "justify-center")}>
        {children}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      {showArrows && showLeftArrow && (
        <button
          onClick={() => scrollTo('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 hover:shadow-xl border border-gray-100 backdrop-blur-sm hidden md:flex items-center justify-center"
          aria-label="Scroll left"
          style={{ transform: 'translateY(-50%)' }}
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className={cn(
          "flex overflow-x-auto overflow-y-visible pb-4 px-1 scrollbar-hide",
          isDragging && "cursor-grabbing"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          gap: `${gap}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          scrollSnapType: snapScroll ? 'x mandatory' : 'none',
          scrollPadding: '0 20px',
        }}
        onScroll={checkScrollButtons}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseMoveCapture={handleMouseLeaveContainer}
        role="region"
        aria-label="Category navigation"
        tabIndex={0}
      >
        {React.Children.map(children, (child) => (
          <div
            className="flex-shrink-0 transition-all duration-300"
            style={{
              width: `${itemWidth}px`,
              scrollSnapAlign: snapScroll ? 'start' : 'none',
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {showArrows && showRightArrow && (
        <button
          onClick={() => scrollTo('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 hover:shadow-xl border border-gray-100 backdrop-blur-sm hidden md:flex items-center justify-center"
          aria-label="Scroll right"
          style={{ transform: 'translateY(-50%)' }}
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
      )}

      {/* Scroll Indicators (Dots) */}
      <div className="flex justify-center gap-1 mt-4">
        {Array.from({ length: Math.min(itemsCount, 10) }).map((_, index) => {
          const container = containerRef.current;
          const isActive = container 
            ? Math.abs(container.scrollLeft / (itemWidth + gap) - index) < 0.5
            : index === 0;
          
          return (
            <button
              key={index}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                isActive ? 'w-6 bg-[#006044]' : 'w-2 bg-gray-300 hover:bg-gray-400'
              )}
              onClick={() => {
                const container = containerRef.current;
                if (!container) return;
                container.scrollTo({
                  left: index * (itemWidth + gap),
                  behavior: 'smooth'
                });
              }}
              aria-label={`Scroll to item ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
});

ScrollableContainer.displayName = "ScrollableContainer";

// ============================================================
// 8. MAIN COMPONENT
// ============================================================

export function CategoryIconStrip({
  settings: rawSettings,
  data = {},
  previewMode = false,
  className,
}: CategoryIconStripProps) {
  // Normalize settings
  const settings = useMemo(() => {
    const migrated = migrateCategoryIconStripSettings(rawSettings) as any;
    return {
      title: migrated.title ?? "Shop by Category",
      subtitle: migrated.subtitle ?? "",
      items: migrated.items || [],
      displayCount: migrated.displayCount ?? 12,
      layout: migrated.layout ?? "scrollable",
      columns: migrated.columns ?? "5",
      showProductCount: migrated.showProductCount ?? true,
      imageSize: (migrated.imageSize ?? "medium") as keyof typeof IMAGE_SIZES,
      showCategoryNames: migrated.showCategoryNames ?? true,
      imageShape: (migrated.imageShape ?? "circle") as keyof typeof SHAPE_CLASSES,
      itemWidth: migrated.itemWidth ?? 120,
      gap: migrated.gap ?? 16,
      snapScroll: migrated.snapScroll ?? true,
      showArrows: migrated.showArrows ?? true,
      autoScroll: migrated.autoScroll ?? false,
      autoScrollSpeed: migrated.autoScrollSpeed ?? 3000,
      _legacy: migrated._legacy || false,
      _legacyCategoryIds: migrated._legacyCategoryIds || [],
    };
  }, [rawSettings]);

  const categories = data?.categories || [];
  const collections = data?.collections || [];
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Resolve items
  const resolvedItems = useMemo(() => {
    // Legacy mode
    if (settings._legacy && settings._legacyCategoryIds.length > 0) {
      return settings._legacyCategoryIds
        .map((id: string) => {
          const cat = categories.find((c) => c.id === id);
          if (!cat) return null;
          return {
            id: `legacy-${id}`,
            type: "category" as const,
            targetId: id,
            isEnabled: true,
            title: cat.name,
            imageUrl: cat.image || cat.icon || null,
            badge: null,
            order: 0,
            href: `/collections/${cat.slug}`,
            resolvedData: {
              name: cat.name,
              slug: cat.slug,
              imageUrl: cat.image || cat.icon || null,
              productCount: cat.productCount || 0,
              color: cat.color || null,
            },
          };
        })
        .filter(Boolean) as ResolvedItem[];
    }

    // New mode
    if (!settings.items || settings.items.length === 0) {
      return [];
    }

    return settings.items
      .map((item: any) => resolveItem(item, categories, collections))
      .filter(Boolean)
      .filter((item: ResolvedItem) => item.isEnabled)
      .sort((a: ResolvedItem, b: ResolvedItem) => a.order - b.order)
      .slice(0, settings.displayCount);
  }, [settings, categories, collections]);

  // Loading
  if (isLoading) {
    return <SkeletonLoader title={settings.title || undefined} />;
  }

  // Empty
  if (resolvedItems.length === 0) {
    return (
      <EmptyState
        previewMode={previewMode}
        hasItems={(settings.items?.length || 0) > 0 || (settings._legacyCategoryIds?.length || 0) > 0}
        itemsCount={settings.items?.length || settings._legacyCategoryIds?.length || 0}
        categoriesCount={categories.length}
        categories={categories}
      />
    );
  }

  // Render
  const imageSize = getImageSize(settings.imageSize);
  const shapeClass = getShapeClass(settings.imageShape);
  const showCount = settings.showProductCount !== false;
  const showNames = settings.showCategoryNames !== false;
  const shouldCenterItems = resolvedItems.length <= 4;

  // Grid layout
  if (settings.layout === "grid") {
    const columns = parseInt(settings.columns) || 5;
    const gridClass = GRID_COLUMNS[columns as keyof typeof GRID_COLUMNS] || GRID_COLUMNS[5];

    return (
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Header */}
          {(settings.title || settings.subtitle) && (
            <div className="text-center mb-8">
              {settings.title && (
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  {settings.title}
                </h2>
              )}
              {settings.subtitle && (
                <p className="text-gray-500 mt-2 text-sm md:text-base">
                  {settings.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Grid */}
          <div className={cn("grid gap-4 md:gap-6", gridClass, className)}>
            {resolvedItems.map((item: ResolvedItem, index: number) => (
              <div key={item.id} className="flex justify-center">
                <CategoryItem
                  item={item}
                  index={index}
                  imageSize={imageSize}
                  shapeClass={shapeClass}
                  showCount={showCount}
                  showNames={showNames}
                  previewMode={previewMode}
                  isScrollable={false}
                />
              </div>
            ))}
          </div>

          {/* Preview indicator */}
          {previewMode && (
            <div className="mt-6 text-center">
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                ⚡ Preview - {resolvedItems.length} items displayed
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Scrollable layout (default) with premium features
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        {(settings.title || settings.subtitle) && (
          <div className="text-center mb-8">
            {settings.title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {settings.title}
              </h2>
            )}
            {settings.subtitle && (
              <p className="text-gray-500 mt-2 text-sm md:text-base">
                {settings.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Scrollable Items with Premium Features */}
        <ScrollableContainer
          itemsCount={resolvedItems.length}
          itemWidth={settings.itemWidth}
          gap={settings.gap}
          snapScroll={settings.snapScroll}
          showArrows={settings.showArrows}
          autoScroll={settings.autoScroll}
          autoScrollSpeed={settings.autoScrollSpeed}
          previewMode={previewMode}
          centered={shouldCenterItems}
        >
          {resolvedItems.map((item: ResolvedItem, index: number) => (
            <CategoryItem
              key={item.id}
              item={item}
              index={index}
              imageSize={imageSize}
              shapeClass={shapeClass}
              showCount={showCount}
              showNames={showNames}
              previewMode={previewMode}
              isScrollable={true}
            />
          ))}
        </ScrollableContainer>

        {/* Preview indicator */}
        {previewMode && (
          <div className="mt-6 text-center">
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              ⚡ Preview - {resolvedItems.length} items displayed
            </span>
          </div>
        )}
      </div>
    </section>
  );
}