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
  // 1. SMART ICON RESOLVER (Fixes the question mark issue)
  let IconComponent = (LucideIcons as any)[feature.icon];

  if (!IconComponent && feature.icon) {
    const pascalCaseName = feature.icon
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
    IconComponent = (LucideIcons as any)[pascalCaseName];
  }

  // Fallback to HelpCircle only if all lookups fail
  IconComponent = IconComponent || LucideIcons.HelpCircle;
  
  const isSelected = selectedIds.includes(feature.id);
  const badgeColor = feature.color || "#006044";

  return (
    <button
      key={feature.id}
      type="button"
      onClick={() => toggleBadge(feature.id)}
      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all text-center min-h-[110px] ${
        isSelected 
          ? 'bg-white border-[#006044] shadow-md scale-[1.02]' 
          : 'bg-zinc-50 border-transparent text-zinc-400 hover:border-zinc-200'
      }`}
    >
      {/* 2. CIRCULAR HIGHLIGHT (Matches your image design) */}
      <div 
        className="w-12 h-12 flex items-center justify-center rounded-full transition-colors"
        style={{ 
          backgroundColor: isSelected ? `${badgeColor}15` : '#e4e4e7', 
          color: isSelected ? badgeColor : '#a1a1aa' 
        }}
      >
        <IconComponent size={20} strokeWidth={isSelected ? 2.5 : 2} />
      </div>

      <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${
        isSelected ? 'text-zinc-900' : 'text-zinc-400'
      }`}>
        {feature.title}
      </span>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="bg-[#006044] rounded-full p-0.5">
            <LucideIcons.Check size={10} className="text-white" strokeWidth={4} />
          </div>
        </div>
      )}
    </button>
  );
})}
      </div>
    </div>
  );
}