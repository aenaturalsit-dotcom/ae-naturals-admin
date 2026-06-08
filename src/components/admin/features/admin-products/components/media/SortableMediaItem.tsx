// components/admin/features/admin-products/components/media/SortableMediaItem.tsx

"use client";

import { X, Film, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MediaItem } from "@/types/media";

interface Props {
  media: MediaItem;
  index: number;
  onRemove: () => void;
}

export default function SortableMediaItem({ media, index, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: media.publicId || media.url,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative h-32 w-32 rounded-3xl overflow-hidden border border-zinc-200 shadow-sm group bg-white"
    >
      {/* Cover Badge */}
      {index === 0 && (
        <div className="absolute left-2 bottom-2  bg-emerald-600 text-white text-[9px] font-black px-2 py-1 rounded-full">
          COVER
        </div>
      )}

      {/* Order Badge */}
      <div className="absolute left-2 top-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full">
        {index + 1}
      </div>

      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow"
      >
        <GripVertical size={14} />
      </button>

      {media.type === "video" ? (
        <div className="h-full w-full bg-zinc-900">
          <video src={media.url} className="h-full w-full object-cover" muted />
          <div className="absolute top-10 left-2 bg-black/60 text-white p-1 rounded">
            <Film size={12} />
          </div>
        </div>
      ) : (
        <img src={media.url} alt="" className="h-full w-full object-cover" />
      )}

      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow "
      >
        <X size={14} />
      </button>
    </div>
  );
}
