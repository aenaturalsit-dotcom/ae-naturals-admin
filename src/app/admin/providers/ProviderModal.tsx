// src\app\admin\providers\ProviderModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { ProviderConfig } from "@/services/admin-providers.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProviderConfig) => Promise<void>;
  initialData: ProviderConfig | null;
  activeType: string;
}

export default function ProviderModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  activeType,
}: Props) {
  const [formData, setFormData] = useState<Partial<ProviderConfig>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [jsonError, setJsonError] = useState("");

  // Sync state whenever the modal opens or the selected provider changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Default empty state for "Add New"
        setFormData({
          // Force TypeScript to accept the passed string as the correct enum type
          type: activeType as "EMAIL" | "SMS" | "PAYMENT" | "SHIPPING",
          provider: "",
          isActive: false,
          priority: 1,
          config: "{\n  \n}",
        });
      }
      setJsonError("");
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialData, activeType]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let parsedValue: string | number | boolean = value;

    // Use type narrowing to safely access 'checked' on Input elements
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      parsedValue = e.target.checked;
    } else if (type === "number") {
      parsedValue = Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    if (name === "config") setJsonError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError("");

    // Validate JSON before sending to backend
    try {
      JSON.parse((formData.config as string) || "{}");
    } catch (err) {
      setJsonError(
        "Invalid JSON format. Please ensure all keys and string values are enclosed in double quotes.",
      );
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData as ProviderConfig);
      onClose(); // Only close on success
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save provider. Please check the network console.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? "Edit Provider" : "Add New Provider"}
            </h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
              {activeType} Configuration
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 bg-white border border-gray-200 rounded-full hover:border-gray-900 transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* BODY FORM */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Provider Name
                </label>
                <input
                  required
                  type="text"
                  name="provider"
                  value={formData.provider || ""}
                  onChange={handleChange}
                  placeholder="e.g. SENDGRID"
                  disabled={!!initialData} // Usually can't rename a provider once created
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-0 focus:border-[#006044] outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Priority Level
                </label>
                <input
                  required
                  type="number"
                  name="priority"
                  min="1"
                  value={formData.priority || 1}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-0 focus:border-[#006044] outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center justify-between">
                <span>Configuration JSON</span>
                <span className="text-[10px] text-gray-400 lowercase normal-case">
                  Must be valid JSON
                </span>
              </label>
              // Ensure the value is ALWAYS a string for the UI value=
              {typeof formData.config === "object"
                ? JSON.stringify(formData.config, null, 2)
                : formData.config || ""}
              {jsonError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5 font-medium">
                  <AlertCircle size={14} /> {jsonError}
                </p>
              )}
            </div>

            <label className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-gray-200 transition-colors">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-[#006044] focus:ring-[#006044]"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">
                  Set as Active Provider
                </span>
                <span className="text-xs text-gray-500">
                  Enable this provider for production traffic
                </span>
              </div>
            </label>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-[#006044] hover:bg-[#004d36] rounded-xl transition-all shadow-lg shadow-[#006044]/20 uppercase tracking-widest disabled:opacity-70"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isSaving ? "Saving..." : "Save Config"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
