// src/components/admin/sections/configs/CategoryStripSettings.tsx

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { 
  GripVertical, Trash2, Eye, EyeOff, Plus, Link, Tag, Package, 
  ChevronDown, X, Image as ImageIcon, RefreshCw 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CloudinaryUpload from "../aplus/shared/CloudinaryUpload";

// ============================================================
// 1. TYPES
// ============================================================

interface CategoryStripSettingsProps {
  sectionId: string;
  settings: any;
  onUpdate: (settings: any) => void;
  categories: Array<{ 
    id: string; 
    name: string; 
    slug: string; 
    image?: string | null; 
    icon?: string | null;
    productCount?: number;
  }>;
  collections?: Array<{ 
    id: string; 
    name: string; 
    slug: string;
    image?: string | null;
  }>;
  isLoadingCategories?: boolean;
  onRefreshPreview?: () => void;
}

const BADGE_OPTIONS = [
  { value: "new", label: "New" },
  { value: "sale", label: "Sale" },
  { value: "trending", label: "Trending" },
  { value: "hot", label: "Hot" },
];

// ============================================================
// 2. SORTABLE ITEM COMPONENT - WITH REF FIX
// ============================================================

function SortableItem({ 
  item, 
  index, 
  categories, 
  collections, 
  onUpdate, 
  onRemove 
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ✅ Use ref to always have latest data
  const itemRef = useRef(item);
  
  // ✅ Update ref when item changes
  useEffect(() => {
    itemRef.current = item;
  }, [item]);
  
  // ✅ Local state for UI updates
  const [localItem, setLocalItem] = useState(item);

  // ✅ Sync local state with prop changes
  useEffect(() => {
    if (item) {
      setLocalItem((prev: { targetId: any; title: any; imageUrl: any; badge: any; isEnabled: any; order: any; customLinkConfig: any; }) => ({
        ...prev,
        ...item,
        targetId: item.targetId || prev.targetId || "",
        title: item.title || prev.title || "",
        imageUrl: item.imageUrl !== undefined ? item.imageUrl : prev.imageUrl,
        badge: item.badge !== undefined ? item.badge : prev.badge,
        isEnabled: item.isEnabled !== undefined ? item.isEnabled : prev.isEnabled,
        order: item.order !== undefined ? item.order : prev.order,
        customLinkConfig: item.customLinkConfig || prev.customLinkConfig,
      }));
    }
  }, [item]);

  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: isDragging ? 0.5 : 1 
  };

  const getTypeIcon = () => {
    switch (localItem.type) {
      case "category": return <Tag size={14} />;
      case "collection": return <Package size={14} />;
      case "custom-link": return <Link size={14} />;
      default: return null;
    }
  };

  const getTypeLabel = () => {
    switch (localItem.type) {
      case "category": return "Category";
      case "collection": return "Collection";
      case "custom-link": return "Custom Link";
      default: return "Unknown";
    }
  };

  const getAvailableTargets = () => {
    if (localItem.type === "category") return categories || [];
    if (localItem.type === "collection") return collections || [];
    return [];
  };

  const availableTargets = getAvailableTargets();
  const targetLabel = localItem.type === "category" ? "Category" : "Collection";

  // ✅ FIX: Handle all updates with ref
  const handleUpdate = useCallback((updates: any) => {
    const currentItem = itemRef.current;
    const updated = { ...currentItem, ...updates };
    setLocalItem(updated);
    onUpdate(currentItem.id, updates);
  }, [onUpdate]);

  // ✅ FIX: Handle image upload using ref to get latest data
  const handleImageUpload = useCallback((url: string) => {
    
    // ✅ Get the latest item from ref
    const currentItem = itemRef.current;
    
    
    // ✅ CRITICAL: Merge with ALL existing data from ref
    const updatedItem = {
      id: currentItem.id,
      type: currentItem.type,
      targetId: currentItem.targetId || "",
      isEnabled: currentItem.isEnabled !== false,
      title: currentItem.title || "",
      imageUrl: url,
      badge: currentItem.badge || null,
      order: currentItem.order || 0,
      customLinkConfig: currentItem.customLinkConfig || undefined
    };
    
    
    // Update local state
    setLocalItem(updatedItem);
    
    // Send ONLY imageUrl update to parent
    onUpdate(currentItem.id, { imageUrl: url });
    
  }, [onUpdate]);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "bg-white border rounded-xl p-3 transition-all",
        localItem.isEnabled ? "border-gray-200" : "border-gray-100 bg-gray-50/50",
        isExpanded && "border-[#006044] ring-1 ring-[#006044]"
      )}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 flex-shrink-0">
          <GripVertical size={16} />
        </div>
        
        <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">#{index + 1}</span>
        
        <div className="text-gray-500">{getTypeIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium truncate", !localItem.isEnabled && "text-gray-400")}>
            {localItem.title || "Untitled"}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            {getTypeLabel()}
            {localItem.badge && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[8px] font-bold uppercase">
                {localItem.badge}
              </span>
            )}
            {localItem.targetId && (
              <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[8px] font-bold">
                ✓ Linked
              </span>
            )}
            {!localItem.targetId && localItem.type !== "custom-link" && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[8px] font-bold">
                ⚠️ No selection
              </span>
            )}
            {localItem.imageUrl && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px] font-bold">
                🖼️ Image
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <button 
            onClick={() => handleUpdate({ isEnabled: !localItem.isEnabled })} 
            className={cn("p-1.5 rounded", localItem.isEnabled ? "text-gray-400 hover:text-gray-900" : "text-gray-300 hover:text-gray-600")}
            title={localItem.isEnabled ? "Disable" : "Enable"}
          >
            {localItem.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-1.5 rounded text-gray-400 hover:text-gray-600"
            title="Expand settings"
          >
            <ChevronDown size={14} className={cn("transition-transform", isExpanded && "rotate-180")} />
          </button>
          <button 
            onClick={() => onRemove(localItem.id)} 
            className="p-1.5 rounded text-red-400 hover:text-red-600"
            title="Remove item"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Display Title
            </label>
            <input
              type="text"
              value={localItem.title || ""}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#006044] outline-none"
              placeholder="Override display title"
            />
          </div>

          {/* Target Selection */}
          {localItem.type !== "custom-link" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Select {targetLabel}
              </label>
              <select
                value={localItem.targetId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selected = availableTargets.find((t: any) => t.id === selectedId);
                  
                  const updates: any = { targetId: selectedId };
                  if (selected && !localItem.title) {
                    updates.title = selected.name;
                  }
                  
                  handleUpdate(updates);
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#006044] outline-none"
              >
                <option value="">Select {targetLabel}...</option>
                {availableTargets.map((target: any) => (
                  <option key={target.id} value={target.id}>
                    {target.name}
                  </option>
                ))}
              </select>
              {availableTargets.length === 0 && (
                <p className="text-[9px] text-amber-500 mt-1">
                  ⚠️ No {targetLabel}s available. Please create one first.
                </p>
              )}
              {localItem.targetId && availableTargets.length > 0 && (
                <p className="text-[9px] text-green-600 mt-1">
                  ✅ Selected: {availableTargets.find((t: any) => t.id === localItem.targetId)?.name || "Unknown"}
                </p>
              )}
            </div>
          )}

          {/* Custom Link Config */}
          {localItem.type === "custom-link" && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">URL</label>
                <input
                  type="text"
                  value={localItem.customLinkConfig?.url || ""}
                  onChange={(e) => handleUpdate({ 
                    customLinkConfig: { 
                      ...localItem.customLinkConfig, 
                      url: e.target.value 
                    } 
                  })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#006044] outline-none"
                  placeholder="https://example.com or /internal-page"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`newtab-${localItem.id}`}
                  checked={localItem.customLinkConfig?.openInNewTab || false}
                  onChange={(e) => handleUpdate({ 
                    customLinkConfig: { 
                      ...localItem.customLinkConfig, 
                      openInNewTab: e.target.checked 
                    } 
                  })}
                  className="rounded border-gray-300 text-[#006044] focus:ring-[#006044]"
                />
                <label htmlFor={`newtab-${localItem.id}`} className="text-xs text-gray-600">
                  Open in new tab
                </label>
              </div>
            </>
          )}

          {/* ✅ Custom Image with Cloudinary Upload */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Custom Image / Icon
            </label>
            <div className="flex items-center gap-3">
              {localItem.imageUrl ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 group">
                  <img 
                    src={localItem.imageUrl} 
                    alt="Custom icon" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f3f4f6'/%3E%3Ctext x='32' y='38' font-family='sans-serif' font-size='24' text-anchor='middle' fill='%239ca3af'%3E?%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <button
                    onClick={() => handleUpdate({ imageUrl: null })}
                    className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                  <ImageIcon size={20} />
                </div>
              )}

              <div className="flex-1">
                <CloudinaryUpload
                  onUpload={handleImageUpload}
                  resourceType="image"
                  buttonText={localItem.imageUrl ? "Replace Image" : "Upload Image"}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                />
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-1">
              Upload a custom icon or image for this item
            </p>
          </div>

          {/* Badge */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Badge</label>
            <select
              value={localItem.badge || ""}
              onChange={(e) => handleUpdate({ badge: e.target.value || null })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-[#006044] outline-none"
            >
              <option value="">None</option>
              {BADGE_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 3. MAIN COMPONENT
// ============================================================

export function CategoryStripSettings({ 
  sectionId, 
  settings, 
  onUpdate, 
  categories = [], 
  collections = [],
  isLoadingCategories = false,
  onRefreshPreview,
}: CategoryStripSettingsProps) {
  const [newItemType, setNewItemType] = useState<"category" | "collection" | "custom-link">("category");
  const [localItems, setLocalItems] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync local items with settings
  useEffect(() => {
    if (settings.items) {
      const itemsWithDefaults = settings.items.map((item: any) => ({
        ...item,
        targetId: item.targetId || "",
        title: item.title || "",
        imageUrl: item.imageUrl || null,
        badge: item.badge || null,
        isEnabled: item.isEnabled !== false,
        order: item.order || 0,
        customLinkConfig: item.customLinkConfig || undefined
      }));
      setLocalItems(itemsWithDefaults);
    }
  }, [settings.items]);

  const items = localItems;

  // Handle adding item
  const handleAddItem = useCallback(() => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: newItemType,
      targetId: "",
      isEnabled: true,
      title: "",
      imageUrl: null,
      badge: null,
      order: items.length,
      ...(newItemType === "custom-link" && { 
        customLinkConfig: { url: "", openInNewTab: false } 
      })
    };
    
    const updatedItems = [...items, newItem];
    setLocalItems(updatedItems);
    onUpdate({ 
      ...settings, 
      items: updatedItems, 
      _legacy: false, 
      _legacyCategoryIds: [] 
    });
    
    if (onRefreshPreview) {
      setTimeout(onRefreshPreview, 100);
    }
  }, [items, newItemType, onUpdate, settings, onRefreshPreview]);

  // Handle updating item
  const handleUpdateItem = useCallback((id: string, updates: any) => {
    
    const updatedItems = items.map((item: any) => {
      if (item.id === id) {
        const merged = { ...item, ...updates };
        return merged;
      }
      return item;
    });
    
    setLocalItems(updatedItems);
    onUpdate({ ...settings, items: updatedItems });
    
    if (onRefreshPreview) {
      setTimeout(onRefreshPreview, 100);
    }
  }, [items, onUpdate, settings, onRefreshPreview]);

  // Handle removing item
  const handleRemoveItem = useCallback((id: string) => {
    const updatedItems = items.filter((item: any) => item.id !== id);
    setLocalItems(updatedItems);
    onUpdate({ ...settings, items: updatedItems });
    
    if (onRefreshPreview) {
      setTimeout(onRefreshPreview, 100);
    }
  }, [items, onUpdate, settings, onRefreshPreview]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const oldIndex = items.findIndex((item: any) => item.id === active.id);
    const newIndex = items.findIndex((item: any) => item.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newItems = [...items];
    const [moved] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, moved);
    
    const reorderedItems = newItems.map((item: any, i: number) => ({ 
      ...item, 
      order: i 
    }));
    
    setLocalItems(reorderedItems);
    onUpdate({ ...settings, items: reorderedItems });
    
    if (onRefreshPreview) {
      setTimeout(onRefreshPreview, 100);
    }
  }, [items, onUpdate, settings, onRefreshPreview]);

  // Handle field change
  const handleFieldChange = useCallback((field: string, value: any) => {
    onUpdate({ ...settings, [field]: value });
    
    if (onRefreshPreview) {
      setTimeout(onRefreshPreview, 100);
    }
  }, [onUpdate, settings, onRefreshPreview]);

  // Loading state
  if (isLoadingCategories) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={settings.title || ""}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none"
          placeholder="Shop by Category"
        />
      </div>
      
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
          Subtitle
        </label>
        <input
          type="text"
          value={settings.subtitle || ""}
          onChange={(e) => handleFieldChange("subtitle", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none"
          placeholder="Browse our collections"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Layout
          </label>
          <select
            value={settings.layout || "scrollable"}
            onChange={(e) => handleFieldChange("layout", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none"
          >
            <option value="scrollable">Scrollable (Horizontal)</option>
            <option value="grid">Grid</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Max Items
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={settings.displayCount || 12}
            onChange={(e) => handleFieldChange("displayCount", parseInt(e.target.value) || 12)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Image Size
          </label>
          <select
            value={settings.imageSize || "medium"}
            onChange={(e) => handleFieldChange("imageSize", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Image Shape
          </label>
          <select
            value={settings.imageShape || "circle"}
            onChange={(e) => handleFieldChange("imageShape", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none"
          >
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.showCategoryNames !== false}
            onChange={(e) => handleFieldChange("showCategoryNames", e.target.checked)}
            className="rounded border-gray-300 text-[#006044] focus:ring-[#006044]"
          />
          Show names
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.showProductCount !== false}
            onChange={(e) => handleFieldChange("showProductCount", e.target.checked)}
            className="rounded border-gray-300 text-[#006044] focus:ring-[#006044]"
          />
          Show product count
        </label>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as any)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none"
          >
            <option value="category">Category</option>
            <option value="collection">Collection</option>
            <option value="custom-link">Custom Link</option>
          </select>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-[#006044] text-white rounded-lg text-sm font-medium hover:bg-[#004d36] transition-colors"
          >
            <Plus size={16} /> Add Item
          </button>
          <span className="text-xs text-gray-400">{items.length} items</span>
          {onRefreshPreview && (
            <button
              onClick={() => onRefreshPreview()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh preview"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400">No items added yet. Click "Add Item" to start.</p>
            {categories.length === 0 && collections.length === 0 && (
              <p className="text-xs text-amber-500 mt-2">
                ⚠️ No categories or collections available. Please create them first.
              </p>
            )}
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map((item: any) => item.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item: any, index: number) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    index={index}
                    categories={categories}
                    collections={collections}
                    onUpdate={handleUpdateItem}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="text-[10px] text-gray-400 border-t border-gray-100 pt-3 mt-3">
          <p>Drag items to reorder. Each item can be individually enabled/disabled. Custom links support internal and external URLs.</p>
        </div>
      </div>
    </div>
  );
}