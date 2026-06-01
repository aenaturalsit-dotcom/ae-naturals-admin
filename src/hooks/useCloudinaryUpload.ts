import { useState } from 'react';

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, resourceType: 'image' | 'video' = 'image') => {
    setIsUploading(true);
    try {
      // 1. Get Signature from your backend (Build this route in NestJS)
      const sigRes = await fetch('/api/admin/cloudinary/signature');
      const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'aplus-content');

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body: formData }
      );
      
      const data = await uploadRes.json();
      return data.secure_url;
    } catch (err) {
      console.error('Upload failed', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}