"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminProvidersService,
  ProviderConfig,
} from "@/services/admin-providers.service";
import ProviderTable from "@/components/admin/providers/ProviderTable";
import ProviderModal from "@/components/admin/providers/ProviderModal";
import {
  Settings2,
  Plus,
  Mail,
  MessageSquare,
  CreditCard,
  Truck,
} from "lucide-react";
import SmsEventToggles from "@/components/admin/providers/SmsEventToggles";
import { motion } from "framer-motion";

type TabType = "EMAIL" | "SMS" | "PAYMENT" | "SHIPPING";

const TABS = [
  {
    id: "EMAIL",
    label: "Email Config",
    icon: Mail,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "SMS",
    label: "SMS Config",
    icon: MessageSquare,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "PAYMENT",
    label: "Payments Config",
    icon: CreditCard,
    color: "bg-green-500/10 text-green-600",
  },
  {
    id: "SHIPPING",
    label: "Shipping Config",
    icon: Truck,
    color: "bg-orange-500/10 text-orange-600",
  },
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
      {/* 🔥 HEADER */}
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
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus size={18} /> Add Provider
        </button>
      </div>

      {/* 🔥 PREMIUM TABS */}
      <div className="flex gap-3 p-2 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-sm w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className="relative px-4 py-3 rounded-xl flex items-center gap-3 group transition-all"
            >
              {/* 🔥 ACTIVE PILL */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-xl shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}

              <div className="relative flex items-center gap-3 z-10">
                {/* ICON */}
                <div
                  className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition ${
                    isActive
                      ? tab.color
                      : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                  }`}
                >
                  <Icon size={18} />
                </div>

                {/* TEXT */}
                <div className="flex flex-col items-start leading-tight">
                  <span
                    className={`text-sm font-semibold ${
                      isActive
                        ? "text-gray-900"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </span>

                  <span
                    className={`text-[10px] font-bold mt-[2px] ${"text-green-600"}`}
                  >
                    {"Active"}
                  </span>
                </div>
              </div>

              {/* ✨ HOVER GLOW */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-transparent via-gray-100/40 to-transparent" />
            </button>
          );
        })}
      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <ProviderTable
          providers={providers.filter(
            (p: ProviderConfig) => p.provider !== "EVENT_PREFERENCES",
          )}
          isLoading={isLoading}
          onEdit={(p) => {
            setEditingProvider(p);
            setIsModalOpen(true);
          }}
          onToggleActive={(p) => toggleStatusMutation.mutate(p)}
        />
      </div>

      {/* 🔥 SMS EXTRA */}
      {activeTab === "SMS" && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <SmsEventToggles />
        </div>
      )}

      {/* 🔥 MODAL */}
      <ProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data: ProviderConfig) => {
          await saveMutation.mutateAsync(data);
        }}
        initialData={editingProvider}
        activeType={activeTab}
      />
    </div>
  );
}
