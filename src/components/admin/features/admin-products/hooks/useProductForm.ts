// src\components\admin\features\admin-products\hooks\useProductForm.ts

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productFormSchema, ProductFormValues } from "../schemas/product.schema";
import { adminProductService } from "@/services/admin-products.service";

export interface UseProductFormReturn {
  form: UseFormReturn<ProductFormValues>;
  mutation: UseMutationResult<any, any, ProductFormValues, unknown>;
  isEditing: boolean;
}

export const useProductForm = (initialData?: any): UseProductFormReturn => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const defaultValues: ProductFormValues = initialData ? {
    name: initialData.name || "",
    description: initialData.description || "",
    categoryId: initialData.categoryId || "",
    storeId: initialData.storeId || "",
    ingredients: initialData.extra?.ingredients || initialData.ingredients || "",
    isActive: initialData.isActive ?? true,
    isFeatured: initialData.isFeatured ?? false,
    isCodEnabled: initialData.isCodEnabled ?? true,
    images: initialData.images || [],
    highlightIds: initialData.highlights?.map((h: any) => h.id) || initialData.highlightIds || [],
    
    careInstructions: initialData.careInstructions?.length ? initialData.careInstructions.map((v: string) => ({ value: v })) : [{ value: "" }],
    deliveryInfo: initialData.deliveryInfo?.length ? initialData.deliveryInfo.map((v: string) => ({ value: v })) : [{ value: "" }],
    attributes: initialData.attributes?.length ? initialData.attributes : [{ name: "", value: "" }],
    
    variants: initialData.variants?.length ? initialData.variants.map((v: any) => ({
      ...v,
      price: Number(v.price) || Number(initialData.price + (v.priceModifier || 0)) || 0,
      oldPrice: Number(v.oldPrice) || Number(initialData.oldPrice) || 0,
      stock: Number(v.stock) || 0,
      shippingWeightKg: Number(v.shippingWeightKg) || 0,
      lengthCm: Number(v.lengthCm) || 0,
      widthCm: Number(v.widthCm) || 0,
      heightCm: Number(v.heightCm) || 0,
    })) : [{ name: "", sku: "", optionType: "Size", optionValue: "", price: Number(initialData.price) || 0, oldPrice: Number(initialData.oldPrice) || 0, stock: 10, shippingWeightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0 }],
    
    extra: {
      manufacturer: initialData.extra?.manufacturer || "",
      countryOfOrigin: initialData.extra?.countryOfOrigin || "",
      safetyInfo: initialData.extra?.safetyInfo || "",
      directions: initialData.extra?.directions || "",
      legalDisclaimer: initialData.extra?.legalDisclaimer || "",
      aPlusContent: initialData.extra?.aPlusContent || [],
    }
  } : {
    name: "", description: "", categoryId: "", storeId: "", isActive: true, isFeatured: false, isCodEnabled: true, images: [], highlightIds: [], ingredients: "",
    variants: [{ name: "", sku: "", optionType: "Size", optionValue: "", price: 0, oldPrice: 0, stock: 10, shippingWeightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0 }],
    attributes: [{ name: "", value: "" }], careInstructions: [{ value: "" }], deliveryInfo: [{ value: "" }],
    extra: { manufacturer: "", countryOfOrigin: "", safetyInfo: "", directions: "", legalDisclaimer: "", aPlusContent: [] }
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any, // bypasses z.coerce "unknown" input type clash
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (data.images.length === 0) throw new Error("At least one image is required");


      // 🔥 Auto-generate the slug from the product name
      const generatedSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Replace special chars and spaces with hyphens
        .replace(/(^-|-$)+/g, "");   // Remove leading/trailing hyphens

      const payload = {
        ...data,
        slug: generatedSlug, // <--- Add the slug here
        price: 0, // Legacy fallback
        oldPrice: null, // Legacy fallback
        careInstructions: data.careInstructions.map(i => i.value).filter(Boolean),
        deliveryInfo: data.deliveryInfo.map(i => i.value).filter(Boolean),
        attributes: data.attributes.filter(a => a.name && a.value),
        variants: data.variants.map(v => ({ ...v, priceModifier: 0 }))
      };

      if (isEditing) return adminProductService.updateProduct(initialData.id, payload);
      return adminProductService.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ["admin-product", initialData.id] });
      alert(`✅ Product ${isEditing ? "updated" : "created"} successfully!`);
      router.push("/admin/products");
    },
    onError: (error: any) => {
      const backendMessage = error.response?.data?.message || error.message || "Failed to save product.";
      alert(`❌ ${Array.isArray(backendMessage) ? backendMessage.join(", ") : backendMessage}`);
    },
  });

  return { form, mutation, isEditing };
};