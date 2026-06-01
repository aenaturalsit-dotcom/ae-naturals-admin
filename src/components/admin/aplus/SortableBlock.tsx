// src/components/admin/aplus/SortableBlock.tsx
"use client";

import React, { useState } from 'react';
import { useFormContext } from "react-hook-form";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { APlusBlockType } from '@/types/aplus';

// Modular Components
import BlockHeader from './shared/BlockHeader';
import BannerBlockForm from './blocks/BannerBlockForm';
import SplitBlockForm from './blocks/SplitBlockForm';
import TextBlockForm from './blocks/TextBlockForm';
import ImageGridBlockForm from './blocks/ImageGridBlockForm';

interface SortableBlockProps {
  id: string;
  index: number;
  onDelete: () => void;
}

export default function SortableBlock({ id, index, onDelete }: SortableBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { register, watch } = useFormContext();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const blockType = watch(`extra.aPlusContent.${index}.type`);

  // Map block types to their corresponding components
  const renderBlockForm = () => {
    switch (blockType) {
      case APlusBlockType.BANNER: return <BannerBlockForm index={index} />;
      case APlusBlockType.SPLIT: return <SplitBlockForm index={index} />;
      case APlusBlockType.TEXT: return <TextBlockForm index={index} />;
      case APlusBlockType.IMAGE_GRID: return <ImageGridBlockForm index={index} />;
      default: return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-zinc-50 border rounded-3xl shadow-sm overflow-hidden transition-all ${
        isDragging ? 'ring-2 ring-[#006044] shadow-xl' : 'border-zinc-200'
      }`}
    >
      <BlockHeader 
        blockType={blockType}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        onDelete={onDelete}
        attributes={attributes}
        listeners={listeners}
      />

      {/* Hidden type input strictly keeps form schema intact */}
      <input type="hidden" {...register(`extra.aPlusContent.${index}.type`)} />

      {isExpanded && (
        <div className="p-6 space-y-5">
          {renderBlockForm()}
        </div>
      )}
    </div>
  );
}