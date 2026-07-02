// src/services/admin-footer.service.ts
import apiClient  from '@/lib/api-client';

export const adminFooterService = {
  /**
   * Fetch the footer layout for the current store
   */
 getFooter: async () => {
  const response = await apiClient.get('/admin/footer');
  return response.data || response;
},

  /**
   * Create or Update the footer layout (Columns and Links)
   */
  upsertFooter: async (data: { columns: any[] }) => {
  const response = await apiClient.post('/admin/footer', data);
  return response.data || response;
},
};