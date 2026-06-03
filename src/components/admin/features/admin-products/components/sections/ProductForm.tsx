// src/components/admin/features/admin-products/components/sections/ProductForm.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { FormProvider, useController, Controller } from "react-hook-form";
import { ArrowLeft, Save, Loader2, Sparkles, Upload, X, Film } from "lucide-react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

import APlusContentBuilder from "@/components/admin/APlusContentBuilder";
import ProductHighlightsSelector from "@/components/admin/products/ProductHighlightsSelector";
import { useProductForm } from "../../hooks/useProductForm";
import { ProductVariants } from "./ProductVariants";
import { ProductExtraDetails } from "./ProductExtraDetails";
import { ProductFormValues } from "../../schemas/product.schema";
import { MediaItem } from "@/types/media";
import { normalizeMediaCollection } from "@/shared/utils/media-normalization";
import ProductMediaGallery from "../media/ProductMediaGallery";

interface ProductFormProps {
  initialData?: any;
  categories: any[];
  stores: any[];
}

export function ProductForm({ initialData, categories, stores }: ProductFormProps) {
  const router = useRouter();
  
  const { form, mutation, isEditing } = useProductForm(initialData);

  const { field: { value: images, onChange: setImages } } = useController({ 
    name: "images", 
    control: form.control 
  });

  // Track state arrays for stable Cloudinary multi-uploads
  const latestImagesTracker = useRef<MediaItem[]>(images || []);

  useEffect(() => {
    latestImagesTracker.current = images || [];
  }, [images]);

 
  // Safely normalize media collection for rendering previews
  const normalizedMedia = normalizeMediaCollection(images || []);

  return (
    <div className="min-h-screen bg-white pb-24">
      <FormProvider {...form}>
        <form 
          onSubmit={form.handleSubmit(
            (data: ProductFormValues) => mutation.mutate(data),
            (errors) => console.log("🔥 ZOD VALIDATION FAILED:", errors)
          )} 
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
                  {isEditing ? "Edit Product" : "Add New Product"}
                </h1>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">
                  {isEditing ? "Update Catalog Details" : "Master Catalog Management"}
                </p>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={mutation.isPending || !images || images.length === 0} 
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-zinc-300 disabled:shadow-none"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {mutation.isPending 
                ? (isEditing ? "SAVING..." : "PUBLISHING...") 
                : (isEditing ? "SAVE CHANGES" : "PUBLISH TO CATALOG")
              }
            </button>
          </div>

          {/* MAIN FORM GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* Product Info */}
              <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Product Title *</label>
                  <input 
                    {...form.register("name")} 
                    className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#006044] outline-none font-bold text-lg bg-white" 
                  />
                </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Product subtitle</label>
                  <input 
                    {...form.register("subtitle")} 
                    className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#006044] outline-none font-bold text-lg bg-white" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Product Description</label>
                  <textarea 
                    {...form.register("description")} 
                    rows={5} 
                    className="w-full p-5 border rounded-3xl outline-none focus:ring-2 focus:ring-[#006044] font-medium leading-relaxed bg-white" 
                  />
                </div>
              </div>

              

              {/* Media Gallery */}
              <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Media Gallery (Min 1) *</label>
                </div>
                
                <ProductMediaGallery
  media={normalizedMedia}
  onChange={(updatedMedia) => {
    latestImagesTracker.current = updatedMedia;
    setImages(updatedMedia);
  }}
/>
              </div>

              {/* SERVICE HIGHLIGHTS */}
              <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 space-y-4">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={18} className="text-[#006044]" /> Service Highlights
                </label>
                <div className="bg-white p-4 rounded-2xl border border-zinc-100">
                  <Controller
                    name="highlightIds"
                    control={form.control}
                    render={({ field: { value, onChange } }) => (
                      <ProductHighlightsSelector
                        selectedIds={value || []}
                        onChange={(ids) => onChange(ids)}
                      />
                    )}
                  />
                </div>
              </div>

              <APlusContentBuilder />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
              <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Select Store *</label>
                  <select 
                    {...form.register("storeId")} 
                    className="w-full p-3 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-[#006044] font-bold text-sm"
                  >
                    <option value="">Choose Store</option>
                    {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Select Category *</label>
                  <select 
                    {...form.register("categoryId")} 
                    className="w-full p-3 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-[#006044] font-bold text-sm"
                  >
                    <option value="">Choose Category</option>
                    {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-zinc-100 cursor-pointer hover:border-[#006044] transition-colors">
                  <input type="checkbox" {...form.register("isActive")} className="w-5 h-5 accent-[#006044]" />
                  <span className="text-xs font-black text-zinc-600 uppercase tracking-tight">Set Product Live</span>
                </label>
                <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-zinc-100 cursor-pointer hover:border-[#006044] transition-colors">
                  <input type="checkbox" {...form.register("isCodEnabled")} className="w-5 h-5 accent-[#006044]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-tight">Allow COD</span>
                    <span className="text-[10px] text-zinc-400 font-bold mt-0.5">Customers can pay with Cash on Delivery</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-zinc-100 cursor-pointer hover:border-[#006044] transition-colors">
                  <input type="checkbox" {...form.register("isFeatured")} className="w-5 h-5 accent-[#006044]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-tight">Featured Product</span>
                    <span className="text-[10px] text-zinc-400 font-bold mt-0.5">Show in Storefront Carousel</span>
                  </div>
                </label>
              </div>

              <ProductVariants />
              
            </div>
          </div>
          <ProductExtraDetails />

        </form>
      </FormProvider>
    </div>
  );
}