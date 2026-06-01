// src/app/admin/products/add/page.tsx

 "use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { ProductForm } from "@/components/admin/features/admin-products/components/sections/ProductForm";

export default function AddProductPage() {
  const { data: categories = [], isLoading: isLoadingCats } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/categories");
      return (Array.isArray(res) ? res : (res as any)?.data || []) as any[];
    }
  });

  const { data: stores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/stores");
      return (Array.isArray(res) ? res : (res as any)?.data || []) as any[];
    }
  });

  if (isLoadingCats || isLoadingStores) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#006044] w-10 h-10" />
      </div>
    );
  }

  return <ProductForm categories={categories} stores={stores} />;
}