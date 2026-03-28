// src/components/admin/products/APlusContentBuilder.tsx
"use client";

import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LayoutTemplate, Trash2, Image as ImageIcon } from "lucide-react";

export default function APlusContentBuilder() {
  // Grab control and register from the parent form's FormProvider
  const { control, register, watch } = useFormContext();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "extra.aPlusContent",
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <LayoutTemplate className="w-5 h-5 mr-2 text-indigo-500" /> A+ Rich Content
          </h2>
          <p className="text-xs text-gray-500 mt-1">Build beautiful, Amazon-style product descriptions.</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => append({ type: "banner", imageUrl: "", title: "" })}
            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition font-medium"
          >
            + Add Banner
          </button>
          <button
            type="button"
            onClick={() => append({ type: "split", imageUrl: "", text: "", align: "left" })}
            className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition font-medium"
          >
            + Add Split Block
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => {
          const blockType = watch(`extra.aPlusContent.${index}.type`);

          return (
            <div key={field.id} className="relative bg-gray-50 p-5 rounded-lg border border-gray-200 group">
              {/* Header & Delete Button */}
              <div className="flex justify-between items-center mb-4">
                <span className="uppercase text-xs font-bold tracking-wider text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {blockType} BLOCK
                </span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-400 hover:text-red-600 transition p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Hidden Type Input */}
              <input type="hidden" {...register(`extra.aPlusContent.${index}.type`)} />

              <div className="grid gap-5">
                {/* SHARED FIELD: Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                  <div className="flex relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      <ImageIcon size={18} />
                    </span>
                    <input
                      {...register(`extra.aPlusContent.${index}.imageUrl`, { required: true })}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      placeholder="https://your-image-url.com/img.jpg"
                    />
                  </div>
                </div>

                {/* BANNER SPECIFIC */}
                {blockType === "banner" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Title (Optional)</label>
                    <input
                      {...register(`extra.aPlusContent.${index}.title`)}
                      className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
                      placeholder="E.g. Premium Quality Natural Ingredients"
                    />
                  </div>
                )}

                {/* SPLIT SPECIFIC */}
                {blockType === "split" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descriptive Text *</label>
                      <textarea
                        {...register(`extra.aPlusContent.${index}.text`, { required: true })}
                        rows={4}
                        className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
                        placeholder="Describe the feature shown in the image..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image Alignment</label>
                      <select
                        {...register(`extra.aPlusContent.${index}.align`)}
                        className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
                      >
                        <option value="left">Image on Left, Text on Right</option>
                        <option value="right">Text on Left, Image on Right</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <LayoutTemplate className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No A+ Content blocks added yet.</p>
            <p className="text-sm text-gray-400 mt-1">Add banners and text splits to make your product page stand out.</p>
          </div>
        )}
      </div>
    </div>
  );
}