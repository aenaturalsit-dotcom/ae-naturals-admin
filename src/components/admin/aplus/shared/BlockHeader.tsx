import React from 'react';
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface BlockHeaderProps {
  blockType: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  attributes: any;
  listeners: any;
}

export default function BlockHeader({
  blockType,
  isExpanded,
  onToggleExpand,
  onDelete,
  attributes,
  listeners
}: BlockHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-zinc-100 rounded-t-3xl">
      <div className="flex items-center gap-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition"
        >
          <GripVertical size={20} />
        </div>
        <span className="uppercase text-[10px] font-black tracking-widest text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
          {blockType} BLOCK
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button 
          type="button" 
          onClick={onToggleExpand} 
          className="p-2 text-zinc-400 hover:text-[#006044] hover:bg-green-50 rounded-full transition"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button 
          type="button" 
          onClick={onDelete} 
          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition shadow-sm border border-zinc-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}