// src\app\admin\config\page.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminProvidersService,
  ProviderConfig,
} from "@/services/admin-providers.service";
import ProviderTable from "@/components/admin/providers/ProviderTable";
import ProviderModal from "@/components/admin/providers/ProviderModal";
import { Settings2, Plus } from "lucide-react";

type TabType = "EMAIL" | "SMS" | "PAYMENT" | "OTHER";

const TABS: { id: TabType; label: string }[] = [
  { id: "EMAIL", label: "Email Config" },
  { id: "SMS", label: "SMS Config" },
  { id: "PAYMENT", label: "Payments Config" },
];

export default function GeneralConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>("EMAIL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderConfig | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["providers", activeTab],
    queryFn: () => adminProvidersService.getProviders(activeTab),
  });

  const saveMutation = useMutation({
    mutationFn: (data: ProviderConfig) =>
      data.id
        ? adminProvidersService.updateProvider(data.id, data)
        : adminProvidersService.createProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers", activeTab] });
      setIsModalOpen(false);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (provider: ProviderConfig) =>
      adminProvidersService.updateProvider(provider.id as string, {
        isActive: !provider.isActive,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["providers", activeTab] }),
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings2 className="text-gray-400" /> General Configuration
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage API integrations, webhooks, and failover priorities.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProvider(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-rose-600/20 transition-all"
        >
          <Plus size={18} /> Add Provider
        </button>
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 overflow-x-auto pb-px">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "border-rose-500 text-rose-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Content */}
      <ProviderTable
        providers={providers}
        isLoading={isLoading}
        onEdit={(p) => {
          setEditingProvider(p);
          setIsModalOpen(true);
        }}
        onToggleActive={(p) => toggleStatusMutation.mutate(p)}
      />
      <ProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => saveMutation.mutateAsync(data)} // <-- Change to mutateAsync
        initialData={editingProvider}
        activeType={activeTab}
      />
    </div>
  );
}
