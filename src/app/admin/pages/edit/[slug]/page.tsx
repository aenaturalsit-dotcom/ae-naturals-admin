// src\app\admin\pages\edit\[slug]\page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { adminPagesService } from "@/services/admin-pages.service";

import toast from "react-hot-toast";
import { Switch } from "@/components/admin/ui/Switch";
import { Card } from "@/components/admin/ui/Card";

export default function EditPageAdmin() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params.slug as string;
  const isNew = slugParam === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    storeId: "default-store",
    title: "",
    slug: "",
    introText: "",
    isPublished: false,
    sections: [] as any[],
  });

  useEffect(() => {
    if (!isNew) {
      adminPagesService.getPage(slugParam)
        .then((data) => setFormData(data))
        .catch(() => toast.error("Page not found"))
        .finally(() => setLoading(false));
    }
  }, [slugParam, isNew]);

  // Section Builder Logic
  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: `sec_${Date.now()}`, title: "", contentHtml: "" },
      ],
    }));
  };

  const updateSection = (index: number, field: string, value: string) => {
    const updated = [...formData.sections];
    updated[index][field] = value;
    setFormData({ ...formData, sections: updated });
  };

  const removeSection = (index: number) => {
    const updated = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updated });
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= formData.sections.length) return;
    const updated = [...formData.sections];
    const temp = updated[index];
    updated[index] = updated[index + direction];
    updated[index + direction] = temp;
    setFormData({ ...formData, sections: updated });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) return toast.error("Title and Slug are required");
    
    setSaving(true);
    try {
      // 🔥 FIX: Strip database-only fields out of the payload before sending to NestJS
      const { id, createdAt, updatedAt, store, ...cleanPayload } = formData as any;

      await adminPagesService.upsertPage(cleanPayload);
      toast.success("Page saved successfully!");
      router.push("/admin/pages");
    } catch (error: any) {
      console.error("Save Error:", error);
      
      // Extract the exact error message sent from NestJS
      const backendMessage = error?.response?.data?.message;
      
      if (Array.isArray(backendMessage)) {
        toast.error(backendMessage[0]); // Show the first validation error
      } else {
        toast.error(backendMessage || error.message || "Failed to save page.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Auto-generate slug from title if it's a new page
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (isNew) {
      const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      setFormData({ ...formData, title: newTitle, slug: autoSlug });
    } else {
      setFormData({ ...formData, title: newTitle });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading builder...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/pages")} className="text-gray-400 hover:text-gray-900 transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{isNew ? "Create New Page" : `Editing: ${formData.title}`}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Published</span>
            <Switch 
              checked={formData.isPublished} 
              onChange={(checked) => setFormData({ ...formData, isPublished: checked })} 
            />
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save size={18} /> {saving ? "Saving..." : "Save Page"}
          </button>
        </div>
      </div>

      {/* Basic Settings */}
      <Card className="p-6 space-y-5">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Page Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Page Title</label>
            <input 
              value={formData.title} 
              onChange={handleTitleChange}
              placeholder="e.g. Privacy Policy"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">URL Slug</label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-gray-500 text-sm">/</span>
              <input 
                value={formData.slug} 
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={!isNew}
                className={`w-full border border-gray-300 rounded-r-lg px-4 py-2 outline-none ${!isNew && 'bg-gray-50 text-gray-500'}`} 
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Introduction Text (Optional)</label>
          <textarea 
            value={formData.introText} 
            onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
            placeholder="A brief summary at the top of the page..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
          />
        </div>
      </Card>

      {/* Dynamic Section Builder */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-gray-900">Page Content Sections</h2>
          <button 
            onClick={addSection} 
            className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
          >
            <Plus size={16} /> Add Section
          </button>
        </div>

        {formData.sections.length === 0 && (
          <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            No sections added yet. Click "Add Section" to start building your page.
          </div>
        )}

        {formData.sections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500">
            {/* Section Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center cursor-move">
              <span className="font-bold text-gray-700">Section {index + 1}</span>
              <div className="flex gap-2">
                <button disabled={index === 0} onClick={() => moveSection(index, -1)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-30">
                  <ArrowUp size={16} />
                </button>
                <button disabled={index === formData.sections.length - 1} onClick={() => moveSection(index, 1)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-30">
                  <ArrowDown size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button onClick={() => removeSection(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Section Inputs */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Heading</label>
                <input 
                  value={section.title} 
                  onChange={(e) => updateSection(index, "title", e.target.value)}
                  placeholder="e.g. 1. Information We Collect"
                  className="w-full text-lg font-bold border-b border-gray-200 pb-2 focus:border-blue-500 outline-none bg-transparent" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">HTML Content</label>
                <textarea 
                  value={section.contentHtml} 
                  onChange={(e) => updateSection(index, "contentHtml", e.target.value)}
                  placeholder="<p>Enter your text or HTML here...</p>"
                  className="w-full border border-gray-200 rounded-lg p-3 h-40 font-mono text-sm text-gray-700 outline-none focus:border-blue-500 resize-y" 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}