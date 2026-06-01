// src\services\admin.service.ts


import  apiClient  from '@/lib/api-client';

export const AdminBlogsService = {
  // --- BLOGS ---
  getBlogs: async (params?: any) => {
    return apiClient.get('/admin/blogs', { params });
  },

  getBlog: async (id: string) => {
    return apiClient.get(`/admin/blogs/${id}`);
  },

  createBlog: async (data: any) => {
    return apiClient.post('/admin/blogs', data);
  },

  updateBlog: async (id: string, data: any) => {
    return apiClient.put(`/admin/blogs/${id}`, data);
  },

  deleteBlog: async (id: string) => {
    return apiClient.delete(`/admin/blogs/${id}`);
  },

  // --- CATEGORIES ---
  getCategories: async () => {
    return apiClient.get('/admin/blogs/categories');
  },

  createCategory: async (data: any) => {
    return apiClient.post('/admin/blogs/categories', data);
  },

  updateCategory: async (id: string, data: any) => {
    return apiClient.put(`/admin/blogs/categories/${id}`, data);
  },

  deleteCategory: async (id: string) => {
    return apiClient.delete(`/admin/blogs/categories/${id}`);
  }
};