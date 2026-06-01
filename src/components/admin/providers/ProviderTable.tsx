// src/components/admin/providers/ProviderTable.tsx
"use client";

import React from "react";
import { ProviderConfig } from "@/services/admin-providers.service";
import { Pencil, Power, ServerOff } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { motion } from "framer-motion";

interface ProviderTableProps {
  providers: ProviderConfig[];
  isLoading: boolean;
  onEdit: (provider: ProviderConfig) => void;
  onToggleActive: (provider: ProviderConfig) => void;
}

export default function ProviderTable({
  providers,
  isLoading,
  onEdit,
  onToggleActive,
}: ProviderTableProps) {

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <Card className="p-10 flex justify-center items-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-rose-500 border-t-transparent" />
          Loading providers...
        </div>
      </Card>
    );
  }

  /* ================= EMPTY ================= */
  if (!providers.length) {
    return (
      <Card className="p-14 text-center flex flex-col items-center justify-center border-dashed bg-gray-50/40">
        <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <ServerOff className="text-gray-400" size={26} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          No Providers Found
        </h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          You haven’t configured any providers yet. Click “Add Provider” to get started.
        </p>
      </Card>
    );
  }

  /* ================= TABLE ================= */
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm rounded-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">

          {/* HEADER */}
          <thead className="bg-gray-50/70 backdrop-blur sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {providers.map((p, index) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group hover:bg-gray-50/70 transition-all"
              >

                {/* PROVIDER */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">

                    {/* AVATAR */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm group-hover:scale-105 transition">
                      {p.provider.substring(0, 2).toUpperCase()}
                    </div>

                    {/* TEXT */}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {p.provider.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.type} Integration
                      </p>
                    </div>
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    
                    {/* DOT */}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />

                    {/* BADGE */}
                    <Badge
                      variant={p.isActive ? "success" : "neutral"}
                      className="text-xs font-semibold"
                    >
                      {p.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                </td>

                {/* PRIORITY */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-200">
                    #{p.priority}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">

                    {/* TOGGLE */}
                    <button
                      onClick={() => onToggleActive(p)}
                      title={p.isActive ? "Disable Provider" : "Enable Provider"}
                      className={`p-2 rounded-lg transition-all hover:scale-110 ${
                        p.isActive
                          ? "text-amber-600 hover:bg-amber-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <Power size={18} />
                    </button>

                    {/* EDIT */}
                    <button
                      onClick={() => onEdit(p)}
                      title="Edit Configuration"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                    >
                      <Pencil size={18} />
                    </button>

                  </div>
                </td>

              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}