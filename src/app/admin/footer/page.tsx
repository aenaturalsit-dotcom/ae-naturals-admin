// src\app\admin\footer\page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { 
  Save, Plus, Trash2, Link as LinkIcon, Columns, 
  FileText, GripVertical, Loader2 
} from "lucide-react";
import { 
  DndContext, closestCenter, KeyboardSensor, 
  PointerSensor, useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, horizontalListSortingStrategy, useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { adminFooterService } from "@/services/admin-footer.service";
import { adminPagesService } from "@/services/admin-pages.service";
import { Card } from "@/components/admin/ui/Card";
import toast from "react-hot-toast";

// --- Sortable Link Component ---
function SortableLink({ link, colId, updateLink, removeLink, pages, handlePageSelect }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2 bg-white p-3 rounded shadow-sm border border-gray-100 relative group/link">
      <div className="flex items-center justify-between">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical size={16} />
        </div>
        <button onClick={() => removeLink(colId, link.id)} className="text-red-400 hover:text-red-600 transition">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 p-1.5 rounded border border-blue-100">
        <FileText size={12} />
        <select 
          className="bg-transparent w-full outline-none cursor-pointer"
          onChange={(e) => handlePageSelect(colId, link.id, e.target.value)}
          value=""
        >
          <option value="" disabled>Quick link to page...</option>
          {pages.map((page: any) => (
            <option key={page.id} value={page.slug}>{page.title}</option>
          ))}
        </select>
      </div>

      <input
        value={link.label}
        onChange={(e) => updateLink(colId, link.id, 'label', e.target.value)}
        placeholder="Link Label"
        className="text-sm font-medium border-b border-transparent focus:border-blue-300 outline-none"
      />
      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <LinkIcon size={12} />
        <input
          value={link.url}
          onChange={(e) => updateLink(colId, link.id, 'url', e.target.value)}
          placeholder="/url"
          className="w-full outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

// --- Sortable Column Component ---
function SortableColumn({ col, removeColumn, updateColumnTitle, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4 bg-gray-50 border border-gray-200 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 group">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400">
          <GripVertical size={20} />
        </div>
        <input
          value={col.title}
          onChange={(e) => updateColumnTitle(col.id, e.target.value)}
          className="font-bold text-lg bg-transparent border-b border-gray-300 w-full focus:border-blue-500 outline-none"
          placeholder="Column Title"
        />
        <button onClick={() => removeColumn(col.id)} className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
      {children}
    </Card>
  );
}

// --- Main Page Component ---
export default function FooterManager() {
  const [columns, setColumns] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

useEffect(() => {
    Promise.all([
      adminFooterService.getFooter(),
      adminPagesService.getAllPages()
    ]).then(([footerRes, pagesRes]) => {
      
      // 🔥 THE FIX: Sanitize the incoming data to guarantee every item has an ID
      const safeColumns = (footerRes?.columns || []).map((col: any, cIdx: number) => ({
        ...col,
        id: col.id || `col-${cIdx}-${Date.now()}`,
        links: (col.links || []).map((link: any, lIdx: number) => ({
          ...link,
          id: link.id || `link-${cIdx}-${lIdx}-${Date.now()}`
        }))
      }));

      setColumns(safeColumns);
      setPages(pagesRes.filter((p: any) => p.isPublished) || []);
      setLoading(false);
    }).catch((err) => {
      console.error("LOAD ERROR:", err);
      toast.error("Failed to load data");
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminFooterService.upsertFooter({ storeId: 'default-store', columns });
      toast.success("Footer layout saved!");
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // --- Logic Handlers ---

  const addColumn = () => {
    if (columns.length >= 4) return toast.error("Max 4 columns allowed");
    setColumns([...columns, { id: `col-${Date.now()}`, title: "New Column", links: [] }]);
  };

  // 🔥 Declaring removeColumn correctly
  const removeColumn = (colId: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== colId));
  };

  const updateColumnTitle = (id: string, val: string) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, title: val } : c));
  };

  const addLink = (colId: string) => {
    setColumns(prev => prev.map(c => 
      c.id === colId 
        ? { ...c, links: [...c.links, { id: `link-${Date.now()}`, label: "", url: "" }] } 
        : c
    ));
  };

  const updateLink = (colId: string, linkId: string, field: string, value: string) => {
    setColumns(prev => prev.map(c => 
      c.id === colId 
        ? { ...c, links: c.links.map((l: any) => l.id === linkId ? { ...l, [field]: value } : l) } 
        : c
    ));
  };

  const removeLink = (colId: string, linkId: string) => {
    setColumns(prev => prev.map(c => 
      c.id === colId 
        ? { ...c, links: c.links.filter((l: any) => l.id !== linkId) } 
        : c
    ));
  };

  const handlePageSelect = (colId: string, linkId: string, slug: string) => {
    const page = pages.find(p => p.slug === slug);
    if (page) {
      updateLink(colId, linkId, 'url', `/${slug}`);
      updateLink(colId, linkId, 'label', page.title);
    }
  };

  // --- Drag & Drop Handler ---
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // 1. Column Reordering
    if (columns.some(c => c.id === active.id)) {
      setColumns((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    } 
    // 2. Link Reordering
    else {
      setColumns(prev => prev.map(col => {
        if (col.links.some((l: any) => l.id === active.id)) {
          const oldIndex = col.links.findIndex((l: any) => l.id === active.id);
          const newIndex = col.links.findIndex((l: any) => l.id === over.id);
          return { ...col, links: arrayMove(col.links, oldIndex, newIndex) };
        }
        return col;
      }));
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <Columns className="text-blue-600" /> Storefront Footer
          </h1>
          <p className="text-sm text-gray-500">Drag and drop columns and links to reorder your site footer.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={addColumn} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition shadow-sm">
            <Plus size={18} /> Add Column
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((col) => (
              <SortableColumn 
                key={col.id} 
                col={col} 
                removeColumn={removeColumn} 
                updateColumnTitle={updateColumnTitle}
              >
                <div className="flex-1 space-y-3 mt-2">
                  <SortableContext items={col.links.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
                    {col.links.map((link: any) => (
                      <SortableLink 
                        key={link.id} 
                        link={link} 
                        colId={col.id} 
                        updateLink={updateLink} 
                        removeLink={removeLink} 
                        pages={pages} 
                        handlePageSelect={handlePageSelect} 
                      />
                    ))}
                  </SortableContext>
                </div>
                <button onClick={() => addLink(col.id)} className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-bold text-blue-600 bg-blue-50/50 py-3 rounded-xl border border-dashed border-blue-200 hover:bg-blue-50 transition">
                  <Plus size={14} /> Add Link
                </button>
              </SortableColumn>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}