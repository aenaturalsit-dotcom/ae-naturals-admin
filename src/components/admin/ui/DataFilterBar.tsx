// components/admin/ui/DataFilterBar.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Download, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface DataFilterBarProps {
  searchPlaceholder?: string;
  statusOptions?: { label: string; value: string }[];
  paymentStatusOptions?: { label: string; value: string }[];
  onExport?: () => void;
}

export const DataFilterBar: React.FC<DataFilterBarProps> = ({
  searchPlaceholder = "Search...",
  statusOptions = [],
  paymentStatusOptions = [],
  onExport,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current values from URL
  const currentSearch = useMemo(() => searchParams.get("search") || "", [searchParams]);
  const currentStatus = useMemo(() => searchParams.get("status") || "", [searchParams]);
  const currentPaymentStatus = useMemo(() => searchParams.get("paymentStatus") || "", [searchParams]);

  // Local state
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync search to URL - only when debounced value changes
  useEffect(() => {
    if (debouncedSearch === currentSearch) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, currentSearch, pathname, router, searchParams]);

  const handleStatusChange = useCallback((value: string) => {
    if (value === currentStatus) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentStatus, pathname, router, searchParams]);

  const handlePaymentStatusChange = useCallback((value: string) => {
    if (value === currentPaymentStatus) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("paymentStatus", value);
    } else {
      params.delete("paymentStatus");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentPaymentStatus, pathname, router, searchParams]);

  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
    setSearchTerm("");
  }, [pathname, router]);

  const hasFilters = currentSearch || currentStatus || currentPaymentStatus;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#217A6E] focus:border-transparent outline-none transition-all"
            aria-label="Search"
          />
        </div>

        {/* Status Filter */}
        {statusOptions.length > 0 && (
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#217A6E] focus:border-transparent outline-none min-w-[140px]"
            aria-label="Filter by status"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Payment Status Filter */}
        {paymentStatusOptions.length > 0 && (
          <select
            value={currentPaymentStatus}
            onChange={(e) => handlePaymentStatusChange(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#217A6E] focus:border-transparent outline-none min-w-[140px]"
            aria-label="Filter by payment status"
          >
            {paymentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}

        {/* Export Button */}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#217A6E] text-white text-sm font-medium rounded-lg hover:bg-[#004d36] transition-colors ml-auto"
            aria-label="Export orders"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
      </div>
    </div>
  );
};