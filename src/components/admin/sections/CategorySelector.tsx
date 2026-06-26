// src/components/admin/sections/CategorySelector.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  icon?: string | null;
  image?: string | null;
}

interface CategorySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelect?: number;
  placeholder?: string;
  disabled?: boolean;
  // NEW: Receive categories from parent
  categories?: Category[];
  isLoading?: boolean;
}

export function CategorySelector({
  selectedIds,
  onChange,
  maxSelect = 20,
  placeholder = 'Search categories...',
  disabled = false,
  categories = [],
  isLoading = false,
}: CategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!debouncedSearch) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [categories, debouncedSearch]);

  // Get selected category objects
  const selectedCategories = useMemo(() => {
    return categories.filter((cat) => selectedIds.includes(cat.id));
  }, [categories, selectedIds]);

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    if (disabled) return;
    
    const isSelected = selectedIds.includes(categoryId);
    if (isSelected) {
      onChange(selectedIds.filter((id) => id !== categoryId));
    } else if (selectedIds.length < maxSelect) {
      onChange([...selectedIds, categoryId]);
    }
  };

  // Remove category from selection
  const removeCategory = (categoryId: string) => {
    onChange(selectedIds.filter((id) => id !== categoryId));
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  // ============================================================
  // RENDER: Selected Categories Display
  // ============================================================
  const renderSelectedCategories = () => {
    if (selectedCategories.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl min-h-[48px] border border-gray-100">
        {selectedCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm shadow-sm"
          >
            {/* Category Icon/Initial */}
            {category.icon ? (
              <img
                src={category.icon}
                alt={category.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-[#006044]/10 text-[#006044] flex items-center justify-center text-[10px] font-bold">
                {category.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-medium">{category.name}</span>
            <button
              onClick={() => removeCategory(category.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              disabled={disabled}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {selectedIds.length >= maxSelect && (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
            Max {maxSelect} categories
          </span>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER: Search Input
  // ============================================================
  const renderSearchInput = () => {
    const isDisabled = disabled || selectedIds.length >= maxSelect;

    return (
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              // Delay closing to allow click on dropdown items
              setTimeout(() => setIsOpen(false), 200);
            }}
            placeholder={
              isDisabled ? 'Selection limit reached' : placeholder
            }
            className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:border-[#006044] focus:ring-2 focus:ring-[#006044]/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-400"
            disabled={isDisabled}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={18} />
          )}
        </div>

        {/* Dropdown Results */}
        {isOpen && !isDisabled && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <span className="text-sm">Loading categories...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-4 text-center">
                {categories.length === 0 ? (
                  <div className="text-gray-400 text-sm">
                    <p>No categories available</p>
                    <p className="text-xs mt-1 text-gray-300">
                      Please add categories to your store first
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No matching categories found</p>
                )}
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = selectedIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-[#006044]/5' : ''
                    }`}
                  >
                    {/* Category Icon/Initial */}
                    {category.icon ? (
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Category Info */}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{category.name}</p>
                      {category.productCount !== undefined && (
                        <p className="text-xs text-gray-400">
                          {category.productCount} products
                        </p>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#006044] text-white flex items-center justify-center flex-shrink-0">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER: Selection Counter
  // ============================================================
  const renderSelectionCounter = () => {
    if (selectedIds.length === 0) {
      return (
        <div className="text-xs text-gray-400">
          Select categories to display in the icon strip
        </div>
      );
    }

    return (
      <div className="flex justify-between text-xs text-gray-400">
        <span>
          {selectedIds.length} / {maxSelect} categories selected
        </span>
        <button
          onClick={clearAll}
          className="text-red-500 hover:text-red-700 font-medium transition-colors"
          disabled={disabled}
        >
          Clear all
        </button>
      </div>
    );
  };

  // ============================================================
  // RENDER: Info Message
  // ============================================================
  const renderInfoMessage = () => {
    if (categories.length === 0 && !isLoading) {
      return (
        <div className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
          ⚠️ No categories found in your store. Please add categories first.
        </div>
      );
    }

    if (selectedIds.length === 0 && categories.length > 0) {
      return (
        <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">
          💡 Search and select categories to display in the icon strip
        </div>
      );
    }

    return null;
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="space-y-4">
      {/* Selected Categories */}
      {renderSelectedCategories()}

      {/* Search Input */}
      {renderSearchInput()}

      {/* Selection Counter */}
      {renderSelectionCounter()}

      {/* Info Message */}
      {renderInfoMessage()}
    </div>
  );
}