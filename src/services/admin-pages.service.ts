// src/services/admin-pages.service.ts
import  apiClient  from '@/lib/api-client';

export const adminPagesService = {
  /**
   * Fetch all pages for the admin table (includes drafts)
   */
  getAllPages: async (storeId: string = 'default-store') => {
    const response = await apiClient.get(`/admin/pages/store/${storeId}`);
    return response.data || response;
  },

  /**
   * Fetch a single page by slug to populate the editor
   * Note: This hits the secure admin endpoint to bypass the public 'isPublished' check
   */
  getPage: async (slug: string) => {
    const response = await apiClient.get(`/admin/pages/${slug}`);
    return response.data || response;
  },

  /**
   * Create or Update a page
   */
  upsertPage: async (data: any) => {
    const response = await apiClient.post('/admin/pages', data);
    return response.data || response;
  },

  /**
   * Delete a page by its slug
   */
  deletePage: async (slug: string) => {
    const response = await apiClient.delete(`/admin/pages/${slug}`);
    return response.data || response;
  },
};