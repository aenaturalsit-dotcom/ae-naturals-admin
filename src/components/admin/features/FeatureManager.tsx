// src/components/admin/features/FeatureManager.tsx
"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function FeatureManager() {
  const queryClient = useQueryClient();
  const { data: features = [] } = useQuery({
    queryKey: ['admin-features'],
    queryFn: () => apiClient.get('/admin/features'),
  });

  // Reorder Mutation with Optimistic UI Update
  const reorderMutation = useMutation({
    mutationFn: (newOrder: { id: string; order: number }[]) => 
      apiClient.patch('/admin/features/reorder', { updates: newOrder }),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ['admin-features'] });
      const previousFeatures = queryClient.getQueryData(['admin-features']);
      
      // Optimistically update the UI cache
      queryClient.setQueryData(['admin-features'], (old: any) => 
        [...old].sort((a, b) => {
          const orderA = newOrder.find(n => n.id === a.id)?.order ?? a.order;
          const orderB = newOrder.find(n => n.id === b.id)?.order ?? b.order;
          return orderA - orderB;
        })
      );
      return { previousFeatures };
    },
    onError: (err, newOrder, context) => {
      // Rollback on failure
      queryClient.setQueryData(['admin-features'], context?.previousFeatures);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features'] });
      // Invalidate public cache so users see new order instantly
      queryClient.invalidateQueries({ queryKey: ['active-features'] }); 
    },
  });

  const handleDragEnd = (result: any) => {
    // Implementation assumes standard dnd library (e.g., dnd-kit or react-beautiful-dnd)
    // Extract new array order, generate { id, order } payload, and fire mutation:
    // reorderMutation.mutate(payload);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Global Service Highlights</h2>
        <button className="bg-[#006044] text-white px-4 py-2 rounded-lg text-sm font-bold">
          + Add Highlight
        </button>
      </div>

      <div className="space-y-3">
        {Array.isArray(features)  && features.map((feature: any) => (
          <div key={feature.id} className="flex items-center justify-between p-4 bg-gray-50 border rounded-xl hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing" size={20} />
              <div className="p-2 bg-white rounded-lg shadow-sm text-[#006044]">
                {/* Re-use DynamicIcon here */}
                {feature.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{feature.title}</h4>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${feature.isActive ? 'text-green-600' : 'text-red-500'}`}>
                  {feature.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
              <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}