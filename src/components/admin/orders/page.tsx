// src\components\admin\orders\page.tsx

"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/admin/ui/DataTable";
import { DataFilterBar } from "@/components/admin/ui/DataFilterBar";
import { orderColumns } from "./columns";
import { AdminOrdersService } from "@/services/admin-orders.service";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  // 1. URL State
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  // 2. Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", { page, search, status }],
    queryFn: () => AdminOrdersService.getOrders({ page, limit: 15, search, status }),
  });

  // 3. Bulk Update Mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: () => AdminOrdersService.bulkUpdateStatus(selectedRowIds, bulkStatus),
    onSuccess: () => {
      toast.success(`Successfully updated ${selectedRowIds.length} orders.`);
      setSelectedRowIds([]);
      setBulkStatus("");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Failed to update orders."),
  });

  const handleExport = async () => {
    try {
      toast.loading("Generating CSV...");
      await AdminOrdersService.exportCsv(status);
      toast.dismiss();
      toast.success("Download started!");
    } catch (e) {
      toast.error("Failed to export orders.");
    }
  };

  // Inject checkbox row selection logic into columns
  const tableColumns = React.useMemo(() => {
    return [
      {
        id: "select",
        header: ({ table }: any) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 text-[#217A6E] rounded border-gray-300"
          />
        ),
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              row.getToggleSelectedHandler()(e);
              if (e.target.checked) setSelectedRowIds(prev => [...prev, row.original.id]);
              else setSelectedRowIds(prev => prev.filter(id => id !== row.original.id));
            }}
            className="w-4 h-4 text-[#217A6E] rounded border-gray-300"
          />
        ),
        enableSorting: false,
      },
      ...orderColumns.slice(1),
    ];
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500 mt-1">View, track, and manage all store orders.</p>
      </div>

      <DataFilterBar
        searchPlaceholder="Search Order ID, Email, or Phone..."
        statusOptions={STATUS_OPTIONS}
        onExport={handleExport}
      />

      {/* Bulk Actions Panel */}
      {selectedRowIds.length > 0 && (
        <div className="mb-4 p-4 bg-[#217A6E]/10 border border-[#217A6E]/20 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="font-semibold text-[#217A6E]">{selectedRowIds.length} orders selected</span>
          <div className="flex items-center gap-3">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
            >
              <option value="">Update Status To...</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => bulkUpdateMutation.mutate()}
              disabled={!bulkStatus || bulkUpdateMutation.isPending}
              className="px-6 py-2 bg-[#217A6E] text-white text-sm font-bold rounded-lg hover:bg-[#004d36] disabled:opacity-50 flex items-center gap-2"
            >
              {bulkUpdateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Apply Bulk Action
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={tableColumns}
        data={data?.data?.pages || []}
        pageCount={data?.data?.pageCount || 1}
        totalItems={data?.data?.totalItems || 0}
        isLoading={isLoading}
      />
    </div>
  );
}