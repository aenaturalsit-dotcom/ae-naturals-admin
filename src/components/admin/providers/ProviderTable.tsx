// src\components\admin\providers\ProviderTable.tsx
'use client';

import React from 'react';
import { ProviderConfig } from '@/services/admin-providers.service';
import { Pencil, Power, ServerOff } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ProviderTableProps {
  providers: ProviderConfig[];
  isLoading: boolean;
  onEdit: (provider: ProviderConfig) => void;
  onToggleActive: (provider: ProviderConfig) => void;
}

export default function ProviderTable({ providers, isLoading, onEdit, onToggleActive }: ProviderTableProps) {
  if (isLoading) {
    return (
      <Card className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </Card>
    );
  }

  if (!providers.length) {
    return (
      <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ServerOff className="text-gray-400" size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Providers Found</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">You haven't configured any providers for this category yet. Click 'Add Provider' to get started.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider Info</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Failover Priority</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {providers.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      {p.provider.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.provider.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.type} Integration</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={p.isActive ? 'success' : 'neutral'}>
                    {p.isActive ? '● Active' : '○ Disabled'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-xs font-medium text-gray-700 border border-gray-200">
                    {p.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onToggleActive(p)}
                      title={p.isActive ? 'Disable Provider' : 'Enable Provider'}
                      className={`p-2 rounded-md transition-colors ${p.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      <Power size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      title="Edit Configuration"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}