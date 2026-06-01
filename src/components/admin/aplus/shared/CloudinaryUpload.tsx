import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Upload, Video } from 'lucide-react';

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  resourceType?: 'image' | 'video';
  multiple?: boolean;
  buttonText?: string;
  className?: string;
}

export default function CloudinaryUpload({
  onUpload,
  resourceType = 'image',
  multiple = false,
  buttonText,
  className,
}: CloudinaryUploadProps) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{ multiple, resourceType }}
      onSuccess={(res: any) => {
        if (res.event === "success") {
          onUpload(res.info.secure_url);
        }
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className={className || "bg-zinc-200 text-zinc-700 px-5 py-3 rounded-2xl text-xs font-bold hover:bg-zinc-300 flex items-center gap-2 transition"}
        >
          {resourceType === 'video' ? <Video size={16} /> : <Upload size={16} />}
          {buttonText && <span>{buttonText}</span>}
        </button>
      )}
    </CldUploadWidget>
  );
}