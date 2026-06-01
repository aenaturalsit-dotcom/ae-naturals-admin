import React from 'react';
import { useFormContext } from "react-hook-form";
import CloudinaryUpload from '../shared/CloudinaryUpload';

export default function SplitBlockForm({ index }: { index: number }) {
  const { register, setValue } = useFormContext();
  const basePath = `extra.aPlusContent.${index}.content`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Feature Image *</label>
          <div className="flex gap-2">
            <input
              {...register(`${basePath}.leftImageUrl`, { required: true })}
              className="flex-1 px-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white font-medium"
              placeholder="https://..."
            />
            <CloudinaryUpload 
              buttonText="Upload"
              onUpload={(url) => setValue(`${basePath}.leftImageUrl`, url, { shouldDirty: true })}
            />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer mt-4 bg-white p-4 rounded-2xl border shadow-sm">
          <input type="checkbox" {...register(`${basePath}.reverse`)} className="w-5 h-5 accent-[#006044] rounded" />
          <span className="text-xs font-black text-zinc-700 uppercase tracking-widest">Reverse Layout</span>
        </label>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Title</label>
          <input {...register(`${basePath}.rightTitle`)} className="w-full px-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white font-medium" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Description</label>
          <textarea {...register(`${basePath}.rightDescription`)} rows={4} className="w-full px-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white font-medium" />
        </div>
      </div>
    </div>
  );
}