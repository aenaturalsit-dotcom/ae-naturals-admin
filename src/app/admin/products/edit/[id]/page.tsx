"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Plus,
  Trash2,
  Layers,
  ShieldAlert,
  Sparkles, // <-- Imported Sparkles for Highlights section
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

import apiClient from "@/lib/api-client";
import { adminProductService } from "@/services/admin-products.service";
import APlusContentBuilder from "@/components/admin/APlusContentBuilder";
import ProductHighlightsSelector from "@/components/admin/products/ProductHighlightsSelector"; // <-- Imported our Selector

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);

 const { data: existingHighlights } = useQuery({
    queryKey: ["product-highlights-edit", id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}/highlights`);
      // Fix: If apiClient returns the array directly, use it. Otherwise fallback to res.data
      const data = Array.isArray(res) ? res : res?.data || [];
      console.log("Fetched existing highlights for product:", data);
      return data;
    },
    enabled: !!id,
  });
  // --- DYNAMIC DATA FETCHING ---
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await apiClient.get("/admin/categories")) || [],
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => (await apiClient.get("/admin/stores")) || [],
  });

  // Fetch Product
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const data = await apiClient.get("/admin/products");
      const found = Array.isArray(data)
        ? data.find((p: any) => p.id === id)
        : null;
      if (!found) throw new Error("Product not found");
      return found;
    },
  });

  // --- FORM SETUP WITH PRE-FILL ---
  const methods = useForm({
    values: product
      ? {
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          oldPrice: product.oldPrice?.toString() || "",
          categoryId: product.categoryId || "",
          storeId: product.storeId || "",
          ingredients: product.extra?.ingredients || product.ingredients || "",
          isActive: product.isActive ?? true,
          // 🔥 Extract existing highlight IDs from the relational array
          highlightIds: existingHighlights?.map((h: any) => h.id) || [],
          // 🔥 NEW: Pre-fill shipping dimensions
          shippingWeightKg: product.shippingWeightKg?.toString() || "",
          lengthCm: product.lengthCm?.toString() || "",
          widthCm: product.widthCm?.toString() || "",
          heightCm: product.heightCm?.toString() || "",
          careInstructions: product.careInstructions?.length
            ? product.careInstructions.map((v: string) => ({ value: v }))
            : [{ value: "" }],
          deliveryInfo: product.deliveryInfo?.length
            ? product.deliveryInfo.map((v: string) => ({ value: v }))
            : [{ value: "" }],
          attributes: product.attributes?.length
            ? product.attributes
            : [{ name: "", value: "" }],
          variants: product.variants?.length
            ? product.variants
            : [{ name: "", priceModifier: 0, stock: 10 }],
          extra: {
            manufacturer: product.extra?.manufacturer || "",
            countryOfOrigin: product.extra?.countryOfOrigin || "",
            safetyInfo: product.extra?.safetyInfo || "",
            directions: product.extra?.directions || "",
            legalDisclaimer: product.extra?.legalDisclaimer || "",
            aPlusContent: product.extra?.aPlusContent || [],
          },
        }
      : undefined,
  });

  const { register, control, handleSubmit, watch, setValue } = methods;

  // Dynamic Field Arrays
  const {
    fields: careFields,
    append: appendCare,
    remove: removeCare,
  } = useFieldArray({ control, name: "careInstructions" as any });
  const {
    fields: deliveryFields,
    append: appendDelivery,
    remove: removeDelivery,
  } = useFieldArray({ control, name: "deliveryInfo" as any });
  const {
    fields: attrFields,
    append: appendAttr,
    remove: removeAttr,
  } = useFieldArray({ control, name: "attributes" as any });
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" as any });

  // Sync Images state when product loads
  useEffect(() => {
    if (product?.images) {
      setImages(product.images);
    }
  }, [product]);

  // --- UPDATE MUTATION ---
  const mutation = useMutation({
    mutationFn: async (formData: any) => {
      if (images.length === 0)
        throw new Error("At least one image is required");

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        // 🔥 NEW: Parse shipping dimensions strictly
        shippingWeightKg: parseFloat(formData.shippingWeightKg),
        lengthCm: parseFloat(formData.lengthCm),
        widthCm: parseFloat(formData.widthCm),
        heightCm: parseFloat(formData.heightCm),
        images: images,
        highlightIds: formData.highlightIds || [], // 🔥 Send updated highlights array
        careInstructions: formData.careInstructions
          .map((i: any) => i.value)
          .filter(Boolean),
        deliveryInfo: formData.deliveryInfo
          .map((i: any) => i.value)
          .filter(Boolean),
        attributes: formData.attributes
          .filter((a: any) => a.name && a.value)
          .map((a: any) => ({ name: a.name, value: a.value })),
        variants: formData.variants
          .filter((v: any) => v.name)
          .map((v: any) => ({
            name: v.name,
            priceModifier: parseFloat(v.priceModifier || 0),
            stock: parseInt(v.stock || 0),
          })),
      };

      return adminProductService.updateProduct(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      alert("✅ Product updated successfully!");
      router.push("/admin/products");
    },
    onError: (error: any) => {
      alert(`❌ Error updating product: ${error.message}`);
    },
  });

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-white pb-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#006044] animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
          Loading Product Data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10"
        >
          {/* HEADER (Sticky) */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md py-4 border-b border-zinc-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-zinc-600" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
                  Edit Product
                </h1>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">
                  Update Catalog Details
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={mutation.isPending || images.length === 0}
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-zinc-300 disabled:shadow-none"
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {mutation.isPending ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>

          {/* MAIN FORM GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">
              {/* SECTION: BASIC INFO */}
              <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Product Title *
                    </label>
                    <input
                      {...register("name", { required: true })}
                      className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#006044] outline-none font-bold text-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Base Selling Price *
                    </label>
                    <input
                      {...register("price", { required: true })}
                      type="number"
                      step="0.01"
                      className="w-full p-4 border rounded-2xl outline-none font-black text-xl bg-white focus:ring-2 focus:ring-[#006044]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      MRP (Old Price)
                    </label>
                    <input
                      {...register("oldPrice")}
                      type="number"
                      step="0.01"
                      className="w-full p-4 border rounded-2xl outline-none text-zinc-400 font-bold bg-white focus:ring-2 focus:ring-[#006044]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Product Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={5}
                    className="w-full p-5 border rounded-3xl outline-none focus:ring-2 focus:ring-[#006044] font-medium leading-relaxed bg-white"
                  />
                </div>
              </div>

              {/* 🔥 NEW SECTION: SHIPPING & LOGISTICS */}
              <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 space-y-6">
                <div className="space-y-1 border-b border-zinc-200 pb-4">
                  <label className="text-xs font-black text-[#006044] uppercase tracking-widest flex items-center gap-2">
                    📦 Shipping Dimensions (Required for Logistics)
                  </label>
                  <p className="text-xs text-zinc-500 font-medium">
                    These dimensions are required by Shiprocket to accurately calculate delivery charges and generate waybills.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Weight (KG) *</label>
                    <input 
                      {...register("shippingWeightKg", { required: true, min: 0.01 })} 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g. 0.5" 
                      className="w-full p-4 border rounded-2xl outline-none font-black text-lg bg-white focus:ring-2 focus:ring-[#006044]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Length (CM) *</label>
                    <input 
                      {...register("lengthCm", { required: true, min: 1 })} 
                      type="number" 
                      placeholder="e.g. 15" 
                      className="w-full p-4 border rounded-2xl outline-none font-bold text-lg bg-white focus:ring-2 focus:ring-[#006044]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Width (CM) *</label>
                    <input 
                      {...register("widthCm", { required: true, min: 1 })} 
                      type="number" 
                      placeholder="e.g. 10" 
                      className="w-full p-4 border rounded-2xl outline-none font-bold text-lg bg-white focus:ring-2 focus:ring-[#006044]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Height (CM) *</label>
                    <input 
                      {...register("heightCm", { required: true, min: 1 })} 
                      type="number" 
                      placeholder="e.g. 5" 
                      className="w-full p-4 border rounded-2xl outline-none font-bold text-lg bg-white focus:ring-2 focus:ring-[#006044]" 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: IMAGES */}
              <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    Image Gallery (Min 1) *
                  </label>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className="relative h-32 w-32 rounded-3xl overflow-hidden border shadow-sm group"
                    >
                      <img
                        src={url}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        alt={`upload-${i}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages(images.filter((_, idx) => idx !== i))
                        }
                        className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-md hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <CldUploadWidget
                    uploadPreset={
                      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                    }
                    options={{ multiple: true }}
                    onSuccess={(result: any) => {
                      if (result.event === "success") {
                        setImages((prev) => [...prev, result.info.secure_url]);
                      }
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="h-32 w-32 border-2 border-dashed border-zinc-300 rounded-3xl flex flex-col items-center justify-center text-zinc-400 hover:border-[#006044] hover:bg-white transition-all bg-transparent"
                      >
                        <Upload size={28} />
                        <span className="text-[10px] font-black mt-2 tracking-widest uppercase">
                          Add Photos
                        </span>
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
              </div>


              {/* ✅ NEW SECTION: PRODUCT HIGHLIGHTS */}
              <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 space-y-4">

                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={18} className="text-[#006044]" /> Service
                  Highlights
                </label>
                <div className="bg-white p-4 rounded-2xl border border-zinc-100">
                  <ProductHighlightsSelector
                    selectedIds={watch("highlightIds") || []}
                    onChange={(ids: string[]) =>
                      setValue("highlightIds", ids, { shouldDirty: true })
                    }
                  />
                </div>
              </div>

              {/* A+ CONTENT BUILDER */}
              <APlusContentBuilder />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
              {/* SECTION: ASSIGNMENT & STATUS */}
              <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Select Store *
                  </label>
                  <select
                    {...register("storeId", { required: true })}
                    className="w-full p-3 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-[#006044] font-bold text-sm"
                  >
                    <option value="">Choose Store</option>
                    {Array.isArray(stores) &&
                      stores.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Select Category *
                  </label>
                  <select
                    {...register("categoryId", { required: true })}
                    className="w-full p-3 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-[#006044] font-bold text-sm"
                  >
                    <option value="">Choose Category</option>
                    {Array.isArray(categories) &&
                      categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-zinc-100 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="w-5 h-5 accent-[#006044]"
                  />
                  <span className="text-xs font-black text-zinc-600 uppercase tracking-tight">
                    Set Product Live
                  </span>
                </label>
              </div>

              {/* ✅ NEW SECTION: PRODUCT HIGHLIGHTS */}
              {/* <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-4">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={18} className="text-[#006044]" /> Service
                  Highlights
                </label>
                <div className="bg-white p-4 rounded-2xl border border-zinc-100">
                  <ProductHighlightsSelector
                    selectedIds={watch("highlightIds") || []}
                    onChange={(ids: string[]) =>
                      setValue("highlightIds", ids, { shouldDirty: true })
                    }
                  />
                </div>
              </div> */}

              {/* SECTION: COMPLIANCE & EXTRA INFO */}
              <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-4">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={18} className="text-[#006044]" /> Extra
                  Details
                </label>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Manufacturer
                    </label>
                    <input
                      {...register("extra.manufacturer")}
                      className="w-full p-3 border rounded-xl outline-none text-sm font-bold bg-white focus:ring-2 focus:ring-[#006044]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Origin
                    </label>
                    <input
                      {...register("extra.countryOfOrigin")}
                      className="w-full p-3 border rounded-xl outline-none text-sm font-bold bg-white focus:ring-2 focus:ring-[#006044]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Ingredients List
                    </label>
                    <textarea
                      {...register("ingredients")}
                      rows={2}
                      className="w-full p-3 border rounded-xl outline-none text-sm font-medium bg-white focus:ring-2 focus:ring-[#006044]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Safety Info
                    </label>
                    <textarea
                      {...register("extra.safetyInfo")}
                      rows={2}
                      className="w-full p-3 border rounded-xl outline-none text-sm font-medium bg-white focus:ring-2 focus:ring-[#006044]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: VARIANTS */}
              <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={18} className="text-[#006044]" /> Variants
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      appendVariant({ name: "", priceModifier: 0, stock: 10 })
                    }
                    className="text-[10px] font-black bg-white border px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-all"
                  >
                    + ADD
                  </button>
                </div>
                <div className="space-y-3">
                  {variantFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-white p-2 rounded-2xl border"
                    >
                      <input
                        {...register(`variants.${index}.name` as any)}
                        placeholder="Name"
                        className="p-2 w-full outline-none text-xs font-bold"
                      />
                      <input
                        {...register(`variants.${index}.priceModifier` as any)}
                        type="number"
                        placeholder="Price"
                        className="p-2 w-16 border-l outline-none text-xs font-bold"
                      />
                      <input
                        {...register(`variants.${index}.stock` as any)}
                        type="number"
                        placeholder="Qty"
                        className="p-2 w-14 border-l outline-none text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-zinc-300 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: SPECIFICATIONS */}
              <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    Tech Specs
                  </label>
                  <button
                    type="button"
                    onClick={() => appendAttr({ name: "", value: "" })}
                    className="text-[10px] font-black bg-white border px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-all"
                  >
                    + ADD
                  </button>
                </div>
                <div className="space-y-3">
                  {attrFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center bg-white p-2 rounded-2xl border"
                    >
                      <input
                        {...register(`attributes.${index}.name` as any)}
                        placeholder="Key"
                        className="w-1/2 p-2 outline-none text-xs font-black uppercase tracking-tighter"
                      />
                      <input
                        {...register(`attributes.${index}.value` as any)}
                        placeholder="Value"
                        className="w-1/2 p-2 outline-none text-xs font-bold border-l"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttr(index)}
                        className="p-2 text-zinc-300 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARE & DELIVERY */}
              <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between items-center">
                    Care Rules{" "}
                    <Plus
                      size={14}
                      className="cursor-pointer text-green-600 bg-green-100 rounded-full p-0.5"
                      onClick={() => appendCare({ value: "" })}
                    />
                  </label>
                  {careFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-2 bg-white border rounded-xl p-1 pr-2 items-center"
                    >
                      <input
                        {...register(`careInstructions.${index}.value` as any)}
                        placeholder="e.g. Keep dry"
                        className="flex-1 p-2 outline-none text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => removeCare(index)}
                        className="text-zinc-300 hover:text-rose-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between items-center">
                    Delivery Rules{" "}
                    <Plus
                      size={14}
                      className="cursor-pointer text-blue-600 bg-blue-100 rounded-full p-0.5"
                      onClick={() => appendDelivery({ value: "" })}
                    />
                  </label>
                  {deliveryFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-2 bg-white border rounded-xl p-1 pr-2 items-center"
                    >
                      <input
                        {...register(`deliveryInfo.${index}.value` as any)}
                        placeholder="e.g. Free shipping"
                        className="flex-1 p-2 outline-none text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => removeDelivery(index)}
                        className="text-zinc-300 hover:text-rose-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
