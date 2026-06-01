// src\app\admin\storefront\SortableSectionItem.tsx

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Trash2 } from "lucide-react";
import { ThemeSection } from "@/lib/validators/storefront";
import { useStorefrontStore } from "@/store/useStorefrontStore";

export function SortableSectionItem({ section }: { section: ThemeSection }) {
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
  } = useStorefrontStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = activeSectionId === section.id;

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
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            {section.type.replace("_", " ")}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
            {(section.settings?.title as string) || "Global Config"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSectionActive(section.id);
          }}
          className="p-1.5 text-gray-400 hover:text-gray-900"
        >
          {section.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSection(section.id);
          }}
          className="p-1.5 text-red-400 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
