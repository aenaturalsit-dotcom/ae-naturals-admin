import React from 'react';
import { useFormContext } from "react-hook-form";
import CloudinaryUpload from '../shared/CloudinaryUpload';

export default function BannerBlockForm({ index }: { index: number }) {
  const { register, setValue } = useFormContext();
  const basePath = `extra.aPlusContent.${index}.content`;

  return (
    <div className="grid gap-4">
      <div>
        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Background Image *</label>
        <div className="flex gap-2">
          <input
            {...register(`${basePath}.imageUrl`, { required: true })}
            className="flex-1 px-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white font-medium"
            placeholder="https://..."
          />
          <CloudinaryUpload 
            buttonText="Upload"
            onUpload={(url) => setValue(`${basePath}.imageUrl`, url, { shouldDirty: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Overlay Title</label>
          <input
            {...register(`${basePath}.overlayTitle`)}
            className="w-full px-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white font-medium"
            placeholder="Main Title..."
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Video / YouTube (Optional)</label>
          <div className="flex gap-2">
            <input
              {...register(`${basePath}.videoUrl`)}
              className="flex-1 px-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white font-medium"
              placeholder="Paste link or upload..."
            />
            <CloudinaryUpload 
              resourceType="video"
              className="bg-zinc-200 text-zinc-700 px-4 py-3 rounded-2xl hover:bg-zinc-300 transition"
              onUpload={(url) => setValue(`${basePath}.videoUrl`, url, { shouldDirty: true })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}