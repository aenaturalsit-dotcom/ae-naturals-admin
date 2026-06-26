// src/app/admin/categories/page.tsx

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCategoryService } from '@/services/admin-category.service';
import { Trash2, Plus, Loader2, Pencil, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function CategoryPage() {
  const queryClient = useQueryClient();

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [color, setColor] = useState('#006044');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Delete state
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await adminCategoryService.getCategories();
      return Array.isArray(res) ? res : res?.data || [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => adminCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      resetForm();
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create category');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminCategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      resetForm();
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update category');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted successfully');
      setCategoryToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete category');
    },
  });

  const resetForm = () => {
    setName('');
    setSlug('');
    setImage(null);
    setColor('#006044');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (category: any) => {
    setName(category.name);
    setSlug(category.slug);
    setImage(category.image || null);
    setColor(category.color || '#006044');
    setEditingId(category.id);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const slugValue = slug || name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const data = {
      name: name.trim(),
      slug: slugValue,
      image: image,
      color: color,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingId) {
      const generatedSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#006044] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage categories for your store
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-[#006044] hover:bg-[#004d36] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Essential Oils"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006044] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="essential-oils"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006044] focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Used in URLs. Auto-generated from name if left empty.
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image / Icon
                </label>
                <div className="flex items-start gap-4">
                  <ImageUpload
                    value={image}
                    onChange={setImage}
                    label="Upload Image"
                    className="w-32 h-32"
                    maxSizeMB={1}
                  />
                  <div className="flex-1 text-sm text-gray-500 space-y-1">
                    <p>• Recommended size: 200x200px</p>
                    <p>• Supported formats: PNG, JPG, WebP</p>
                    <p>• Max file size: 1MB</p>
                  </div>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#006044"
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#006044] focus:border-transparent outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#006044] hover:bg-[#004d36] text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : editingId ? (
                    'Update Category'
                  ) : (
                    'Create Category'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Image
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Name
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Slug
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                Products
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(categories) && categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No categories created yet. Add your first category above.
                </td>
              </tr>
            ) : (
              Array.isArray(categories) && categories.map((cat: any) => (
                <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: cat.color || '#006044' }}
                      >
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 text-gray-500">{cat.slug}</td>
                  <td className="p-4 text-center text-gray-500">
                    {cat.productCount || 0}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-gray-400 hover:text-[#006044] transition-colors rounded-lg hover:bg-[#006044]/10"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete({ id: cat.id, name: cat.name })}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This will only work if no products are assigned to this category.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}