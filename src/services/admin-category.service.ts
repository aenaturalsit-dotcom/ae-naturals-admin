// src/services/admin-category.service.ts

import apiClient from '@/lib/api-client';

export const adminCategoryService = {
  // Get all categories
  getCategories: () => apiClient.get('/admin/categories'),

  // Get single category
  getCategory: (id: string) => apiClient.get(`/admin/categories/${id}`),

  // Create category
  createCategory: (data: {
    name: string;
    slug: string;
    image?: string | null;
    icon?: string | null;
    color?: string;
    order?: number;
    isActive?: boolean;
  }) => apiClient.post('/admin/categories', data),

  // Update category
  updateCategory: (
    id: string,
    data: {
      name?: string;
      slug?: string;
      image?: string | null;
      icon?: string | null;
      color?: string;
      order?: number;
      isActive?: boolean;
    }
  ) => apiClient.put(`/admin/categories/${id}`, data),

  // Delete category
  deleteCategory: (id: string) => apiClient.delete(`/admin/categories/${id}`),

  // Reorder categories
  reorderCategories: (categoryIds: string[]) =>
    apiClient.patch('/admin/categories/reorder', { categoryIds }),
};