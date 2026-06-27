// components/admin/ui/DataTable.tsx

"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  totalItems: number;
  isLoading?: boolean;
  noBorder?: boolean;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  totalItems,
  isLoading = false,
  noBorder = false,
  onPageChange,
  currentPage: externalPage,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use external page if provided, otherwise from URL
  // const currentPage = externalPage ?? Number(searchParams.get("page")) || 1;
  const currentPage = externalPage ?? (Number(searchParams.get("page")) || 1);


  // Debug log to see what's being passed
  useEffect(() => {
    console.log("📊 DataTable Debug:", {
      dataLength: data?.length || 0,
      pageCount,
      totalItems,
      currentPage,
      isLoading,
      hasData: data && data.length > 0,
    });
  }, [data, pageCount, totalItems, currentPage, isLoading]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pageCount || 1,
  });

  // URL-driven pagination with optional callback
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (onPageChange) {
        onPageChange(newPage);
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [pathname, router, searchParams, onPageChange]
  );

  // If no data and not loading, show empty state
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className={`bg-white overflow-hidden ${noBorder ? '' : 'rounded-xl border border-gray-200 shadow-sm'}`}>
        <div className="p-12 text-center">
          <p className="text-gray-500 font-medium">No results found.</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Conditionally apply border/shadow */}
      <div className={`bg-white overflow-hidden ${noBorder ? '' : 'rounded-xl border border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs uppercase bg-gray-50/80 text-gray-500 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="h-48 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#217A6E]" />
                    <p className="mt-2 text-gray-500 font-medium">Loading data...</p>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#217A6E]/5 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-48 text-center text-gray-500 font-medium">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{data.length}</span> of{" "}
            <span className="font-bold text-gray-900">{totalItems}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-gray-900 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              Page {currentPage} of {pageCount || 1}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount || isLoading || pageCount === 0}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}