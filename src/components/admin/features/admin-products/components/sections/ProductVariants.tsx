// src\components\admin\features\admin-products\components\sections\ProductVariants.tsx

import { useFormContext, useFieldArray } from "react-hook-form";
import { Layers, Trash2 } from "lucide-react";
import { ProductFormValues } from "../../schemas/product.schema";

export function ProductVariants() {
  const { register, control } = useFormContext<ProductFormValues>();
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: "variants" });

  return (
    <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100 space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <Layers size={18} className="text-[#006044]" /> Variants
        </label>
        <button type="button" onClick={() => appendVariant({ name: "", sku: "", optionType: "Size", optionValue: "", price: 0, oldPrice: 0, stock: 10, shippingWeightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0 })} className="text-[10px] font-black bg-white border px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-all">
          + ADD VARIANT
        </button>
      </div>

      <div className="space-y-4">
        {variantFields.map((field, index) => (
          <div key={field.id} className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-3 relative shadow-sm">
            {variantFields.length > 1 && (
              <button type="button" onClick={() => removeVariant(index)} className="absolute top-3 right-3 text-zinc-300 hover:text-rose-500 bg-zinc-50 rounded-full p-1 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
            <div className="grid grid-cols-2 gap-3 pr-6">
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Variant Name</label>
                <input {...register(`variants.${index}.name`)} placeholder="e.g. 500ml Pack" className="w-full p-2 outline-none text-xs font-bold border-b border-zinc-100 focus:border-[#006044] transition-colors" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">SKU</label>
                <input {...register(`variants.${index}.sku`)} placeholder="SKU" className="w-full p-2 outline-none text-xs border-b border-zinc-100 focus:border-[#006044] transition-colors" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Stock</label>
                <input {...register(`variants.${index}.stock`)} type="number" placeholder="Qty" className="w-full p-2 outline-none text-xs border-b border-zinc-100 focus:border-[#006044] transition-colors" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Option Type</label>
                <input {...register(`variants.${index}.optionType`)} placeholder="e.g. Size" className="w-full p-2 outline-none text-xs border-b border-zinc-100 focus:border-[#006044] transition-colors" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Value</label>
                <input {...register(`variants.${index}.optionValue`)} placeholder="e.g. 500ml" className="w-full p-2 outline-none text-xs border-b border-zinc-100 focus:border-[#006044] transition-colors" />
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Variant Price (₹)</label>
                  <input {...register(`variants.${index}.price`)} type="number" step="0.01" placeholder="Absolute Price" className="w-full p-2 outline-none text-xs border-b border-zinc-100 font-bold text-[#006044] focus:border-[#006044] transition-colors" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase ml-1">Variant MRP (₹)</label>
                  <input {...register(`variants.${index}.oldPrice`)} type="number" step="0.01" placeholder="Old Price" className="w-full p-2 outline-none text-xs border-b border-zinc-100 text-zinc-400 font-bold focus:border-[#006044] transition-colors" />
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 p-3 rounded-xl grid grid-cols-4 gap-2 border border-zinc-100">
              <div className="text-center">
                <label className="text-[8px] font-black text-zinc-400 uppercase">WT(kg)</label>
                <input {...register(`variants.${index}.shippingWeightKg`)} type="number" step="0.001" placeholder="0" className="w-full bg-white border border-zinc-200 rounded p-1.5 mt-1 text-center text-xs font-bold outline-none focus:border-[#006044]" />
              </div>
              <div className="text-center">
                <label className="text-[8px] font-black text-zinc-400 uppercase">L(cm)</label>
                <input {...register(`variants.${index}.lengthCm`)} type="number" placeholder="0" className="w-full bg-white border border-zinc-200 rounded p-1.5 mt-1 text-center text-xs font-bold outline-none focus:border-[#006044]" />
              </div>
              <div className="text-center">
                <label className="text-[8px] font-black text-zinc-400 uppercase">W(cm)</label>
                <input {...register(`variants.${index}.widthCm`)} type="number" placeholder="0" className="w-full bg-white border border-zinc-200 rounded p-1.5 mt-1 text-center text-xs font-bold outline-none focus:border-[#006044]" />
              </div>
              <div className="text-center">
                <label className="text-[8px] font-black text-zinc-400 uppercase">H(cm)</label>
                <input {...register(`variants.${index}.heightCm`)} type="number" placeholder="0" className="w-full bg-white border border-zinc-200 rounded p-1.5 mt-1 text-center text-xs font-bold outline-none focus:border-[#006044]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}