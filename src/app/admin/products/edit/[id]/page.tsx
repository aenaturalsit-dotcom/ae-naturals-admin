// src\app\admin\products\edit\[id]\page.tsx

"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { ProductForm } from "@/components/admin/features/admin-products/components/sections/ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/categories");
      return (Array.isArray(res) ? res : (res as any)?.data || []) as any[];
    }
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/stores");
      return (Array.isArray(res) ? res : (res as any)?.data || []) as any[];
    }
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const data = await apiClient.get("/admin/products");
      const list = (Array.isArray(data) ? data : (data as any)?.data || []) as any[];
      const found = list.find((p: any) => p.id === id);
      console.log("Raw product data:", found);
      if (!found) throw new Error("Product not found");

      const highlights = await apiClient.get(`/products/${id}/highlights`).catch(() => []);
      found.highlightIds = (Array.isArray(highlights) ? highlights : (highlights as any)?.data || []).map((h: any) => h.id);
      
      return found;
    },
  });

  if (isLoading || !product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#006044] w-10 h-10" />
      </div>
    );
  }

  return <ProductForm initialData={product} categories={categories} stores={stores} />;
}