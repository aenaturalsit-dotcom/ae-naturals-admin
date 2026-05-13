// src/components/admin/ui/DataFilterBar.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils"; // Import your utility

interface FilterOption {
  label: string;
  value: string;
}

interface DataFilterBarProps {
  searchPlaceholder?: string;
  statusOptions?: FilterOption[];
  onExport?: () => void;
}

export function DataFilterBar({
  searchPlaceholder = "Search...",
  statusOptions = [],
  onExport,
}: DataFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const currentSearchInUrl = searchParams.get("search") || "";

    if (debouncedSearch !== currentSearchInUrl) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
        params.set("page", "1");
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("status", e.target.value);
      params.set("page", "1");
    } else {
      params.delete("status");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentStatus = searchParams.get("status") || "";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
          </span>

          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Use cn() or a single line string to avoid whitespace mismatches
            className={cn(
              "w-full h-10 pl-9 pr-9 bg-white border border-gray-200 rounded-xl",
              "text-sm text-gray-800 placeholder:text-gray-400 shadow-sm",
              "focus:ring-2 focus:ring-[#217A6E] focus:border-[#217A6E] outline-none transition-all"
            )}
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        {statusOptions.length > 0 && (
          <div className="relative shrink-0">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            </span>

            <select
              value={currentStatus}
              onChange={handleStatusChange}
              // Formatted as a clean string to prevent hydration errors
              className={cn(
                "appearance-none h-10 pl-9 pr-8 bg-white border border-gray-200 rounded-xl",
                "text-sm font-medium text-gray-700 shadow-sm",
                "focus:ring-2 focus:ring-[#217A6E] focus:border-[#217A6E] outline-none cursor-pointer transition-all"
              )}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            </span>
          </div>
        )}
      </div>

      {/* Right: Export */}
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          className="w-full sm:w-auto h-10 px-5 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
        >
          Export CSV
        </button>
      )}
    </div>
  );
}