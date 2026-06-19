// src/app/admin/products/export/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, ArrowLeft, Loader2, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { BRAND } from "@/config/brand.config";

export default function ProductExportPage() {
  const router = useRouter();
  const [exportType, setExportType] = useState<"all" | "category" | "collection" | "selected">("all");
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Load categories and collections for filters
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/categories");
      return Array.isArray(response) ? response : [];
    },
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/collections");
      return Array.isArray(response) ? response : [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products-list-for-export"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/products");
      return Array.isArray(response) ? response : [];
    },
    enabled: exportType === "selected",
  });

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Generating export file...");

    try {
      const payload: any = {
        type: exportType,
        format,
      };

      if (exportType === "category") {
        if (!selectedCategory) {
          toast.error("Please select a category", { id: toastId });
          setIsExporting(false);
          return;
        }
        payload.categorySlug = selectedCategory;
      }

      if (exportType === "collection") {
        if (!selectedCollection) {
          toast.error("Please select a collection", { id: toastId });
          setIsExporting(false);
          return;
        }
        payload.collectionSlug = selectedCollection;
      }

      if (exportType === "selected") {
        if (selectedProductIds.length === 0) {
          toast.error("Please select at least one product", { id: toastId });
          setIsExporting(false);
          return;
        }
        payload.selectedIds = selectedProductIds;
      }

      // Download response as blob
      const response = await apiClient.post("/admin/products/export", payload, {
        responseType: "blob",
      });

      const blob = new Blob([response as any], {
        type: format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products-export-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      toast.success("Products exported successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to export products", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="p-4 md:p-8 max-w-[1000px] mx-auto animate-in fade-in duration-300 min-h-screen"
      style={{ backgroundColor: BRAND.theme.accent }}
    >
      <button
        onClick={() => router.push("/admin/products")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Products
      </button>
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
        <div className="mb-8 border-b border-gray-100 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Download className="text-[#006044]" /> Export Catalog
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Export products from your store. Select format and filter criteria.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              const toastId = toast.loading("Downloading template...");
              try {
                const response = await apiClient.get("/admin/products/import/template", {
                  responseType: "blob",
                });
                const blob = new Blob([response as any], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "product_import_template.xlsx");
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                toast.success("Template downloaded!", { id: toastId });
              } catch (e) {
                toast.error("Failed to download template", { id: toastId });
              }
            }}
            className="flex items-center gap-2 bg-[#006044] text-white hover:bg-[#004d36] px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet size={16} /> Download Excel Template
          </button>
        </div>

        <div className="space-y-8">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all text-sm font-bold ${
                  format === "csv"
                    ? "border-[#006044] bg-green-50/50 text-[#006044]"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <FileText size={20} />
                CSV Format
              </button>
              <button
                type="button"
                onClick={() => setFormat("xlsx")}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all text-sm font-bold ${
                  format === "xlsx"
                    ? "border-[#006044] bg-green-50/50 text-[#006044]"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <FileSpreadsheet size={20} />
                Excel (XLSX) Format
              </button>
            </div>
          </div>

          {/* Filter Criteria */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">
              Filter Products
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["all", "category", "collection", "selected"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setExportType(type)}
                  className={`p-3.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                    exportType === type
                      ? "bg-[#006044] text-white border-transparent shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {type === "all" ? "All Products" : `By ${type}`}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Filters */}
          {exportType === "category" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-[#006044] focus:ring-1 focus:ring-[#006044] font-medium"
              >
                <option value="">Choose category...</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {exportType === "collection" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Collection
              </label>
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-[#006044] focus:ring-1 focus:ring-[#006044] font-medium"
              >
                <option value="">Choose collection...</option>
                {collections.map((c: any) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {exportType === "selected" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Select Products ({selectedProductIds.length} chosen)
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-2xl p-4 space-y-2.5 bg-gray-50/50">
                {products.map((p: any) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer shadow-sm transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => handleToggleProduct(p.id)}
                      className="w-4 h-4 rounded text-[#006044] border-gray-300 focus:ring-[#006044]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.variants?.[0]?.sku || "No SKU"}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Export Action */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-[#006044] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#004d36] transition-all shadow-md shadow-green-900/10 disabled:opacity-50 text-sm"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating file...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
