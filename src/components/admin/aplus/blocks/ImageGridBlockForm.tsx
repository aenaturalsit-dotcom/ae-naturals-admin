// src/components/admin/aplus/blocks/ImageGridBlockForm.tsx
import React from 'react';
import { useFormContext, useController } from "react-hook-form";
import { Trash2 } from 'lucide-react';
import CloudinaryUpload from '../shared/CloudinaryUpload';

// Match your backend's polymorphic asset structure
interface PolymorphicMedia {
  url: string;
  type: string;
  publicId: string | null;
  posterUrl: string | null;
}

export default function ImageGridBlockForm({ index }: { index: number }) {
  const { register, control, getValues } = useFormContext();
  const basePath = `extra.aPlusContent.${index}.content`;
  const fieldName = `${basePath}.images`;

  const { 
    field: { value, onChange } 
  } = useController({
    name: fieldName,
    control,
    defaultValue: [], // Path initialized as an array
  });

  // Safe fallback to read array references
  const currentImages: PolymorphicMedia[] = Array.isArray(value) ? value : [];

  // 🔥 PRODUCTION-GRADE FIX: Uses getValues to sidestep React closures and batch-updates
  const handleUpload = (incoming: string | string[]) => {
    const incomingUrls = Array.isArray(incoming) ? incoming : [incoming];
    
    // Map strings to your database-compatible polymorphic media structures
    const structuredAssets: PolymorphicMedia[] = incomingUrls.map((url) => ({
      url,
      type: "image",
      publicId: url.split('/').pop()?.split('.')[0] || null,
      posterUrl: null
    }));

    // Fetch the absolute newest values sitting in RHF engine state right this millisecond
    const freshestFormValue = getValues(fieldName);
    const latestImages: PolymorphicMedia[] = Array.isArray(freshestFormValue) ? freshestFormValue : [];

    // Push combined arrays directly into RHF synchronizer
    onChange([...latestImages, ...structuredAssets]);
  };

  const handleDelete = (idxToDelete: number) => {
    onChange(currentImages.filter((_, i) => i !== idxToDelete));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
          Grid Title (Optional)
        </label>
        <input 
          {...register(`${basePath}.title`)} 
          className="w-full px-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white font-medium" 
          placeholder="Gallery" 
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Grid Images
          </label>
          <CloudinaryUpload 
            multiple 
            buttonText="ADD IMAGES"
            className="bg-[#006044] text-white px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md hover:bg-[#004d36] transition"
            onUpload={handleUpload}
          />
        </div>

        <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-zinc-200">
          {currentImages.map((img: PolymorphicMedia, idx: number) => {
            // Guard against mixed legacy strings vs objects gracefully
            const imageSrc = typeof img === 'string' ? img : img?.url;
            if (!imageSrc) return null;

            return (
              <div key={idx} className="relative aspect-square rounded-xl border bg-zinc-50 overflow-hidden group">
                <img 
                  src={imageSrc} 
                  alt="grid asset" 
                  className="w-full h-full object-cover" 
                />
                <button 
                  type="button" 
                  onClick={() => handleDelete(idx)}
                  className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          {currentImages.length === 0 && (
            <div className="col-span-4 text-center py-8 text-xs text-zinc-400 font-bold uppercase tracking-widest">
              No images added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}