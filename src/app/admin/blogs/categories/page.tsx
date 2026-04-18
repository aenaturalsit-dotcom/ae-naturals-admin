// src\app\admin\blogs\categories\page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCategoryService } from '@/services/admin-category.service';
import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';

export default function CategoryPage() {
  const queryClient = useQueryClient();

  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  console.log("STATE categoryToDelete:", categoryToDelete);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await adminCategoryService.getCategories();
      return Array.isArray(res) ? res : res?.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("🔥 DELETE API CALLED:", id);
      return adminCategoryService.deleteCategory(id);
    },
    onSuccess: () => {
      console.log("✅ DELETE SUCCESS");
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setCategoryToDelete(null);
    },
    onError: (err) => {
      console.log("❌ DELETE ERROR:", err);
      toast.error("Delete failed");
    }
  });

  const handleDeleteClick = (e: React.MouseEvent, cat: any) => {
    e.stopPropagation();
    console.log("🟡 DELETE CLICKED:", cat);
    setCategoryToDelete({ id: cat.id, name: cat.name });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">

      <h1 className="text-xl font-bold mb-4">Categories</h1>

      <table className="w-full border">
        <tbody>
          {categories?.map((cat: any) => (
            <tr key={cat.id} className="border-b">
              <td className="p-3">{cat.name}</td>

              <td className="p-3 text-right">
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(e, cat)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ MODAL */}
      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        onClose={() => {
          console.log("🔵 MODAL CLOSED");
          setCategoryToDelete(null);
        }}
        onConfirm={() => {
          console.log("🔴 CONFIRM TRIGGERED");
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
        isLoading={deleteMutation.isPending}
      />

    </div>
  );
}