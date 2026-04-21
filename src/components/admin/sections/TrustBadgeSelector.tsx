// src\components\admin\sections\TrustBadgeSelector.tsx



"use client";

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import * as LucideIcons from 'lucide-react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function TrustBadgeSelector({ selectedIds = [], onChange }: Props) {
  // Fetch global master list of features/badges
  const { data: masterFeatures = [], isLoading } = useQuery({
    queryKey: ['admin-features'],
    queryFn: () => apiClient.get('/admin/features'),
  });

  const toggleBadge = (id: string) => {
    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter(idx => idx !== id)
      : [...selectedIds, id];
    onChange(nextIds);
  };

  if (isLoading) return <Loader2 className="animate-spin text-zinc-400" size={20} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-[#006044]" />
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Select Trust Badges
        </label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {Array.isArray(masterFeatures) && masterFeatures.map((feature: any) => {
          const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle;
          const isSelected = selectedIds.includes(feature.id);

          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => toggleBadge(feature.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                isSelected 
                  ? 'bg-green-50 border-[#006044] text-[#006044]' 
                  : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'
              }`}
            >
              <IconComponent size={18} strokeWidth={isSelected ? 3 : 2} />
              <span className="text-[11px] font-black uppercase tracking-tight leading-none">
                {feature.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}