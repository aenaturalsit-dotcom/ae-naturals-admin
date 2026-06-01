// src\app\admin\blogs\edit\[id]\page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { AdminBlogsService } from '@/services/admin-blogs.service';
import BlogForm from '../../BlogForm';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AdminBlogsService.getBlog(resolvedParams.id)
      .then(setInitialData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [resolvedParams.id]);

  if (isLoading) return <div className="p-6">Loading blog details...</div>;
  if (!initialData) return <div className="p-6 text-red-500">Blog not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog: {initialData.title}</h1>
      </div>
      <BlogForm initialData={initialData} isEditing={true} />
    </div>
  );
}