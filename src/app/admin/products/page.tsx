// src/app/admin/products/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Package, UploadCloud, Download, Edit3, Trash2, CheckCircle2, XCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import apiClient from "@/lib/api-client";
import { DataTable } from "@/components/admin/ui/DataTable";
import { DataFilterBar } from "@/components/admin/ui/DataFilterBar";
import { getProductColumns } from "./columns";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { ProductImportModal } from "@/components/admin/products/ProductImportModal";
import { Badge } from "@/components/admin/ui/Badge";
import { BRAND } from "@/config/brand.config";

const STATUS_OPTIONS = [
  { label: "Published", value: "ACTIVE" },
  { label: "Hidden (Draft)", value: "HIDDEN" },
  { label: "Featured", value: "FEATURED" },
];

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // URL States
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search")?.toLowerCase() || "";
  const status = searchParams.get("status") || "";
  const limit = 15;

  // 1. Fetch All Data
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/products");
      return Array.isArray(response) ? response : (response as any)?.data || [];
    },
  });

  // 2. Client-Side Filtering
  const filteredData = useMemo(() => {
    let result = allProducts;
    if (search) {
      result = result.filter((p: any) => 
        p.name.toLowerCase().includes(search) || 
        p.variants?.some((v: any) => v.sku?.toLowerCase().includes(search))
      );
    }
    if (status === "ACTIVE") result = result.filter((p: any) => p.isActive);
    if (status === "HIDDEN") result = result.filter((p: any) => !p.isActive);
    if (status === "FEATURED") result = result.filter((p: any) => p.isFeatured);
    return result;
  }, [allProducts, search, status]);

  // 3. Client-Side Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredData.slice(startIndex, startIndex + limit);
  }, [filteredData, page]);

  const totalItems = filteredData.length;
  const pageCount = Math.ceil(totalItems / limit);

  // 4. Instantiate Table Columns dynamically
  const tableColumns = useMemo(
    () => getProductColumns((id) => setProductToDelete(id)), 
    []
  );

  // 5. Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setProductToDelete(null);
    },
    onError: () => toast.error("Failed to delete product"),
  });

  // 6. Handlers
  const handleExportCsv = () => {
    if (!filteredData.length) return toast.error("No data to export");
    toast.loading("Generating CSV...", { id: "csv" });
    
    const headers = ["ID", "Name", "SKU", "Category", "Price", "Stock", "Status"];
    const rows = filteredData.map((p: any) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.variants?.[0]?.sku || "",
      p.category?.name || "Uncategorized",
      p.variants?.[0]?.price || 0,
      p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
      p.isActive ? "Published" : "Hidden"
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `products_export_${new Date().getTime()}.csv`;
    link.click();
    toast.success("Export Complete", { id: "csv" });
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300  min-h-screen"
    style={{ backgroundColor: BRAND.theme.accent }}>
      
      {/* Header - Optimized for Mobile Grid */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="text-[#006044]" /> Catalog Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage products, inventory, and variants.</p>
        </div>
        
        {/* Mobile Responsive Action Buttons */}
        <div className="grid grid-cols-2 md:flex items-center gap-2 w-full xl:w-auto">
          <button 
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download size={16} /> Export
          </button>
       <button 
            onClick={() => alert("This feature is in progress")}
            // OR if you prefer the nice toast UI: onClick={() => toast("This feature is in progress", { icon: "🚧" })}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <UploadCloud size={16} /> Import
          </button>
          <button 
            onClick={() => router.push(`/admin/products/add`)}
            className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 bg-[#006044] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#004d36] transition-colors shadow-sm"
          >
            <PlusCircle size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <DataFilterBar
          searchPlaceholder="Search Name or SKU..."
          statusOptions={STATUS_OPTIONS}
        />

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden lg:block">
          <DataTable
            columns={tableColumns}
            data={paginatedData}
            pageCount={pageCount}
            totalItems={totalItems}
            isLoading={isLoading}
          />
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="lg:hidden space-y-4">
          {isLoading ? (
            <div className="p-10 text-center flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#006044] mb-2" />
              <p className="text-gray-500 text-sm">Loading products...</p>
            </div>
          ) : paginatedData.length === 0 ? (
             <div className="p-10 text-center bg-white rounded-xl border border-gray-200">
               <p className="text-gray-500 text-sm">No products found matching your search.</p>
             </div>
          ) : (
            <>
              {paginatedData.map((p: any) => {
                const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                
                return (
                  <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <Link href={`/admin/products/edit/${p.id}`} className="font-bold text-gray-900 leading-snug line-clamp-2">
                            {p.name}
                          </Link>
                          {p.isActive ? (
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle size={16} className="text-gray-300 shrink-0 mt-0.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">{p.category?.name || "No Category"}</p>
                        <p className="text-sm font-black text-gray-900 mt-2">₹{p.variants?.[0]?.price?.toLocaleString("en-IN") || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <Badge variant={totalStock === 0 ? "error" : totalStock < 10 ? "warning" : "success"}>
                        {totalStock} in stock
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/admin/products/edit/${p.id}`}
                          className="p-2 text-gray-500 bg-gray-50 hover:text-[#006044] hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button 
                          onClick={() => setProductToDelete(p.id)}
                          className="p-2 text-gray-500 bg-gray-50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Mobile Pagination Helper */}
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                <button 
                  disabled={page === 1}
                  onClick={() => router.push(`?page=${page - 1}`)}
                  className="text-sm font-bold disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {pageCount}</span>
                <button 
                  disabled={page >= pageCount}
                  onClick={() => router.push(`?page=${page + 1}`)}
                  className="text-sm font-bold disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => productToDelete && deleteMutation.mutate(productToDelete)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone and will remove all associated variants and images."
        isLoading={deleteMutation.isPending}
      />

      <ProductImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  );
}