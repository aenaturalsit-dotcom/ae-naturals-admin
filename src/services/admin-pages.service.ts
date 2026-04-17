// src/services/admin-pages.service.ts
import apiClient from '@/lib/api-client';

export const adminPagesService = {
  // Get all pages for the list view
  getAllPages: async (storeId: string = 'default-store') => {
    // 🔥 Updated to /admin/pages/...
    const response = await apiClient.get(`/admin/pages/store/${storeId}`);
    return response.data || response;
  },

  // Get a single page by slug
  getPage: async (slug: string) => {
    // 🔥 Updated to /admin/pages/...
    const response = await apiClient.get(`/admin/pages/${slug}`);
    return response.data || response;
  },

  // Create or Update a page
  upsertPage: async (data: any) => {
    // 🔥 Updated to /admin/pages
    const response = await apiClient.post('/admin/pages', data);
    return response.data || response;
  },

  // Delete a page
  deletePage: async (slug: string) => {
    // 🔥 Updated to /admin/pages/...
    const response = await apiClient.delete(`/admin/pages/${slug}`);
    return response.data || response;
  },
};