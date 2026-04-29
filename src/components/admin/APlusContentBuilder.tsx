// src\components\admin\APlusContentBuilder.tsx


"use client";

import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LayoutTemplate } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableBlock from "./aplus/SortableBlock";
import { APlusBlockType } from "@/types/aplus";

export default function APlusContentBuilder() {
  const { control } = useFormContext();
  
  // The 'move' function is the magic here—it reorders the form array!
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "extra.aPlusContent",
  });

  // Configure sensors for drag and drop to play nicely with form inputs
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Prevents accidental drags when clicking inputs
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const handleAddBlock = (type: APlusBlockType) => {
    // We nest properties inside 'content' so it matches our backend Prisma Json schema perfectly
    const defaultContent = 
      type === APlusBlockType.BANNER ? { imageUrl: "", videoUrl: "", overlayTitle: "" } :
      type === APlusBlockType.SPLIT ? { leftImageUrl: "", rightTitle: "", rightDescription: "", reverse: false } :
      type === APlusBlockType.IMAGE_GRID ? { title: "", images: [] } :
      { title: "", description: "" }; // TEXT

    append({ type, content: defaultContent });
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-zinc-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center">
            <LayoutTemplate className="w-5 h-5 mr-2 text-[#006044]" /> A+ Rich Content
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Build beautiful, Amazon-style product descriptions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleAddBlock(APlusBlockType.BANNER)} className="text-[10px] uppercase tracking-widest font-black bg-zinc-100 text-zinc-700 px-4 py-2 rounded-full hover:bg-zinc-200 transition">+ Banner</button>
          <button type="button" onClick={() => handleAddBlock(APlusBlockType.SPLIT)} className="text-[10px] uppercase tracking-widest font-black bg-[#006044]/10 text-[#006044] px-4 py-2 rounded-full hover:bg-[#006044]/20 transition">+ Split</button>
          <button type="button" onClick={() => handleAddBlock(APlusBlockType.IMAGE_GRID)} className="text-[10px] uppercase tracking-widest font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition">+ Grid</button>
          <button type="button" onClick={() => handleAddBlock(APlusBlockType.TEXT)} className="text-[10px] uppercase tracking-widest font-black bg-purple-50 text-purple-600 px-4 py-2 rounded-full hover:bg-purple-100 transition">+ Text</button>
        </div>
      </div>

      <div className="space-y-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((field, index) => (
              <SortableBlock 
                key={field.id} 
                id={field.id}
                index={index} 
                onDelete={() => remove(index)} 
              />
            ))}
          </SortableContext>
        </DndContext>

        {fields.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-[32px] bg-zinc-50/50">
            <LayoutTemplate className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
            <p className="text-zinc-600 font-bold">No A+ Content blocks added yet.</p>
            <p className="text-xs text-zinc-400 mt-2 font-medium">Add banners and text splits to make your product page stand out.</p>
          </div>
        )}
      </div>
    </div>
  );
}