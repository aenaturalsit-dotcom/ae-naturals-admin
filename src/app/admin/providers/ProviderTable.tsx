// src\app\admin\providers\ProviderTable.tsx 

"use client";

import React from "react";
import { Edit2, Power, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { ProviderConfig } from "@/services/admin-providers.service";

interface Props {
  providers: ProviderConfig[];
  isLoading: boolean;
  onEdit: (provider: ProviderConfig) => void;
  onToggleActive: (provider: ProviderConfig) => void;
}

export default function ProviderTable({ providers, isLoading, onEdit, onToggleActive }: Props) {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 text-gray-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#006044] rounded-full animate-spin" />
          <span className="text-sm font-bold tracking-widest uppercase">Loading Providers...</span>
        </div>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <AlertCircle size={40} className="mb-3 opacity-30 text-gray-500" />
        <p className="font-semibold text-gray-600">No providers configured yet.</p>
        <p className="text-xs mt-1">Click "Add Provider" to set up your first integration.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500 font-bold">
            <th className="px-6 py-4">Provider Configuration</th>
            <th className="px-6 py-4">Live Status</th>
            <th className="px-6 py-4">Failover Priority</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {providers.map((provider) => (
            <tr key={provider.id || provider.provider} className="hover:bg-gray-50/50 transition-colors group">
              
              {/* PROVIDER NAME */}
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${provider.isActive ? 'bg-green-500 shadow-green-500/40' : 'bg-gray-300'}`} />
                  <span className="font-black text-gray-900 uppercase tracking-widest text-sm">
                    {provider.provider}
                  </span>
                </div>
              </td>

              {/* STATUS PILL */}
              <td className="px-6 py-5 whitespace-nowrap">
                {provider.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-green-50 text-green-700 border border-green-200/50">
                    <CheckCircle2 size={14} /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-200">
                    <XCircle size={14} /> Disabled
                  </span>
                )}
              </td>

              {/* PRIORITY */}
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100/80 text-gray-700 text-xs font-black border border-gray-200/60">
                    {provider.priority}
                  </span>
                  {provider.priority === 1 && provider.isActive && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">PRIMARY</span>
                  )}
                </div>
              </td>

              {/* ACTIONS */}
              <td className="px-6 py-5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2 transition-opacity">
                  
                  {/* 🔥 EDIT BUTTON: Accurately passes the entire provider object */}
                  <button 
                    onClick={() => onEdit(provider)}
                    className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-sm transition-all active:scale-95"
                    title="Edit Configuration"
                  >
                    <Edit2 size={16} strokeWidth={2.5} />
                  </button>

                  {/* 🔥 TOGGLE ACTIVE BUTTON */}
                  <button 
                    onClick={() => onToggleActive(provider)}
                    className={`p-2.5 rounded-xl transition-all active:scale-95 hover:shadow-sm ${
                      provider.isActive 
                        ? "text-red-600 bg-red-50 hover:bg-red-100" 
                        : "text-green-600 bg-green-50 hover:bg-green-100"
                    }`}
                    title={provider.isActive ? "Deactivate Provider" : "Activate Provider"}
                  >
                    <Power size={16} strokeWidth={2.5} />
                  </button>
                  
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}