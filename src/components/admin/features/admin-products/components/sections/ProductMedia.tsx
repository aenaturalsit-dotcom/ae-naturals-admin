// src/components/admin/features/admin-products/components/sections/ProductMedia.tsx

import React, { useEffect, useRef } from "react";
import { useFormContext, useController } from "react-hook-form";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X } from "lucide-react";
import { ProductFormValues } from "../../schemas/product.schema";

export function ProductMedia() {
  const { control } = useFormContext<ProductFormValues>();
  
  // Directly binds images to RHF state, eliminating separate useState
  const { field: { value: images, onChange }, fieldState: { error } } = useController({
    name: "images",
    control,
  });

  // 🔥 1. Add a synchronous tracker for rapid-fire multi-uploads
  const latestImagesTracker = useRef<string[]>(images || []);

  // 🔥 2. Keep it in sync if images change (e.g. from initialData or deletions)
  useEffect(() => {
    latestImagesTracker.current = images || [];
  }, [images]);

  return (
    <div className="bg-zinc-50 p-8 rounded-[40px] border border-zinc-100 space-y-4">
      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
        Image Gallery (Min 1) *
      </label>
      
      <div className="flex gap-4 flex-wrap">
        {images.map((url, i) => (
          <div key={i} className="relative h-32 w-32 rounded-3xl overflow-hidden border shadow-sm group">
            <img src={url} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt="product" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
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
              // 🔥 3. Push the new image into our synchronous tracker instantly
              latestImagesTracker.current = [...latestImagesTracker.current, result.info.secure_url];
              
              // 🔥 4. Tell React Hook Form to update with the new full array
              onChange(latestImagesTracker.current);
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
              <span className="text-[10px] font-black mt-2 tracking-widest uppercase">Add Photos</span>
            </button>
          )}
        </CldUploadWidget>
      </div>
      {error && <p className="text-xs text-red-500 font-bold mt-2">{error.message}</p>}
    </div>
  );
}