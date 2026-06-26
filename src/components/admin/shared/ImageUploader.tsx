// src/components/admin/shared/ImageUploader.tsx

"use client";

import React from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  maxSizeMB?: number;
  label?: string;
  className?: string;
  aspectRatio?: string;
}

export function ImageUploader({
  value,
  onChange,
  maxSizeMB = 0.5,
  label = "Upload Photo",
  className = "h-40",
}: ImageUploaderProps) {
  if (value) {
    return (
      <div className={`relative ${className} w-full rounded-3xl overflow-hidden border shadow-sm group`}>
        <img
          src={value}
          className="h-full w-full object-cover"
          alt="Uploaded"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={16} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{ multiple: false }}
      onSuccess={(result: any) => {
        if (result.event === "success") {
          const fileSizeKB = result.info.bytes / 1024;
          if (fileSizeKB > maxSizeMB * 1024) {
            alert(`Image too large. Please upload under ${maxSizeMB}MB.`);
            return;
          }
          onChange(result.info.secure_url);
        }
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className={`${className} w-full border-2 border-dashed border-zinc-300 rounded-3xl flex flex-col items-center justify-center text-zinc-400 hover:border-[#006044] hover:bg-green-50 transition-all`}
        >
          <Upload size={28} />
          <span className="text-[10px] font-black mt-3 tracking-widest uppercase">
            {label}
          </span>
        </button>
      )}
    </CldUploadWidget>
  );
}