// app/admin/orders/columns.tsx

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { Order } from "@/types/orders";
import { OrderStatusBadge } from "@/components/admin/ui/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/admin/ui/PaymentStatusBadge";

export const orderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ row }) => (
      <Link
        href={`/admin/orders/${row.original.id}`}
        className="font-semibold text-gray-900 hover:underline"
      >
        #{row.original.id.slice(-6).toUpperCase()}
      </Link>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-sm text-gray-500 whitespace-nowrap">
        {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        <div className="text-xs text-gray-400">
          {format(new Date(row.original.createdAt), "h:mm a")}
        </div>
      </div>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="text-sm font-medium text-gray-900">
          {row.original.user?.name || "Guest"}
        </div>
        <div className="text-xs text-gray-500">
          {row.original.user?.email || ""}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-900">
        ₹{row.original.totalAmount?.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    id: "status",
    header: "Order Status",
    cell: ({ row }) => (
      <OrderStatusBadge status={row.original.status} size="sm" />
    ),
  },
  {
    id: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const { paymentStatus, paymentProvider } = row.original;
      
      // Special handling for COD
      if (paymentProvider === "COD") {
        if (paymentStatus === "PAID") {
          return <PaymentStatusBadge status="PAID" size="sm" />;
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            COD Pending
          </span>
        );
      }
      
      return <PaymentStatusBadge status={paymentStatus} size="sm" />;
    },
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const count = row.original._count?.items || 0;
      return (
        <span className="text-sm text-gray-600">
          {count} {count === 1 ? "item" : "items"}
        </span>
      );
    },
  },
];