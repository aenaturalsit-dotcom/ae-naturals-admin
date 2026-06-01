// src\components\admin\orders\hcjgd.tsx


"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";

export const orderColumns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="w-4 h-4 text-[#217A6E] rounded border-gray-300 focus:ring-[#217A6E]"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="w-4 h-4 text-[#217A6E] rounded border-gray-300 focus:ring-[#217A6E]"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <Link href={`/admin/orders/${row.original.id}`} className="font-semibold text-[#217A6E] hover:underline">
        #{row.original.id.slice(-8).toUpperCase()}
      </Link>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-gray-600">
        {format(new Date(row.original.createdAt), "MMM dd, yyyy HH:mm")}
      </div>
    ),
  },
  {
    accessorKey: "user.name",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-gray-900">{row.original.user?.name || "Guest"}</p>
        <p className="text-xs text-gray-500">{row.original.user?.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-bold text-gray-900">
        ₹{row.original.totalAmount?.toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let colorClass = "bg-gray-100 text-gray-800";
      
      if (status === "PAID" || status === "DELIVERED") colorClass = "bg-green-100 text-green-800";
      if (status === "PENDING" || status === "PROCESSING") colorClass = "bg-yellow-100 text-yellow-800";
      if (status === "CANCELLED" || status === "FAILED") colorClass = "bg-red-100 text-red-800";
      if (status === "SHIPPED") colorClass = "bg-blue-100 text-blue-800";

      return (
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${colorClass}`}>
          {status}
        </span>
      );
    },
  },
];