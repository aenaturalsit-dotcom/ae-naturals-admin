// src/app/admin/storefront/SortableSectionItem.tsx

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Trash2, Copy } from "lucide-react";
import { ThemeSection } from "@/lib/validators/storefront";
import { useStorefrontStore } from "@/store/useStorefrontStore";

interface SortableSectionItemProps {
  section: ThemeSection;
  onToggle?: () => void; // Optional callback
  onDuplicate?: () => void; // Optional callback
  onDelete?: () => void; // Optional callback
}

export function SortableSectionItem({ 
  section, 
  onToggle,
  onDuplicate,
  onDelete 
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  
  const {
    activeSectionId,
    setActiveSectionId,
    removeSection,
    toggleSectionActive,
    duplicateSection,
  } = useStorefrontStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = activeSectionId === section.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSectionActive(section.id);
    onToggle?.();
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateSection(section.id);
    onDuplicate?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeSection(section.id);
    onDelete?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setActiveSectionId(section.id)}
      className={`group flex items-center justify-between p-3 mb-2 bg-white border rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "border-[#006044] ring-1 ring-[#006044] shadow-md"
          : "border-gray-200 hover:border-gray-300"
      } ${!section.isActive && "opacity-60 bg-gray-50"}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <GripVertical size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">
            {section.type.replace("_", " ")}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 truncate">
            {(section.settings?.title as string) || "Untitled"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <button
          onClick={handleDuplicate}
          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
          title="Duplicate section"
        >
          <Copy size={15} />
        </button>
        <button
          onClick={handleToggle}
          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
          title={section.isActive ? "Hide section" : "Show section"}
        >
          {section.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button
          onClick={handleRemove}
          className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
          title="Delete section"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}