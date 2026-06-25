// app/admin/refunds/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  IndianRupee,
  CreditCard,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { AdminRefundsService } from "@/services/admin-refunds.service";
import { useDebounce } from "@/hooks/useDebounce";
import { RefundStatusBadge } from "@/components/admin/refunds/RefundStatusBadge";
import { DataTable } from "@/components/admin/ui/DataTable";
import { BRAND } from "@/config/brand.config";

// Status filter options
const STATUS_FILTERS = [
  { value: "ALL", label: "All Refunds" },
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "INITIATED", label: "Initiated" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  // Legacy statuses for backward compatibility
  { value: "PENDING", label: "Pending (Legacy)" },
  { value: "APPROVED", label: "Approved (Legacy)" },
  { value: "PROCESSED", label: "Processed (Legacy)" },
  { value: "REJECTED", label: "Rejected (Legacy)" },
];

// Refund method filter options
const METHOD_FILTERS = [
  { value: "ALL", label: "All Methods" },
  { value: "GATEWAY", label: "Gateway" },
  { value: "MANUAL_BANK", label: "Manual Bank" },
  { value: "UPI", label: "UPI" },
  { value: "WALLET", label: "Wallet" },
  { value: "COD_BANK", label: "COD Bank" },
  { value: "COD", label: "COD (Legacy)" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export default function AdminRefundsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State
  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const method = searchParams.get("method") || "ALL";

  const [searchTerm, setSearchTerm] = useState(search);
  const [statusFilter, setStatusFilter] = useState(status);
  const [methodFilter, setMethodFilter] = useState(method);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (page && page !== "1") params.set("page", page);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter && statusFilter !== "ALL")
      params.set("status", statusFilter);
    if (methodFilter && methodFilter !== "ALL")
      params.set("method", methodFilter);

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [debouncedSearch, statusFilter, methodFilter, page, pathname, router]);

  // Fetch refunds
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "admin-refunds",
      {
        page,
        search: debouncedSearch,
        status: statusFilter,
        method: methodFilter,
      },
    ],
    queryFn: async () => {
      const response = await AdminRefundsService.getRefunds({
        page: parseInt(page),
        limit: 20,
        search: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        refundMethod: methodFilter === "ALL" ? undefined : methodFilter,
      });
      return response;
    },
  });

  const refunds = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1, limit: 20 };

  // Table columns
  const columns = [
    {
      accessorKey: "refundReference",
      header: "Refund",
      cell: ({ row }: any) => (
        <Link
          href={`/admin/refunds/${row.original.id}`}
          className="font-semibold text-gray-900 hover:underline"
        >
          #{row.original.refundReference}
        </Link>
      ),
    },
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }: any) => (
        <Link
          href={`/admin/orders/${row.original.orderId}`}
          className="text-sm text-gray-600 hover:underline"
        >
          #{row.original.orderNumber}
        </Link>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {row.original.customerName}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.customerEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "refundAmount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
          <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
          {row.original.refundAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      accessorKey: "refundMethod",
      header: "Method",
      cell: ({ row }: any) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <CreditCard className="w-3 h-3 mr-1" />
          {row.original.refundMethod || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "refundStatus",
      header: "Status",
      cell: ({ row }: any) => (
        <RefundStatusBadge status={row.original.refundStatus} size="sm" />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }: any) => (
        <div className="text-sm text-gray-600">
          {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <Link
          href={`/admin/refunds/${row.original.id}`}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          View
        </Link>
      ),
    },
  ];

  return (
    <div
      className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 min-h-screen"
      style={{ backgroundColor: BRAND.theme.accent }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer refunds and track processing status
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      {/* Stats Summary */}
     
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Refunds",
            value: meta.total || 0,
            color: "text-gray-900",
          },
          {
            label: "Not Started",
            value: refunds.filter((r: any) => r.refundStatus === "NOT_STARTED")
              .length,
            color: "text-gray-600",
          },
          {
            label: "Processing",
            value: refunds.filter(
              (r: any) =>
                r.refundStatus === "PROCESSING" ||
                r.refundStatus === "INITIATED",
            ).length,
            color: "text-blue-600",
          },
          {
            label: "Completed",
            value: refunds.filter((r: any) => r.refundStatus === "COMPLETED")
              .length,
            color: "text-green-600",
          },
          {
            label: "Failed",
            value: refunds.filter((r: any) => r.refundStatus === "FAILED")
              .length,
            color: "text-red-600",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by refund ID, order, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Method Filter */}
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
              >
                {METHOD_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={refunds}
          pageCount={meta.totalPages}
          totalItems={meta.total}
          isLoading={isLoading}
          noBorder
        />
      </div>
    </div>
  );
}
