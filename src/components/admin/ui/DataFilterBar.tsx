// src\components\admin\ui\DataFilterBar.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

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

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync Search to URL safely without infinite loops
  useEffect(() => {
    const currentSearchInUrl = searchParams.get("search") || "";

    // ONLY push a router update if the debounced value differs from the URL
    if (debouncedSearch !== currentSearchInUrl) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
        params.set("page", "1"); // Reset page on new search
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  // Handle Status Dropdown
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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#217A6E] focus:border-[#217A6E] outline-none transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {statusOptions.length > 0 && (
          <div className="relative shrink-0">
            <select
              value={currentStatus}
              onChange={handleStatusChange}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#217A6E] focus:border-[#217A6E] outline-none cursor-pointer shadow-sm"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {onExport && (
        <button
          onClick={onExport}
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-gray-800 transition-colors"
        >
          Export CSV
        </button>
      )}
    </div>
  );
}