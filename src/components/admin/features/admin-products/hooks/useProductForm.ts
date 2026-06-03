// src/components/admin/features/admin-products/hooks/useProductForm.ts
import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productFormSchema, ProductFormValues } from "../schemas/product.schema";
import { adminProductService } from "@/services/admin-products.service";
import { MediaItem } from "@/types/media";

export interface UseProductFormReturn {
  form: UseFormReturn<ProductFormValues>;
  mutation: UseMutationResult<any, any, ProductFormValues, unknown>;
  isEditing: boolean;
}

export const useProductForm = (initialData?: any): UseProductFormReturn => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id; // Check safely using id presence

  const mapDataToForm = (data: any): ProductFormValues => {
   const parsedMedia: MediaItem[] = Array.isArray(data?.images)
  ? data.images
      .map((img: any, index: number): MediaItem | null => {
        if (!img) return null;

        let target = img;

        if (typeof img === "string") {
          try {
            if (img.trim().startsWith("{")) {
              target = JSON.parse(img);
            } else {
              const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(img);
              const isGif = /\.gif(\?.*)?$/i.test(img);

              return {
                url: img,
                publicId: img.split("/").pop()?.split(".")[0] || null,
                type: isVideo ? "video" : isGif ? "gif" : "image",
                posterUrl: null,
                sortOrder: index,
              };
            }
          } catch {
            return {
              url: img,
              publicId: null,
              type: "image",
              posterUrl: null,
              sortOrder: index,
            };
          }
        }

        return {
          url: target.url || "",
          publicId: target.publicId || null,
          type:
            target.type === "video" || target.type === "gif"
              ? target.type
              : "image",
          posterUrl: target.posterUrl || null,
          sortOrder:
            typeof target.sortOrder === "number"
              ? target.sortOrder
              : index,
        };
      })
      .filter(
        (m :any): m is MediaItem =>
          Boolean(m?.url)
      )
      .sort((a: MediaItem, b: MediaItem) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  : [];

    return {
      name: data?.name || "",
      subtitle: data?.subtitle || "",
      description: data?.description || "",
      categoryId: data?.categoryId || "",
      storeId: data?.storeId || "",
      ingredients: data?.extra?.ingredients || data?.ingredients || "",
      isActive: data?.isActive ?? true,
      isFeatured: data?.isFeatured ?? false,
      isCodEnabled: data?.isCodEnabled ?? true,
      images: parsedMedia,
      highlightIds: Array.isArray(data?.highlightIds) 
        ? data.highlightIds 
        : Array.isArray(data?.highlights) 
          ? data.highlights.map((h: any) => typeof h === 'string' ? h : (h.featureId || h.id)) 
          : [],
      careInstructions: data?.careInstructions?.length 
        ? data.careInstructions.map((v: any) => typeof v === "string" ? { value: v } : { value: v.value || "" }) 
        : [{ value: "" }],
      deliveryInfo: data?.deliveryInfo?.length 
        ? data.deliveryInfo.map((v: any) => typeof v === "string" ? { value: v } : { value: v.value || "" }) 
        : [{ value: "" }],
      attributes: data?.attributes?.length 
        ? data.attributes 
        : [{ name: "", value: "" }],
      variants: data?.variants?.length ? data.variants.map((v: any) => ({
        ...v,
        price: Number(v.price) || 0.01, // Avoid default 0 failing schema validation minimum bounds
        oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
        stock: Number(v.stock) || 0,
        shippingWeightKg: Number(v.shippingWeightKg) || 0,
        lengthCm: Number(v.lengthCm) || 0,
        widthCm: Number(v.widthCm) || 0,
        heightCm: Number(v.heightCm) || 0,
      })) : [{ name: "", sku: "", optionType: "Size", optionValue: "", price: 0.01, oldPrice: null, stock: 10, shippingWeightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0 }],
      extra: {
        manufacturer: data?.extra?.manufacturer || data?.manufacturer || "",
        countryOfOrigin: data?.extra?.countryOfOrigin || data?.countryOfOrigin || "",
        safetyInfo: data?.extra?.safetyInfo || data?.safetyInfo || "",
        directions: data?.extra?.directions || data?.directions || "",
        legalDisclaimer: data?.extra?.legalDisclaimer || data?.legalDisclaimer || "",
        aPlusContent: data?.extra?.aPlusContent || [],
      }
    };
  };

  const emptyDefaults: ProductFormValues = {
    name: "",subtitle: "", description: "", categoryId: "", storeId: "", isActive: true, 
    isFeatured: false, isCodEnabled: true, images: [], highlightIds: [], ingredients: "",
    variants: [{ name: "", sku: "", optionType: "Size", optionValue: "", price: 0.01, oldPrice: null, stock: 10, shippingWeightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0 }],
    attributes: [{ name: "", value: "" }], careInstructions: [{ value: "" }], deliveryInfo: [{ value: "" }],
    extra: { manufacturer: "", countryOfOrigin: "", safetyInfo: "", directions: "", legalDisclaimer: "", aPlusContent: [] }
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    // 1. defaultValues handles the initial fallback state before data loads
    defaultValues: emptyDefaults,
    // 2. PRODUCTION FIX: 'values' reactively updates the form whenever async initialData arrives
    values: initialData ? mapDataToForm(initialData) : undefined,
   // 3. CRITICAL: Prevents background updates or parallel adjustments from clobbering what the user types
    resetOptions: {
      keepDirtyValues: true, 
    }
  });


  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const generatedSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      // 🔥 PACKAGING FOR BACKEND: Pack structured MediaItems back into plain stringified JSON arrays
      const serializedImages = data.images.map(img => JSON.stringify(img));

      const payload = {
        ...data,
        images: serializedImages,
        slug: generatedSlug,
        price: data.variants[0]?.price || 0, 
        oldPrice: data.variants[0]?.oldPrice || null, 
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
      console.log(`❌ ${Array.isArray(backendMessage) ? backendMessage.join(", ") : backendMessage}`);
    },
  });

  return { form, mutation, isEditing };
};