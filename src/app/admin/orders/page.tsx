"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/ui/DataTable";
import { orderColumns } from "./columns";
import { AdminOrdersService } from "@/services/admin-orders.service";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const TABS = [
  { id: "ALL", label: "All" },
  { id: "UNFULFILLED", label: "Unfulfilled" },
  { id: "UNPAID", label: "Unpaid" },
  { id: "OPEN", label: "Open" },
  { id: "CLOSED", label: "Closed" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // URL State
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const tab = searchParams.get("tab") || "ALL";

  const [searchTerm, setSearchTerm] = useState(search);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync Search to URL
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

  // Handle Tab Change
  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "ALL") {
      params.delete("tab");
    } else {
      params.set("tab", tabId);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Fetch Data
  const { data: responseData, isLoading } = useQuery({
    queryKey: ["admin-orders", { page, search, tab }],
    queryFn: () => AdminOrdersService.getOrders({ page, limit: 15, search, tab }),
  });

  // Extract the actual array of orders from the response payload
  const orders = responseData?.data || [];
  const meta = responseData?.meta || { totalPages: 1, total: 0 };

  // Inject checkbox row selection logic into columns
  const tableColumns = React.useMemo(() => {
    return [
      {
        id: "select",
        header: ({ table }: any) => (
          <div className="px-1">
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
            />
          </div>
        ),
        cell: ({ row }: any) => (
          <div className="px-1">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(e) => {
                row.getToggleSelectedHandler()(e);
                if (e.target.checked) setSelectedRowIds((prev) => [...prev, row.original.id]);
                else setSelectedRowIds((prev) => prev.filter((id) => id !== row.original.id));
              }}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
            />
          </div>
        ),
        enableSorting: false,
      },
      ...orderColumns.slice(1),
    ];
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 bg-[#f4f4f5] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
          Create order
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center px-4 pt-2 border-b border-gray-200 bg-white overflow-x-auto scrollbar-hide">
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 flex items-center justify-between gap-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <ArrowUpDown className="w-4 h-4" /> Sort
            </button>
          </div>
        </div>

        {/* Selected Rows Action Bar */}
        {selectedRowIds.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between animate-in fade-in">
            <span className="text-sm font-medium text-gray-700">
              {selectedRowIds.length} selected
            </span>
            <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Mark as fulfilled
            </button>
          </div>
        )}

        {/* Table */}
        <DataTable
          columns={tableColumns}
          data={orders} // 🔥 FIX: Pass the extracted orders array here
          pageCount={meta.totalPages}
          totalItems={meta.total}
          isLoading={isLoading}
          noBorder
        />
      </div>
    </div>
  );
}