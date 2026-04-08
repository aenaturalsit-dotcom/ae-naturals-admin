// src/components/admin/AddProductModal.tsx
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload, Loader2, Save, Plus, Trash2, Layers } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";
import apiClient from "@/lib/api-client";
import { adminProductService } from "@/services/admin-products.service";

export const AddProductModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);

  // --- DYNAMIC DATA FETCHING ---
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await apiClient.get("/admin/categories");
      return data || [];
    },
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const data = await apiClient.get("/admin/stores");
      return data || [];
    },
  });

  // --- FORM SETUP ---
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      oldPrice: "",
      categoryId: "",
      storeId: "",
      ingredients: "",
      isActive: true,
      careInstructions: [{ value: "" }],
      deliveryInfo: [{ value: "" }],
      attributes: [{ name: "", value: "" }],
      variants: [{ name: "", priceModifier: 0, stock: 10 }], // Added to match schema
      shippingWeightKg: "",
      lengthCm: "",
      widthCm: "",
      heightCm: "",
    },
  });

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

  // --- MUTATION ---
  const mutation = useMutation({
    mutationFn: async (formData: any) => {
      if (images.length === 0)
        throw new Error("At least one image is required");

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        images: images,
        // Map string arrays for schema
        careInstructions: formData.careInstructions
          .map((i: any) => i.value)
          .filter(Boolean),
        deliveryInfo: formData.deliveryInfo
          .map((i: any) => i.value)
          .filter(Boolean),
        // Map nested objects for Prisma create
        attributes: formData.attributes.filter((a: any) => a.name && a.value),
        variants: formData.variants
          .filter((v: any) => v.name)
          .map((v: any) => ({
            ...v,
            priceModifier: parseFloat(v.priceModifier || 0),
            stock: parseInt(v.stock || 0),
          })),
        slug: formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        shippingWeightKg: parseFloat(formData.shippingWeightKg),
        lengthCm: parseFloat(formData.lengthCm),
        widthCm: parseFloat(formData.widthCm),
        heightCm: parseFloat(formData.heightCm),
      };

      return adminProductService.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      reset();
      setImages([]);
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">
        {/* HEADER */}
        <div className="p-8 border-b flex justify-between items-center bg-zinc-50">
          <div>
            <h2 className="text-2xl font-black text-zinc-800 tracking-tight uppercase">
              Full-Fledge Product Entry
            </h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">
              Master Catalog Management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="p-8 space-y-10 overflow-y-auto"
        >
          {/* SECTION: ASSIGNMENT & STATUS */}
          <div className="grid grid-cols-3 gap-6 bg-zinc-50 p-6 rounded-[32px] border border-zinc-100">
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
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-zinc-100 cursor-pointer self-end">
              <input
                type="checkbox"
                {...register("isActive")}
                className="w-5 h-5 accent-[#006044]"
              />
              <span className="text-xs font-black text-zinc-600 uppercase tracking-tight">
                Set Product Live
              </span>
            </div>
          </div>

          {/* SECTION: SHIPPING & LOGISTICS */}
          <div className="grid grid-cols-4 gap-6 bg-zinc-50 p-6 rounded-[32px] border border-zinc-100">
            <div className="space-y-1 col-span-4">
              <label className="text-[10px] font-black text-[#006044] uppercase tracking-widest flex items-center gap-2">
                📦 Shipping Dimensions (Required for Shiprocket)
              </label>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Weight (KG) *
              </label>
              <input
                {...register("shippingWeightKg", { required: true, min: 0.01 })}
                type="number"
                step="0.01"
                placeholder="e.g. 0.5"
                className="w-full p-4 border rounded-2xl outline-none font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Length (CM) *
              </label>
              <input
                {...register("lengthCm", { required: true, min: 1 })}
                type="number"
                placeholder="e.g. 15"
                className="w-full p-4 border rounded-2xl outline-none font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Width (CM) *
              </label>
              <input
                {...register("widthCm", { required: true, min: 1 })}
                type="number"
                placeholder="e.g. 10"
                className="w-full p-4 border rounded-2xl outline-none font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Height (CM) *
              </label>
              <input
                {...register("heightCm", { required: true, min: 1 })}
                type="number"
                placeholder="e.g. 5"
                className="w-full p-4 border rounded-2xl outline-none font-bold"
              />
            </div>
          </div>

          {/* SECTION: BASIC INFO */}
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Product Title *
              </label>
              <input
                {...register("name", { required: true })}
                placeholder="e.g. Red Roses Bouquet"
                className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#006044] outline-none font-bold text-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Base Selling Price *
              </label>
              <input
                {...register("price", { required: true })}
                type="number"
                placeholder="₹0.00"
                className="w-full p-4 border rounded-2xl outline-none font-black text-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                MRP (Old Price)
              </label>
              <input
                {...register("oldPrice")}
                type="number"
                placeholder="₹0.00"
                className="w-full p-4 border rounded-2xl outline-none text-zinc-400 font-bold"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Ingredients / Materials
              </label>
              <input
                {...register("ingredients")}
                placeholder="e.g. Fresh Roses, Premium Wrapping"
                className="w-full p-4 border rounded-2xl outline-none font-medium"
              />
            </div>
          </div>

          {/* SECTION: VARIANTS (Flavour, Extra, Size) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={18} className="text-[#006044]" /> Product Variants
              </label>
              <button
                type="button"
                onClick={() =>
                  appendVariant({ name: "", priceModifier: 0, stock: 10 })
                }
                className="text-[10px] font-black bg-zinc-100 px-4 py-2 rounded-full hover:bg-zinc-200 transition-all"
              >
                + ADD VARIANT
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {variantFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-3xl border border-zinc-100 items-center"
                >
                  <input
                    {...register(`variants.${index}.name` as any)}
                    placeholder="Name (e.g. Eggless)"
                    className="p-3 border rounded-xl text-sm font-bold"
                  />
                  <input
                    {...register(`variants.${index}.priceModifier` as any)}
                    type="number"
                    placeholder="Price +/-"
                    className="p-3 border rounded-xl text-sm font-bold"
                  />
                  <input
                    {...register(`variants.${index}.stock` as any)}
                    type="number"
                    placeholder="Stock"
                    className="p-3 border rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-zinc-300 hover:text-rose-500 justify-self-center"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: FLIPKART STYLE SPECIFICATIONS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                Technical Specifications
              </label>
              <button
                type="button"
                onClick={() => appendAttr({ name: "", value: "" })}
                className="text-[10px] font-black bg-zinc-100 px-4 py-2 rounded-full hover:bg-zinc-200 transition-all"
              >
                + ADD SPEC
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {attrFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-center bg-zinc-50 p-3 rounded-2xl border"
                >
                  <input
                    {...register(`attributes.${index}.name` as any)}
                    placeholder="Key (e.g. Weight)"
                    className="w-1/2 bg-transparent text-sm font-black outline-none uppercase tracking-tighter"
                  />
                  <input
                    {...register(`attributes.${index}.value` as any)}
                    placeholder="Value (e.g. 1kg)"
                    className="w-1/2 bg-transparent text-sm outline-none border-l pl-3 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttr(index)}
                    className="text-zinc-300 hover:text-rose-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: IMAGES */}
          <div className="space-y-4">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
              Image Gallery (Min 1) *
            </label>
            <div className="flex gap-4 flex-wrap">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="relative h-28 w-28 rounded-3xl overflow-hidden border shadow-sm group"
                >
                  <img
                    src={url}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    alt="product"
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
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
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
                    className="h-28 w-28 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-400 hover:border-[#006044] bg-zinc-50 transition-colors"
                  >
                    <Upload size={24} />
                    <span className="text-[10px] font-black mt-2 tracking-widest uppercase">
                      Add
                    </span>
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>

          {/* SECTION: CARE & DELIVERY */}
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between">
                Care Instructions{" "}
                <Plus
                  size={14}
                  className="cursor-pointer text-green-600"
                  onClick={() => appendCare({ value: "" })}
                />
              </label>
              {careFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`careInstructions.${index}.value` as any)}
                    placeholder="e.g. Store in fridge"
                    className="flex-1 p-3 border rounded-xl text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => removeCare(index)}
                    className="text-zinc-300 hover:text-rose-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between">
                Delivery Information{" "}
                <Plus
                  size={14}
                  className="cursor-pointer text-blue-600"
                  onClick={() => appendDelivery({ value: "" })}
                />
              </label>
              {deliveryFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`deliveryInfo.${index}.value` as any)}
                    placeholder="e.g. Same day delivery"
                    className="flex-1 p-3 border rounded-xl text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => removeDelivery(index)}
                    className="text-zinc-300 hover:text-rose-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <textarea
            {...register("description")}
            placeholder="Describe this product for your customers..."
            rows={5}
            className="w-full p-5 border rounded-3xl outline-none focus:ring-2 focus:ring-[#006044] font-medium leading-relaxed"
          />

          {/* SUBMIT */}
          <button
            disabled={mutation.isPending || images.length === 0}
            className="w-full bg-[#006044] text-white py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-green-100 hover:bg-[#004d36] transition-all disabled:bg-zinc-200 disabled:shadow-none flex items-center justify-center gap-4"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Save size={24} /> PUBLISH TO CATALOG
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
