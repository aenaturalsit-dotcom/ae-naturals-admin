import apiClient from '@/lib/api-client';

export const adminCategoryService = {
  getCategories: () => apiClient.get('/admin/categories'),
  createCategory: (data: { name: string; slug: string }) => 
    apiClient.post('/admin/categories', data),
  updateCategory: (id: string, data: { name: string; slug: string }) => 
    apiClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => apiClient.delete(`/admin/categories/${id}`),
};