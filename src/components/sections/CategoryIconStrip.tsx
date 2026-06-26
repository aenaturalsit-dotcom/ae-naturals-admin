// src/components/sections/CategoryIconStrip.tsx

"use client";

import React, { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import type { CategoryIconStripSettings } from "@/lib/validators/storefront";
import { cn } from "@/lib/utils";

interface CategoryIconStripProps {
  settings: CategoryIconStripSettings;
  data?: {
    categories?: Array<{
      id: string;
      name: string;
      slug: string;
      productCount?: number;
      icon?: string | null;
      image?: string | null;
    }>;
    [key: string]: any;
  };
  previewMode?: boolean;
  index?: number;
  isActive?: boolean;
  className?: string;
}

// Image size mapping
const getImageSize = (size: 'small' | 'medium' | 'large' = 'medium') => {
  switch (size) {
    case 'small':
      return { 
        width: 64, 
        height: 64, 
        container: 'w-16 h-16',
        iconSize: 'text-2xl'
      };
    case 'large':
      return { 
        width: 100, 
        height: 100, 
        container: 'w-24 h-24',
        iconSize: 'text-4xl'
      };
    default:
      return { 
        width: 80, 
        height: 80, 
        container: 'w-20 h-20',
        iconSize: 'text-3xl'
      };
  }
};

// Shape mapping
const getImageShape = (shape: 'circle' | 'square' | 'rounded' = 'circle') => {
  switch (shape) {
    case 'square':
      return 'rounded-none';
    case 'rounded':
      return 'rounded-2xl';
    default:
      return 'rounded-full';
  }
};

export function CategoryIconStrip({
  settings,
  data,
  previewMode = false,
  index = 0,
  isActive = true,
  className,
}: CategoryIconStripProps) {
  const {
    title = 'Shop by Category',
    subtitle,
    categoryIds = [],
    layout = 'grid',
    columns = '5',
    showProductCount = true,
    imageSize = 'medium',
    showCategoryNames = true,
    imageShape = 'circle',
    displayCount = 12,
  } = settings;

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process categories from data prop (backend)
  useEffect(() => {
    setIsLoading(true);

    // If we have categories data from the backend
    if (data?.categories && data.categories.length > 0) {
      // Filter categories based on selected IDs
      const filtered = data.categories.filter((cat: any) => 
        categoryIds.includes(cat.id)
      );
      
      if (filtered.length > 0) {
        setCategories(filtered);
        setIsLoading(false);
        return;
      }
      
      // If no filtered categories found, but we have categoryIds
      if (categoryIds.length > 0) {
        // Try to find all selected categories
        const foundCategories = categoryIds
          .map(id => data.categories?.find((cat: any) => cat.id === id))
          .filter(Boolean);
        
        if (foundCategories.length > 0) {
          setCategories(foundCategories);
          setIsLoading(false);
          return;
        }
      }
      
      // No matching categories
      setCategories([]);
      setIsLoading(false);
      return;
    }

    // If no data from backend but we have categoryIds, show loading
    if (categoryIds.length > 0 && !data?.categories) {
      // Wait for data to load
      setIsLoading(true);
      return;
    }

    // No categories at all
    setCategories([]);
    setIsLoading(false);
  }, [data?.categories, categoryIds]);

  // Memoize displayed categories
  const displayCategories = useMemo(() => {
    if (isLoading) return [];
    
    const validCategories = categories
      .filter(cat => cat !== undefined && cat !== null)
      .slice(0, displayCount);

    return validCategories;
  }, [categories, displayCount, isLoading]);

  // Debug logging (remove in production)
  useEffect(() => {
    if (previewMode) {
      console.log('CategoryIconStrip Debug:', {
        categoryIds,
        totalCategoriesFromBackend: data?.categories?.length || 0,
        filteredCategories: categories.length,
        displayCategories: displayCategories.length,
        isLoading,
        previewMode,
        hasData: !!data?.categories,
      });
    }
  }, [categoryIds, categories, displayCategories, isLoading, previewMode, data]);

  // ============================================================
  // RENDER: Empty State - No categories selected
  // ============================================================
  if (previewMode && categoryIds.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-3xl">🏷️</span>
          </div>
          <div>
            <p className="text-gray-600 font-semibold text-lg">Category Icon Strip</p>
            <p className="text-sm text-gray-400 mt-1">
              No categories selected
            </p>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">
              Click on this section in the builder sidebar to configure which categories to display
            </p>
          </div>
          <div className="flex gap-3 mt-4 opacity-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
                <div className="w-12 h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Loading State
  // ============================================================
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            {title && <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4" />}
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-gray-200 rounded-full" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Categories Selected But Not Found
  // ============================================================
  if (previewMode && categoryIds.length > 0 && displayCategories.length === 0) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-amber-500" />
          <p className="text-amber-700 font-medium">No categories found</p>
          <p className="text-sm text-amber-600 max-w-md">
            Selected categories ({categoryIds.length}) could not be found. 
            Please ensure categories exist in your store.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {categoryIds.slice(0, 5).map((id) => (
              <span key={id} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                ID: {id.substring(0, 8)}...
              </span>
            ))}
            {categoryIds.length > 5 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                +{categoryIds.length - 5} more
              </span>
            )}
          </div>
          <p className="text-[10px] text-amber-500 mt-2">
            💡 Add categories to your store or update the selected categories
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: No Categories - Not in Preview
  // ============================================================
  if (!previewMode && displayCategories.length === 0) {
    return null;
  }

  // ============================================================
  // RENDER: Main Component
  // ============================================================
  const imageDimensions = getImageSize(imageSize);
  const shapeClass = getImageShape(imageShape);
  const numColumns = parseInt(columns);

  const GridLayout = () => (
    <div
      className={cn(
        'grid gap-4 md:gap-6',
        {
          'grid-cols-4': numColumns === 4,
          'grid-cols-5': numColumns === 5,
          'grid-cols-6': numColumns === 6,
          'grid-cols-3 md:grid-cols-4 lg:grid-cols-5': !numColumns,
        },
        className
      )}
    >
      {displayCategories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          imageSize={imageDimensions}
          showProductCount={showProductCount}
          previewMode={previewMode}
          shapeClass={shapeClass}
          showCategoryName={showCategoryNames}
        />
      ))}
    </div>
  );

  const ScrollableLayout = () => (
    <div className="relative">
      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex gap-6 min-w-max px-1">
          {displayCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              imageSize={imageDimensions}
              showProductCount={showProductCount}
              previewMode={previewMode}
              shapeClass={shapeClass}
              showCategoryName={showCategoryNames}
              isScrollable={true}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-500 mt-2 text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {layout === 'scrollable' ? <ScrollableLayout /> : <GridLayout />}

        {/* Preview indicator */}
        {previewMode && displayCategories.length > 0 && (
          <div className="mt-6 text-center">
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              ⚡ Preview Mode - {displayCategories.length} categories displayed
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// Category Item Component
// ============================================================

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    image?: string | null;
    color?:string | null;
    productCount?: number;
  };
  imageSize: { width: number; height: number; container: string };
  showProductCount: boolean;
  previewMode: boolean;
  shapeClass: string;
  showCategoryName: boolean;
  isScrollable?: boolean;
}

// In the CategoryItem component, update the image rendering:

function CategoryItem({
  category,
  imageSize,
  showProductCount,
  previewMode,
  shapeClass,
  showCategoryName,
  isScrollable = false,
}: CategoryItemProps) {
  // Use category.image or category.icon
  const imageUrl = category.image || category.icon;
  const hasImage = imageUrl && imageUrl.startsWith('http');
  const initial = category.name?.charAt(0)?.toUpperCase() || '?';
  
  // Use category color if available
  const bgColor = category.color || '#006044';
  console.log(category,"====================================image")
  const content = (
    <div className={cn(
      "flex flex-col items-center group cursor-pointer transition-all duration-200",
      !previewMode && "hover:scale-105"
    )}>
      {/* Icon/Image Container */}
      <div
        className={cn(
          'relative overflow-hidden border-2 border-gray-100',
          shapeClass,
          imageSize.container,
          'transition-all duration-300',
          !previewMode && 'group-hover:shadow-lg group-hover:shadow-[#006044]/10 group-hover:border-[#006044]/30',
          !previewMode && 'group-hover:bg-gradient-to-br group-hover:from-[#006044]/5 group-hover:to-[#006044]/10'
        )}
        style={{
          backgroundColor: hasImage ? undefined : bgColor,
        }}
      >
        {hasImage ? (
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full flex items-center justify-center text-2xl font-bold text-white';
                fallback.textContent = initial;
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
            {initial}
          </div>
        )}
      </div>

      {/* Category Name */}
      {showCategoryName && (
        <p className={cn(
          'font-medium text-gray-800 mt-2 text-center line-clamp-2',
          isScrollable ? 'text-sm' : 'text-xs md:text-sm'
        )}>
          {category.name}
        </p>
      )}

      {/* Product Count */}
      {showProductCount && category.productCount !== undefined && category.productCount > 0 && (
        <p className="text-xs text-gray-400 mt-0.5">
          {category.productCount} product{category.productCount !== 1 ? 's' : ''}
        </p>
      )}

      {/* Hover indicator - only in non-preview */}
      {!previewMode && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
          <ChevronRight className="w-4 h-4 text-[#006044] rotate-0 group-hover:rotate-90 transition-transform" />
        </div>
      )}
    </div>
  );

  // In preview mode, don't wrap with Link
  if (previewMode) {
    return content;
  }

  return (
    <Link 
      href={`/collections/${category.slug}`} 
      className="focus:outline-none focus:ring-2 focus:ring-[#006044] focus:ring-offset-2 rounded-lg"
    >
      {content}
    </Link>
  );
}