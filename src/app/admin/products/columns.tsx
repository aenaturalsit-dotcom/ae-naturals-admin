// src/app/admin/products/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { Edit3, Trash2, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/admin/ui/Badge";
import { resolveFirstProductImage } from "@/shared/utils/media-normalization"; // 🔥 Updated helper import
// Export a factory function to inject the onDelete handler safely
export const getProductColumns = (
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="w-4 h-4 text-[#006044] rounded border-gray-300 focus:ring-[#006044] cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="w-4 h-4 text-[#006044] rounded border-gray-300 focus:ring-[#006044] cursor-pointer"
      />
    ),
    enableSorting: false,
  },
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => {
      const p = row.original;
      // 🔥 NEW STRATEGY: Parse your stringified database object to safely extract the structural URL
     // 🔥 Extract both the URL and the explicit media type structural properties
      const resolvedImageUrl= resolveFirstProductImage(p.images);
      return (
        <div className="flex items-center gap-3 min-w-[250px]">
          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
            {resolvedImageUrl ? (
              <img 
                src={resolvedImageUrl} 
                alt={p.name} 
                className="w-full h-full object-cover" 
                loading="lazy" 
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-gray-300" />
            )}
          </div>
          <div className="flex flex-col">
            <Link href={`/admin/products/edit/${p.id}`} className="font-bold text-gray-900 hover:text-[#006044] transition-colors line-clamp-1">
              {p.name}
            </Link>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">
              {p.variants?.[0]?.sku || "NO SKU"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
        {row.original.category?.name || "Uncategorized"}
      </span>
    ),
  },
  {
    id: "price",
    header: "Price",
    cell: ({ row }) => {
      const variants = row.original.variants || [];
      const basePrice = variants[0]?.price || 0;
      return (
        <span className="font-bold text-gray-900">
          ₹{basePrice.toLocaleString("en-IN")}
        </span>
      );
    },
  },
  {
    id: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const variants = row.original.variants || [];
      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
      const isLowStock = totalStock > 0 && totalStock < 10;
      const isOutOfStock = totalStock === 0;

      return (
        <Badge variant={isOutOfStock ? "error" : isLowStock ? "warning" : "success"}>
          {totalStock} in stock
        </Badge>
      );
    },
  },
  {
    id: "visibility",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className={`flex items-center gap-1.5 text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
          {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {isActive ? 'PUBLISHED' : 'HIDDEN'}
        </div>
      );
    },
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => (
      row.original.isFeatured ? (
        <Badge variant="info">Featured</Badge>
      ) : (
        <span className="text-gray-300">-</span>
      )
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date Added",
    cell: ({ row }) => (
      <div className="text-sm text-gray-500 whitespace-nowrap">
        {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Link 
          href={`/admin/products/edit/${row.original.id}`}
          className="p-2 text-gray-400 hover:text-[#006044] hover:bg-green-50 rounded-lg transition-colors"
        >
          <Edit3 size={16} />
        </Link>
        {/* onDelete is directly invoked here now */}
        <button 
          onClick={() => onDelete(row.original.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ),
  },
];