// app/admin/orders/page.tsx

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/ui/DataTable";
import { DataFilterBar } from "@/components/admin/ui/DataFilterBar";
import { orderColumns } from "./columns";
import { AdminOrdersService } from "@/services/admin-orders.service";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Order, ListOrdersResponse, OrderStatus, PaymentStatus } from "@/types/orders";

type OrdersResponseShape =
  | Order[]
  | { data: Order[]; meta?: ListOrdersResponse['meta'] }
  | { data: { data: Order[]; meta?: ListOrdersResponse['meta'] } };

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returned", value: "RETURNED" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "All Payment Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
  { label: "Partially Refunded", value: "PARTIALLY_REFUNDED" },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  // 1. URL State - Memoize to prevent unnecessary re-renders
  const page = useMemo(() => searchParams.get("page") || "1", [searchParams]);
  const search = useMemo(() => searchParams.get("search") || "", [searchParams]);
  const status = useMemo(() => searchParams.get("status") || "", [searchParams]);
  const paymentStatus = useMemo(() => searchParams.get("paymentStatus") || "", [searchParams]);
  const sort = useMemo(() => searchParams.get("sort") || "createdAt_desc", [searchParams]);

  // 2. Fetch Data with proper configuration to prevent infinite loops
  const { data, isLoading, isError, refetch } = useQuery<OrdersResponseShape>({
    queryKey: ["admin-orders", { page, search, status, paymentStatus, sort }],
    queryFn: () => AdminOrdersService.getOrders({
      page: Number(page),
      limit: 15,
      search: search || undefined,
      status: status ? (status as OrderStatus) : undefined,
      paymentStatus: paymentStatus ? (paymentStatus as PaymentStatus) : undefined,
      sort: sort || undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000,
  });

  // ✅ FIX: Handle both response structures
  // The API might return { data: orders[] } or { data: { data: orders[], meta: {} } }
  const ordersData = useMemo(() => {
    if (!data) {
      return { orders: [], meta: { total: 0, page: Number(page), limit: 15, totalPages: 1 } };
    }

    // Handle the expected API response shape
    if (Array.isArray(data)) {
      return {
        orders: data,
        meta: { total: data.length, page: Number(page), limit: 15, totalPages: Math.ceil(data.length / 15) },
      };
    }

    if (data && Array.isArray((data as any).data)) {
      const shapedData = data as { data: Order[]; meta?: ListOrdersResponse['meta'] };
      return {
        orders: shapedData.data,
        meta: shapedData.meta || { total: shapedData.data.length, page: Number(page), limit: 15, totalPages: Math.ceil(shapedData.data.length / 15) },
      };
    }

    if (data && data.data && Array.isArray((data.data as any).data)) {
      const shapedData = data as { data: { data: Order[]; meta?: ListOrdersResponse['meta'] } };
      return {
        orders: shapedData.data.data,
        meta: shapedData.data.meta || { total: shapedData.data.data.length, page: Number(page), limit: 15, totalPages: Math.ceil(shapedData.data.data.length / 15) },
      };
    }

    return { orders: [], meta: { total: 0, page: Number(page), limit: 15, totalPages: 1 } };
  }, [data, page]);

  // Debug: Log what we're getting
  console.log("🔍 API Response:", data);
  console.log("📊 Processed Data:", ordersData);

  // Extract orders and meta
  const orders = ordersData.orders || [];
  const meta = ordersData.meta || { total: 0, page: 1, limit: 15, totalPages: 1 };
  const totalItems = meta.total || 0;
  const pageCount = meta.totalPages || 1;

  // 3. Bulk Update Mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: () => AdminOrdersService.bulkUpdateStatus(selectedRowIds, bulkStatus),
    onSuccess: () => {
      toast.success(`Successfully updated ${selectedRowIds.length} orders.`);
      setSelectedRowIds([]);
      setBulkStatus("");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update orders.");
    },
  });

  const handleExport = useCallback(async () => {
    try {
      const toastId = toast.loading("Generating CSV...");
      await AdminOrdersService.exportCsv(status);
      toast.dismiss(toastId);
      toast.success("Download started!");
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to export orders.");
    }
  }, [status]);

  // ✅ Memoize columns with select checkbox
  const tableColumns = useMemo(() => {
    return [
      {
        id: "select",
        header: ({ table }: any) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 text-[#217A6E] rounded border-gray-300 focus:ring-[#217A6E]"
          />
        ),
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              row.getToggleSelectedHandler()(e);
              if (e.target.checked) {
                setSelectedRowIds(prev => [...prev, row.original.id]);
              } else {
                setSelectedRowIds(prev => prev.filter(id => id !== row.original.id));
              }
            }}
            className="w-4 h-4 text-[#217A6E] rounded border-gray-300 focus:ring-[#217A6E]"
          />
        ),
        enableSorting: false,
      },
      ...orderColumns,
    ];
  }, []);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">View, track, and manage all store orders.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#217A6E] mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">View, track, and manage all store orders.</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-12">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">Failed to load orders</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#217A6E] text-white rounded-lg hover:bg-[#004d36] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500 mt-1">
          View, track, and manage all store orders.
          {totalItems > 0 && (
            <span className="ml-2 font-medium text-gray-700">
              ({totalItems} {totalItems === 1 ? 'order' : 'orders'})
            </span>
          )}
        </p>
      </div>

      <DataFilterBar
        searchPlaceholder="Search Order ID, Email, or Phone..."
        statusOptions={STATUS_OPTIONS}
        paymentStatusOptions={PAYMENT_STATUS_OPTIONS}
        onExport={handleExport}
      />

      {/* Bulk Actions Panel */}
      {selectedRowIds.length > 0 && (
        <div className="mb-4 p-4 bg-[#217A6E]/10 border border-[#217A6E]/20 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <span className="font-semibold text-[#217A6E]">
            {selectedRowIds.length} {selectedRowIds.length === 1 ? 'order' : 'orders'} selected
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#217A6E] focus:border-transparent"
              aria-label="Select status for bulk update"
            >
              <option value="">Update Status To...</option>
              {STATUS_OPTIONS.filter(opt => opt.value !== "").map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => bulkUpdateMutation.mutate()}
              disabled={!bulkStatus || bulkUpdateMutation.isPending}
              className="px-6 py-2 bg-[#217A6E] text-white text-sm font-bold rounded-lg hover:bg-[#004d36] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {bulkUpdateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Apply Bulk Action
            </button>
            <button
              onClick={() => {
                setSelectedRowIds([]);
                setBulkStatus("");
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={tableColumns}
        data={orders}
        pageCount={pageCount}
        totalItems={totalItems}
        isLoading={isLoading}
        noBorder
      />
    </div>
  );
}