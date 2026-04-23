"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Edit2, Trash2, ArrowUp, ArrowDown, Plus, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast'; // 👈 Replace with 'sonner' if you use sonner instead

// --- SMART ICON RESOLVER ---
const DynamicIcon = ({ name, color, size = 20 }: { name: string; color?: string; size?: number }) => {
  if (!name) return <LucideIcons.CheckCircle size={size} color={color || "currentColor"} />;

  let IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    const pascalCaseName = name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    IconComponent = (LucideIcons as any)[pascalCaseName];
  }

  IconComponent = IconComponent || LucideIcons.CheckCircle;
  return <IconComponent size={size} color={color || "currentColor"} />;
};

export default function FeaturesManagerPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);

  // --- FETCH FEATURES ---
  const { data: features = [], isLoading } = useQuery({
    queryKey: ['admin-features'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/features');
        return Array.isArray(response) ? response : response?.data || []; 
      } catch (error) {
        console.error("Failed to fetch features:", error);
        toast.error("Failed to load features"); // 👈 Added Toast
        return []; 
      }
    }, 
  });

  // --- REORDER MUTATION (Optimistic Update) ---
  const reorderMutation = useMutation({
    mutationFn: async (newOrder: { id: string; order: number }[]) => {
      return apiClient.patch('/admin/features/reorder', { updates: newOrder });
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ['admin-features'] });
      const previousFeatures = queryClient.getQueryData(['admin-features']);
      
      queryClient.setQueryData(['admin-features'], (old: any[]) => {
        const updated = [...old];
        newOrder.forEach(update => {
          const index = updated.findIndex(f => f.id === update.id);
          if (index !== -1) updated[index] = { ...updated[index], order: update.order };
        });
        return updated.sort((a, b) => a.order - b.order);
      });
      return { previousFeatures };
    },
    onError: (err, newOrder, context) => {
      toast.error("Failed to reorder features"); // 👈 Added Toast
      queryClient.setQueryData(['admin-features'], context?.previousFeatures);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
    },
  });

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === features.length - 1) return;

    const newFeatures = [...features];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    const tempOrder = newFeatures[index].order;
    newFeatures[index].order = newFeatures[swapIndex].order;
    newFeatures[swapIndex].order = tempOrder;

    reorderMutation.mutate([
      { id: newFeatures[index].id, order: newFeatures[index].order },
      { id: newFeatures[swapIndex].id, order: newFeatures[swapIndex].order }
    ]);
  };

  // --- DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/features/${id}`),
    onSuccess: () => {
      toast.success("Feature removed successfully"); // 👈 Added Toast
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
    },
    onError: () => {
      toast.error("Failed to delete feature"); // 👈 Added Toast
    }
  });

  const openAddModal = () => {
    setEditingFeature(null);
    setIsModalOpen(true);
  };

  const openEditModal = (feature: any) => {
    setEditingFeature(feature);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tight">Highlight Features</h1>
            <p className="text-xs text-zinc-500 font-medium mt-1">Manage global service badges (e.g., Same Day Delivery)</p>
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={18} /> Add Highlight
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>
        ) : features.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 font-medium">No features added yet.</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {features.map((feature: any, index: number) => (
              <div key={feature.id} className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
                
                {/* Left: Ordering & Info */}
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveFeature(index, 'up')} disabled={index === 0} className="hover:text-zinc-600 disabled:opacity-30"><ArrowUp size={16}/></button>
                    <button onClick={() => moveFeature(index, 'down')} disabled={index === features.length - 1} className="hover:text-zinc-600 disabled:opacity-30"><ArrowDown size={16}/></button>
                  </div>
                  
                  {/* DYNAMIC ICON WITH COLOR */}
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 transition-colors"
                    style={{ backgroundColor: `${feature.color || '#16a34a'}20` }}
                  >
                    <DynamicIcon name={feature.icon} color={feature.color || '#16a34a'} size={24} />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-zinc-800 text-lg">{feature.title}</h3>
                    {/* NEW: Description rendering in the list */}
                    {feature.description && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1 max-w-md">{feature.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-500">Lucide: {feature.icon}</span>
                      <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-500 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: feature.color || '#16a34a' }} />
                        {feature.color || '#16a34a'}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${feature.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {feature.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(feature)}
                    className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Remove this feature globally?')) deleteMutation.mutate(feature.id) }}
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UNIFIED ADD/EDIT MODAL */}
      {isModalOpen && (
        <FeatureModal 
          editData={editingFeature} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: UNIFIED MODAL ---
function FeatureModal({ editData, onClose }: { editData?: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEditing = !!editData;

  const { register, handleSubmit, watch, setValue } = useForm({
    values: isEditing ? {
      title: editData.title,
      description: editData.description || "",
      icon: editData.icon,
      color: editData.color || '#16a34a',
      isActive: editData.isActive
    } : {
      title: "",
      description: "",
      icon: "",
      color: "#16a34a",
      isActive: true
    }
  });

  const selectedColor = watch("color") || "#16a34a";
  const selectedIcon = watch("icon") || "CheckCircle";

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return apiClient.patch(`/admin/features/${editData.id}`, data);
      }
      return apiClient.post('/admin/features', data);
    },
    onSuccess: () => {
      toast.success(isEditing ? "Highlight updated successfully!" : "Highlight created successfully!"); // 👈 Added Toast
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to save highlight"); // 👈 Added Toast
    }
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
          <h2 className="text-lg font-black text-zinc-800 uppercase tracking-tight">
            {isEditing ? "Edit Highlight" : "New Highlight"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
          
          {/* Live Preview Bubble */}
          <div className="flex items-center justify-center py-2">
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-colors duration-300"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <DynamicIcon name={selectedIcon} color={selectedColor} size={28} />
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Preview</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Display Title</label>
            <input {...register("title", { required: true })} placeholder="e.g. 100% Organic" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#006044] outline-none font-bold text-sm bg-white" />
          </div>

          {/* Description text area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description (Optional)</label>
            <textarea 
              {...register("description")} 
              placeholder="e.g. Crafted without synthetic pesticides or fertilizers." 
              className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#006044] outline-none font-medium text-sm bg-white resize-none custom-scrollbar" 
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between">
                Lucide Icon 
                <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Find &rarr;</a>
              </label>
              <input {...register("icon", { required: true })} placeholder="e.g. Truck" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#006044] outline-none font-bold text-sm bg-white" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Brand Color</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={selectedColor}
                  onChange={(e) => setValue("color", e.target.value, { shouldDirty: true })}
                  className="w-12 h-12 p-1 border rounded-2xl cursor-pointer bg-white" 
                />
                <input 
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setValue("color", e.target.value, { shouldDirty: true })}
                  placeholder="#HEX" 
                  className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#006044] outline-none font-bold text-sm bg-white uppercase" 
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 cursor-pointer mt-2">
            <input type="checkbox" {...register("isActive")} className="w-5 h-5 accent-[#006044]" />
            <span className="text-xs font-black text-zinc-600 uppercase tracking-tight">Active (Visible on Storefront)</span>
          </label>

          <button 
            type="submit" 
            disabled={mutation.isPending} 
            className="w-full bg-[#006044] text-white py-4 rounded-2xl font-bold mt-4 hover:bg-[#004d36] disabled:opacity-50 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-green-100"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <LucideIcons.Save size={18} />}
            {isEditing ? 'Save Changes' : 'Create Highlight'}
          </button>
        </form>
      </div>
    </div>
  );
}