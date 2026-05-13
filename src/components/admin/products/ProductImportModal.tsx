// src/components/admin/products/ProductImportModal.tsx
"use client";

import React, { useState } from "react";
import { UploadCloud, X, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductImportModal({ isOpen, onClose }: ProductImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    // NOTE: Requires a future BE endpoint to process the file.
    alert("This feature requires a backend endpoint to process CSV/XLSX imports.");
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white rounded-2xl">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UploadCloud className="text-[#006044]" /> Bulk Import Products
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3 text-sm text-blue-800">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p>Upload a CSV or Excel file to bulk import or update inventory. Download our <a href="#" className="font-bold underline">Template File</a> for the correct format.</p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
              dragActive ? "border-[#006044] bg-[#006044]/5" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet size={40} className="text-[#006044]" />
                <p className="font-bold text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                <button onClick={() => setFile(null)} className="text-xs font-bold text-red-500 mt-2 hover:underline">Remove File</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-gray-50 rounded-full">
                  <UploadCloud size={32} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Drag & drop your file here</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse from your computer</p>
                </div>
                <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" id="file-upload" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                <label htmlFor="file-upload" className="mt-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer hover:bg-gray-50 shadow-sm">
                  Browse Files
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl">Cancel</button>
          <button 
            onClick={handleUpload} 
            disabled={!file}
            className="px-6 py-2 text-sm font-bold text-white bg-[#006044] rounded-xl hover:bg-[#004d36] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Start Import
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}