"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";

export const orderColumns: ColumnDef<any>[] = [
  {
    id: "select",
    // Checkbox injected dynamically in page.tsx
  },
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ row }) => (
      <Link href={`/admin/orders/${row.original.id}`} className="font-semibold text-gray-900 hover:underline">
        #{row.original.id.slice(-4).toUpperCase()}
      </Link>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-sm text-gray-500 whitespace-nowrap">
        {format(new Date(row.original.createdAt), "MMM dd 'at' h:mm a")}
      </div>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      // Safely access user details based on your JSON structure
      const name = row.original.user?.name || "No name";
      return (
        <div className="text-sm font-medium text-gray-900">
          {name}
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        Rs. {row.original.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    id: "paymentStatus",
    header: "Payment status",
    cell: ({ row }) => {
      const status = row.original.status;
      
      const isPaid = status === "PAID" || status === "SHIPPED" || status === "DELIVERED";
      const isPending = status === "PROCESSING" || status === "PENDING";
      
      let badgeClass = "bg-gray-100 text-gray-800"; // Default / Paid
      let label = isPaid ? "Paid" : isPending ? "Pending" : status;
      
      if (isPending) {
        badgeClass = "bg-amber-100 text-amber-800";
      } else if (status === "CANCELLED" || status === "FAILED") {
        badgeClass = "bg-red-100 text-red-800";
      }

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
          {isPaid && (
            <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {isPending && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          )}
          {label}
        </span>
      );
    },
  },
  {
    id: "fulfillmentStatus",
    header: "Fulfillment status",
    cell: ({ row }) => {
      const status = row.original.status;
      
      const isFulfilled = status === "SHIPPED" || status === "DELIVERED";
      const isUnfulfilled = !isFulfilled && status !== "CANCELLED";
      
      let badgeClass = "bg-amber-100 text-amber-800"; // Default Unfulfilled
      let label = isFulfilled ? "Fulfilled" : isUnfulfilled ? "Unfulfilled" : "Restocked";
      
      if (isFulfilled) {
        badgeClass = "bg-gray-100 text-gray-800";
      } else if (status === "CANCELLED" || status === "RETURNED") {
        badgeClass = "bg-gray-100 text-gray-500";
      }

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
          {isUnfulfilled && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          )}
          {label}
        </span>
      );
    },
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      // 🔥 FIX: Read from the Prisma _count relation output from your JSON
      const itemCount = row.original._count?.items || row.original.items?.length || 0; 
      return (
        <span className="text-sm text-gray-600">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      );
    },
  },
];