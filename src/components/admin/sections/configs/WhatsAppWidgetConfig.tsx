// src/components/admin/sections/configs/WhatsAppWidgetConfig.tsx

"use client";

import React from "react";
import type { ThemeSection } from "@/lib/validators/storefront";

interface WhatsAppWidgetConfigProps {
  section: ThemeSection;
  onUpdate: (settings: Record<string, any>) => void;
}

export function WhatsAppWidgetConfig({
  section,
  onUpdate,
}: WhatsAppWidgetConfigProps) {
  const settings = section.settings || {};

  return (
    <div className="space-y-5 pt-4">
      <div>
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Enable Widget
        </label>
        <select
          className="w-full mt-2 p-4 border border-zinc-200 rounded-2xl bg-white"
          value={settings.enabled === false ? "false" : "true"}
          onChange={(e) => onUpdate({ enabled: e.target.value === "true" })}
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          WhatsApp Number
        </label>
        <input
          type="text"
          maxLength={15}
          placeholder="9242137092"
          className="w-full mt-2 p-4 border border-zinc-200 rounded-2xl bg-white"
          value={settings.phoneNumber || ""}
          onChange={(e) =>
            onUpdate({ phoneNumber: e.target.value.replace(/\D/g, "") })
          }
        />
      </div>

      <div>
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Default Message
        </label>
        <textarea
          rows={4}
          placeholder="Hi 👋 I would like to know more about your products and pricing."
          className="w-full mt-2 p-4 border border-zinc-200 rounded-2xl bg-white"
          value={settings.defaultMessage || ""}
          onChange={(e) => onUpdate({ defaultMessage: e.target.value })}
        />
      </div>
    </div>
  );
}