import React from 'react';
import { useFormContext } from "react-hook-form";

export default function TextBlockForm({ index }: { index: number }) {
  const { register } = useFormContext();
  const basePath = `extra.aPlusContent.${index}.content`;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Section Title</label>
        <input 
          {...register(`${basePath}.title`)} 
          className="w-full px-4 py-3 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white font-medium" 
          placeholder="E.g. Why Choose Us?" 
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Description (HTML allowed)</label>
        <textarea 
          {...register(`${basePath}.description`)} 
          rows={6} 
          className="w-full px-4 py-3 border rounded-2xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#006044] bg-white" 
          placeholder="<p>Your rich text goes here...</p>" 
        />
      </div>
    </div>
  );
}