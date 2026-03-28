// src/app/admin/products/add/page.tsx
"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";

interface APlusBlock {
  type: 'banner' | 'split';
  imageUrl: string;
  title?: string;
  text?: string;
  align?: 'left' | 'right';
}

interface ProductFormData {
  name: string;
  price: number;
  extra: {
    safetyInfo?: string;
    ingredients?: string;
    manufacturer?: string;
    countryOfOrigin?: string;
    aPlusContent: APlusBlock[];
  };
}

export default function AddProductPage() {
  const { register, control, handleSubmit } = useForm<ProductFormData>({
    defaultValues: {
      name: "", price: 0, 
      extra: { aPlusContent: [] }
    }
  });

  const { fields: aPlusBlocks, append, remove } = useFieldArray({
    control,
    name: "extra.aPlusContent"
  });

  const onSubmit = async (data: any) => {
    // Call your API
    await fetch('/api/products', { method: 'POST', body: JSON.stringify(data) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-4 border-b">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <button type="submit" className="bg-black text-white px-6 py-2 rounded-md">Save Product</button>
      </div>

      {/* Basic Info */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        {/* standard inputs: name, price, images */}
      </section>

      {/* Important Info & Details */}
      <section className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Important Information</h2>
          <textarea {...register("extra.safetyInfo")} placeholder="Safety Info..." className="w-full border p-2 mb-2 rounded" />
          <textarea {...register("extra.ingredients")} placeholder="Ingredients..." className="w-full border p-2 mb-2 rounded" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Technical Details</h2>
          <input {...register("extra.manufacturer")} placeholder="Manufacturer" className="w-full border p-2 mb-2 rounded" />
          <input {...register("extra.countryOfOrigin")} placeholder="Country of Origin" className="w-full border p-2 mb-2 rounded" />
        </div>
      </section>

      {/* A+ Content Builder (🔥 ADVANCED) */}
      <section className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">A+ Content Blocks</h2>
          <div className="space-x-2">
            <button type="button" onClick={() => append({ type: 'banner', imageUrl: '', title: '' })} className="text-sm bg-gray-100 px-3 py-1 rounded">+ Banner</button>
            <button type="button" onClick={() => append({ type: 'split', imageUrl: '', text: '', align: 'left' })} className="text-sm bg-gray-100 px-3 py-1 rounded">+ Image/Text</button>
          </div>
        </div>

        <div className="space-y-4">
          {aPlusBlocks.map((block, index) => (
            <div key={block.id} className="p-4 border rounded-md relative bg-gray-50">
              <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-red-500">Remove</button>
              
              <span className="text-xs font-bold uppercase text-gray-500">{block.type} Block</span>
              
              {/* Render dynamic inputs based on block type */}
              <input {...register(`extra.aPlusContent.${index}.imageUrl`)} placeholder="Image URL" className="w-full mt-2 border p-2 rounded" />
              <input {...register(`extra.aPlusContent.${index}.title`)} placeholder="Heading" className="w-full mt-2 border p-2 rounded" />
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}