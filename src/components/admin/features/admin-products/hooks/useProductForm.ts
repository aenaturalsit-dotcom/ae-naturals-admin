// src/components/admin/features/admin-products/hooks/useProductForm.ts

import { useEffect } from "react";
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

  /**
   * Helper function to map raw API data to the React Hook Form structure.
   * Defined outside useMemo/Effect so it can be used for both initial state and reset.
   */
  const mapDataToForm = (data: any): ProductFormValues => ({
    name: data.name || "",
    description: data.description || "",
    categoryId: data.categoryId || "",
    storeId: data.storeId || "",
    ingredients: data.extra?.ingredients || data.ingredients || "",
    isActive: data.isActive ?? true,
    isFeatured: data.isFeatured ?? false,
    isCodEnabled: data.isCodEnabled ?? true,
    images: data.images || [],
    
    // 🔥 HYDRATION FIX: Safely parse highlight IDs from pivot objects or flat arrays
    highlightIds: Array.isArray(data.highlightIds) 
      ? data.highlightIds 
      : Array.isArray(data.highlights) 
        ? data.highlights.map((h: any) => typeof h === 'string' ? h : (h.featureId || h.id)) 
        : [],
    
    careInstructions: data.careInstructions?.length 
      ? data.careInstructions.map((v: string) => ({ value: v })) 
      : [{ value: "" }],
    deliveryInfo: data.deliveryInfo?.length 
      ? data.deliveryInfo.map((v: string) => ({ value: v })) 
      : [{ value: "" }],
    attributes: data.attributes?.length 
      ? data.attributes 
      : [{ name: "", value: "" }],
    
    variants: data.variants?.length ? data.variants.map((v: any) => ({
      ...v,
      price: Number(v.price) || Number(data.price + (v.priceModifier || 0)) || 0,
      oldPrice: Number(v.oldPrice) || Number(data.oldPrice) || 0,
      stock: Number(v.stock) || 0,
      shippingWeightKg: Number(v.shippingWeightKg) || 0,
      lengthCm: Number(v.lengthCm) || 0,
      widthCm: Number(v.widthCm) || 0,
      heightCm: Number(v.heightCm) || 0,
    })) : [{ 
      name: "", 
      sku: "", 
      optionType: "Size", 
      optionValue: "", 
      price: Number(data.price) || 0, 
      oldPrice: Number(data.oldPrice) || 0, 
      stock: 10, 
      shippingWeightKg: 0, 
      lengthCm: 0, 
      widthCm: 0, 
      heightCm: 0 
    }],
    
    extra: {
      manufacturer: data.extra?.manufacturer || "",
      countryOfOrigin: data.extra?.countryOfOrigin || "",
      safetyInfo: data.extra?.safetyInfo || "",
      directions: data.extra?.directions || "",
      legalDisclaimer: data.extra?.legalDisclaimer || "",
      aPlusContent: data.extra?.aPlusContent || [],
    }
  });

  const emptyDefaults: ProductFormValues = {
    name: "", description: "", categoryId: "", storeId: "", isActive: true, 
    isFeatured: false, isCodEnabled: true, images: [], highlightIds: [], ingredients: "",
    variants: [{ name: "", sku: "", optionType: "Size", optionValue: "", price: 0, oldPrice: 0, stock: 10, shippingWeightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0 }],
    attributes: [{ name: "", value: "" }], careInstructions: [{ value: "" }], deliveryInfo: [{ value: "" }],
    extra: { manufacturer: "", countryOfOrigin: "", safetyInfo: "", directions: "", legalDisclaimer: "", aPlusContent: [] }
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: initialData ? mapDataToForm(initialData) : emptyDefaults,
  });

  // 🔥 THE CRITICAL SYNC EFFECT
  // This watches initialData (from TanStack Query). When the product finally loads,
  // we call form.reset() to override the initial "empty" state with the real data.
  useEffect(() => {
    if (initialData) {
      form.reset(mapDataToForm(initialData));
    }
  }, [initialData, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (data.images.length === 0) throw new Error("At least one image is required");

      const generatedSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const payload = {
        ...data,
        slug: generatedSlug,
        price: 0, 
        oldPrice: null, 
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