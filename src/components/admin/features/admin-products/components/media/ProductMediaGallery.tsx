// components/admin/features/admin-products/components/media/ProductMediaGallery.tsx

"use client";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableMediaItem from "./SortableMediaItem";
import { MediaItem } from "@/types/media";

interface Props {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  uploadButton?: React.ReactNode;
}

export default function ProductMediaGallery({
  media,
  onChange,
  uploadButton,
}: Props){
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = media.findIndex(
      (m) => (m.publicId || m.url) === active.id,
    );

    const newIndex = media.findIndex((m) => (m.publicId || m.url) === over.id);

    onChange(arrayMove(media, oldIndex, newIndex));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={media.map((m) => m.publicId || m.url)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item, index) => (
            <SortableMediaItem
              key={item.publicId || item.url}
              media={item}
              index={index}
              onRemove={() => onChange(media.filter((_, i) => i !== index))}
            />
          ))}

          {uploadButton}
        </div>
      </SortableContext>
    </DndContext>
  );
}
