// src/components/admin/ImageUpload.tsx

'use client';

import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  className?: string;
  maxSizeMB?: number;
  aspectRatio?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  className = 'h-32 w-32',
  maxSizeMB = 1,
}: ImageUploadProps) {
  const handleUpload = (result: any) => {
    if (result.event === 'success') {
      const fileSizeMB = result.info.bytes / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        alert(`Image too large. Please upload under ${maxSizeMB}MB.`);
        return;
      }
      onChange(result.info.secure_url);
    }
  };

  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={value}
          alt="Category"
          className="w-full h-full object-cover rounded-lg border border-gray-200"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        multiple: false,
        maxFileSize: maxSizeMB * 1024 * 1024,
      }}
      onSuccess={handleUpload}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className={`${className} border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#006044] hover:bg-[#006044]/5 hover:text-[#006044] transition-all group`}
        >
          <Upload size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium mt-1">{label}</span>
        </button>
      )}
    </CldUploadWidget>
  );
}